import child_process from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import shortuuid from 'short-uuid';
import which from 'which';
import ServerConfig from '../../config/server.js';
import { APMAgent, APMAgentType } from '../../database/models/APMAgent.js';
import {
	APMAgentServiceRun,
	APMAgentServiceRunType,
} from '../../database/models/APMAgentServiceRun.js';
import EmpError from '../EmpError.js';
import { AGENT } from './Agent.js';
import { RemoteAgent } from './RemoteAgent.js';

class AgentService {
	async auth(payload) {
		const apmAgent = await AGENT.getDBDetail({ name: payload.name, version: payload.version });
		if (!apmAgent) {
			throw new EmpError('AGENT_NOT_FOUND', `Agent ${payload.name} not found`);
		}

		if (!apmAgent?.endpoints?.authType) {
			throw new EmpError(
				'AGENT_NOT_REMOTE',
				`Agent ${payload.name}:${payload.version} is not remote agent`
			);
		}

		const remoteAgent = new RemoteAgent(apmAgent);

		return await remoteAgent.auth(payload);
	}
	async run(payload) {
		// retrive agent info from database
		const apmAgent = await AGENT.getDetail({ name: payload.name, version: payload.version });
		if (!apmAgent) {
			throw new EmpError('AGENT_NOT_FOUND', `Agent ${payload.name}:${payload.version} not found`);
		}

		if (apmAgent.executor === 'remote') {
			return await this.runRemoteAgent(payload);
		}

		return await this.runLocalAgent(payload);
	}
	async runRemoteAgent(payload) {
		const apmAgent = await AGENT.getDBDetail({ name: payload.name, version: payload.version });

		const remoteAgent = new RemoteAgent(apmAgent);

		const response = await remoteAgent.run(payload);

		{
			// save result remoteRunId
			const apmAgentRun = new APMAgentServiceRun({
				remoteRunId: response.runId,
				name: apmAgent.name,
				version: apmAgent.version,

				...(await this.convertToDBRemoteRunSaveResultOption(payload.option, response.runId)),
			});
			await apmAgentRun.save();
		}

		return response;
	}
	async runLocalAgent(payload) {
		const runId = payload.runId || (await this.generateRunId());
		console.log('runId', runId);
		{
			// runId exist
			if ((await this.isRunIdExist(runId)) === true) {
				throw new EmpError('RUN_ID_EXIST', `RunId ${runId} already exist`);
			}
		}

		const apmAgent = await AGENT.getDetail({ name: payload.name, version: payload.version });
		if (!apmAgent) {
			throw new EmpError('AGENT_NOT_FOUND', `Agent ${payload.name} not found`);
		}

		// inject input
		apmAgent.config.input = payload.input;

		// save result
		await this.saveResult({
			runId,
			runMode: apmAgent.runMode,

			...(await this.convertToDBRemoteRunSaveResultOption(payload.option, runId)),
		});

		// execute agent
		{
			if (apmAgent.runMode == 'sync') {
				return await this.executeAgentCode(
					runId,

					apmAgent,
					payload.access_token,

					payload.option
				);
			}

			this.executeAgentCode(
				runId,

				apmAgent,
				payload.access_token,

				payload.option
			);
			return { runId, runMode: 'async' };
		}
	}
	async isRunIdExist(runId) {
		// check .apm/run/[runId]
		{
			const runPath = path.join(ServerConfig.apm.localRepositoryDir, 'run', runId);
			if ((await fs.exists(runPath)) === true) {
				return true;
			}
		}
		{
			const apmAgentServiceRun = await APMAgentServiceRun.findOne({ runId });
			if (apmAgentServiceRun) {
				return true;
			}
		}

		return false;
	}
	async executeAgentCode(runId, apmAgent: APMAgentType, access_token, remoteRunSaveResultOption?) {
		const author = apmAgent.author;
		const agentName = apmAgent.name.split('/').at(-1);
		const version = apmAgent.version;

		const localRepositoryDir = path.resolve(ServerConfig.apm.localRepositoryDir);
		const workdir = `${localRepositoryDir}/run/${runId}`;

		const saveconfig = {
			url: `http://127.0.0.1:${ServerConfig.hapi.port}/apm/agentservice/result/save`,
			headers: {
				'Content-Type': 'application/json',
			},
			data: {
				access_token,

				runId: runId,
				name: apmAgent.name,
				version: apmAgent.version,
				input: apmAgent.config.input,
				output: {},
			},
		};

		// Generate sh
		{
			const sh = await this.generateShellScript({
				apmAgent,
				access_token,
				author,
				agentName,
				version,
				localRepositoryDir,
				workdir,
				saveconfig,
			});

			await fs.ensureDir(workdir);
			await fs.writeFile(`${workdir}/run.sh`, sh);
		}

		// prepare input.json, saveconfig.json
		{
			console.log('prepare input.json, saveconfig.json');
			await fs.ensureDir(workdir);

			await fs.writeJSON(`${workdir}/input.json`, apmAgent.config.input);
			await fs.writeJSON(`${workdir}/saveconfig.json`, saveconfig);
		}

		// execute sh
		{
			await this.saveResult({ runId, status: 'ST_RUN' });

			let hasError = false;
			let errorMessage = '';
			await new Promise(async (resolve) => {
				{
					const childProcess = await child_process.exec('bash ./run.sh', {
						cwd: workdir,
					});
					childProcess.stdout.on('data', async (data) => {
						// console.log(data);

						this.saveLog(workdir, data);

						hasError = false;
					});
					childProcess.stderr.on('data', async (data) => {
						console.log('error', data);

						this.saveLog(workdir, data);

						hasError = true;
						errorMessage = errorMessage + data;
					});
					childProcess.stdout.on('close', async () => {
						console.log(`runId ${runId} child process closed`);

						resolve('close');
					});
				}
			});

			{
				if (hasError) {
					await this.saveResult({
						runId,
						status: 'ST_FAIL',
						output: {
							route: 'error',
							error: errorMessage,
						},
					});
				} else {
					await this.saveResult({ runId, status: 'ST_DONE' });
				}
			}
		}

		return await this.getResult({ runId, deleteAfter: false });
	}
	async generateRunId() {
		return shortuuid.generate();
	}
	async generateShellScript(payload) {
		// console.log('payload', payload);
		const { executor } = payload.apmAgent;
		// console.log('executor', executor);
		if (!executor || executor === 'python') {
			return await this.generatePythonShellScript(payload);
		}

		if (executor === 'nodejs') {
			return await this.generateNodeJSShellScript(payload);
		}
	}
	async generateNodeJSShellScript({
		apmAgent,
		access_token,
		author,
		agentName,
		version,
		localRepositoryDir,
		workdir,
		saveconfig,
	}) {
		const symlinkDirBinPath = await this.getSymlinkDirBinPath();
		console.log('symlinkDirBinPath', symlinkDirBinPath);

		const packageJSON = await fs.readJson(
			path.resolve(localRepositoryDir, 'agents', author, agentName, version, 'package.json')
		);
		const agentNameInPackageJSON = packageJSON.name;
		console.log('agentNameInPackageJSON', agentNameInPackageJSON);

		const sh = `#!/bin/bash

APM_LOCAL_REPOSITORY_DIR=${localRepositoryDir}
WORKDIR=${workdir}

mkdir -p $WORKDIR
cd $WORKDIR

if [ ! -d ${agentName} ]; then
  ${symlinkDirBinPath} $APM_LOCAL_REPOSITORY_DIR/agents/${author}/${agentName}/${version} ${agentName} # pnpm add -g symlink-dir
fi

PACKAGE_JSON_FILE=package.json
if [ ! -f $PACKAGE_JSON_FILE ]; then
  tee $PACKAGE_JSON_FILE <<END
{
  "type": "module"
}
END
  pnpm add ./${agentName};
fi

tee main.js <<END
import fs from "fs";
import { Agent } from "${agentNameInPackageJSON}";

const input = JSON.parse(fs.readFileSync('input.json', 'utf8'));

const saveconfig =JSON.parse(fs.readFileSync('saveconfig.json', 'utf8'));

const agent = new Agent();

agent.run(input, saveconfig)
END

REQUIREMENTS_FILE=${agentName}/package.json
if [ -f $REQUIREMENTS_FILE ]; then
  source ~/.nvm/nvm.sh
  nvm use 20
  NODE_MODULES_DIR=${agentName}/node_modules
  if [ ! -d $NODE_MODULES_DIR ]; then
    pnpm install --dir ${agentName} --registry https://registry.npmmirror.com;
  fi
fi

node main.js
`;
		return sh;
	}
	async generatePythonShellScript({
		apmAgent,
		access_token,
		author,
		agentName,
		version,
		localRepositoryDir,
		workdir,
		saveconfig,
	}) {
		// SyntaxError
		// from hello-apm-python.Agent import Agent
		// => from hello_apm_python.Agent import Agent
		const originAgentName = agentName;
		agentName = agentName.replace(/-/g, '_');

		const pythonProgram = ServerConfig.apm.pythonProgram || 'python3.10';

		const symlinkDirBinPath = await this.getSymlinkDirBinPath();
		console.log('symlinkDirBinPath', symlinkDirBinPath);

		const sh = `#!/bin/bash

APM_LOCAL_REPOSITORY_DIR=${localRepositoryDir}
WORKDIR=${workdir}

mkdir -p $WORKDIR
cd $WORKDIR

if [ ! -d ${agentName} ]; then
  ${symlinkDirBinPath} $APM_LOCAL_REPOSITORY_DIR/agents/${author}/${originAgentName}/${version} ${agentName} # pnpm add -g symlink-dir
fi

INIT_FILE=${agentName}/__init__.py
if [ ! -f $INIT_FILE ]; then
  tee ${agentName}/__init__.py <<END
END
fi

tee main.py <<END
import json
from ${agentName}.Agent import Agent

input = json.loads(open("input.json").read())

saveconfig = json.loads(open("saveconfig.json").read())

agent = Agent()

agent.run(input=input, saveconfig=saveconfig)
END

REQUIREMENTS_FILE=${agentName}/requirements.txt
if [ -f $REQUIREMENTS_FILE ]; then
  VENV_DIR=${agentName}/.venv
  if [ ! -d $VENV_DIR ]; then
    ${pythonProgram} -m venv $VENV_DIR --symlinks;
  fi
  source $VENV_DIR/bin/activate
  INSTALLED_FILE=$VENV_DIR/installed.txt
  if [ ! -f $INSTALLED_FILE ]; then
    ${pythonProgram} -m pip install -r $REQUIREMENTS_FILE -i https://pypi.tuna.tsinghua.edu.cn/simple/
    echo "1" > $INSTALLED_FILE
  fi
fi

${pythonProgram} main.py
`;
		return sh;
	}
	/**
	 * 日志保存
	 * @param workdir 日志目录
	 * @param data 日志
	 */
	async saveLog(workdir, data) {
		{
			data = `${new Date().toISOString()} ${data}`;
			await fs.writeFile(`${workdir}/log.txt`, data, { flag: 'a' });
		}
	}
	async getResult(payload): Promise<APMAgentServiceRunType> {
		// remote
		{
			const isRemote = await this.isRemoteRun(payload.runId);
			// try remoteRunId
			if (isRemote) {
				const apmAgent = await APMAgent.findOne({
					name: isRemote.name,
					version: isRemote.version,
				});

				// delete remoteRunId
				if (payload.deleteAfter != false) {
					await APMAgentServiceRun.findOneAndDelete({ remoteRunId: payload.runId });
				}

				const remoteAgent = new RemoteAgent(apmAgent);
				const result = await remoteAgent.getResult(payload);

				return result;
			}
		}

		const filters = { runId: payload.runId };

		let task;

		if (payload.deleteAfter === false) {
			task = APMAgentServiceRun.findOne(filters);

			task = task.sort({ createdAt: -1 });

			task = await task;

			if (!task) {
				throw new EmpError('RESULT_NOT_FOUND', 'Requested result not found: ');
			}

			return task;
		}

		{
			task = APMAgentServiceRun.findOneAndDelete(filters);

			task = task.sort({ createdAt: -1 });

			{
				task = await task;

				if (!task) {
					throw new EmpError('RESULT_NOT_FOUND', 'Requested result not found: ');
				}

				return task;
			}
		}
	}
	async cleanResult(payload) {
		// remote
		{
			const isRemote = await this.isRemoteRun(payload.runId);
			if (isRemote) {
				const apmAgent = await APMAgent.findOne({
					name: isRemote.name,
					version: isRemote.version,
				});

				// delete remoteRunId
				{
					await APMAgentServiceRun.deleteMany({ remoteRunId: payload.runId });
				}

				const remoteAgent = new RemoteAgent(apmAgent);
				return remoteAgent.cleanResult(payload);
			}
		}

		const filters = {
			runId: payload.runId,
		};

		let task;

		task = APMAgentServiceRun.deleteMany(filters);

		return await task;
	}
	async saveResult(payload) {
		// console.log('payload.status.stage', payload.status.stage);
		// create or update
		let apmAgentServiceRun = await APMAgentServiceRun.findOne({ runId: payload.runId });

		if (!apmAgentServiceRun) {
			apmAgentServiceRun = new APMAgentServiceRun(payload);

			return await apmAgentServiceRun.save();
		}

		return await APMAgentServiceRun.findOneAndUpdate(
			{ runId: payload.runId },
			{
				$set: {
					// ...apmAgentServiceRun,

					...payload,

					status: payload.status || apmAgentServiceRun.status,

					output: {
						...apmAgentServiceRun.output, // 保留中间结果

						...payload.output,
					},
				},
			},
			{
				new: true,
			}
		).lean();
	}
	async isRemoteRun(runId) {
		// try runId or remoteRunId
		{
			const apmAgentServiceRun_0 = await APMAgentServiceRun.findOne({ runId });
			const apmAgentServiceRun_1 = await APMAgentServiceRun.findOne({
				remoteRunId: runId,
			});

			// fix loop
			if (apmAgentServiceRun_1 && !apmAgentServiceRun_0) {
				// try runId
				return apmAgentServiceRun_1;
			}
		}

		return false;
	}
	async getSymlinkDirBinPath() {
		try {
			return await which('symlink-dir');
		} catch (error) {
			console.log(error);
			return '/root/.local/share/pnpm/symlink-dir';
		}
	}
	async convertToDBRemoteRunSaveResultOption(remoteRunSaveResultOption, runId?) {
		if (remoteRunSaveResultOption?.callback) {
			return {
				remoteRunSaveResultOption: {
					url: remoteRunSaveResultOption.callback,
					headers: {},
					data: {
						runId,
						output: {},
					},
				},
			};
		}
		return {};
	}
}

const AGENT_SERVICE = new AgentService();

export { AGENT_SERVICE, AgentService };
