import child_process from 'child_process';
import fs from 'fs-extra';
import shortuuid from 'short-uuid';
import ServerConfig from '../../config/server.js';
import { APMAgentType } from '../../database/models/APMAgent.js';
import {
	APMAgentServiceRun,
	APMAgentServiceRunType,
} from '../../database/models/APMAgentServiceRun.js';
import { AGENT } from './Agent.js';

class AgentService {
	async run(payload) {
		const runId = await this.generateRunId();
		console.log('runId', runId);

		const apmAgent = await AGENT.getDetail({ name: payload.name, version: payload.version });

		// 读取input
		apmAgent.config.input = payload.input;

		// 执行代码
		this.executeAgentCode(
			runId,
			{
				wfId: payload.wfId,
				nodeId: payload.nodeId,
				roundId: payload.roundId,
				tenant: payload.tenant,
			},
			apmAgent,
			payload.token
		);

		return { runId };
	}
	async executeAgentCode(runId, workflow, apmAgent: APMAgentType, token) {
		const author = apmAgent.author;
		const agentName = apmAgent.name.split('/').at(-1);
		const version = apmAgent.version;

		const localRepositoryDir = ServerConfig.apm.localRepositoryDir;
		const workdir = `${localRepositoryDir}/run/${runId}`;

		const saveconfig = {
			url: `http://127.0.0.1:${ServerConfig.hapi.port}/apm/agentservice/result/save`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			data: {
				runId: runId,
				tenant: workflow.tenant,
				wfId: workflow.wfId,
				nodeId: workflow.nodeId,
				roundId: workflow.roundId,
				name: apmAgent.name,
				version: apmAgent.version,
				input: apmAgent.config.input,
				output: {},
				status: {},
			},
		};

		const saveconfig = {
			url: `http://127.0.0.1:${ServerConfig.hapi.port}/apm/agentservice/result/save`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			data: {
				tenant: workflow.tenant,
				wfId: workflow.wfId,
				nodeId: workflow.nodeId,
				roundId: workflow.roundId,
				name: apmAgent.name,
				version: apmAgent.version,
				input: apmAgent.config.input,
				output: {},
				status: {},
			},
		};

		// Generate sh
		{
			const sh = await this.generateShellScript({
				workflow,
				apmAgent,
				token,
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

		// 执行sh
		{
			await new Promise(async (resolve) => {
				{
					const childProcess = await child_process.exec('bash ./run.sh', {
						cwd: workdir,
					});
					childProcess.stdout.on('data', async (data) => {
						// console.log(data);

						this.saveLog(workdir, data);
					});
					childProcess.stderr.on('data', async (data) => {
						console.log('error', data);

						this.saveLog(workdir, data);
					});
					childProcess.stdout.on('close', () => {
						console.log('child process exited');

						resolve('close');
					});
				}
			});
		}

		return {};
	}
	async generateRunId() {
		return shortuuid.generate();
	}
	async generateShellScript(payload) {
		const { executor } = payload;
		if (!executor || executor === 'python') {
			return await this.generatePythonShellScript(payload);
		}

		if (executor === 'nodejs') {
			return await this.generateNodeJSShellScript(payload);
		}
	}
	async generatePythonShellScript({
		workflow,
		apmAgent,
		token,
		author,
		agentName,
		version,
		localRepositoryDir,
		workdir,
		saveconfig,
	}) {
		const sh = `#!/bin/bash

APM_LOCAL_REPOSITORY_DIR=${localRepositoryDir}
WORKDIR=${workdir}

mkdir -p $WORKDIR
cd $WORKDIR

if [ ! -d ${agentName} ]; then
  symlink-dir $APM_LOCAL_REPOSITORY_DIR/agents/${author}/${agentName}/${version} ${agentName} # pnpm add -g symlink-dir
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
import { Agent } from "${agentName}";

const params = ${JSON.stringify(apmAgent.config.input)}

const saveconfig = ${JSON.stringify(saveconfig)}

const agent = new Agent();

agent.run(params, saveconfig)
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
	async generateNodeJSShellScript({
		workflow,
		apmAgent,
		token,
		author,
		agentName,
		version,
		localRepositoryDir,
		workdir,
		saveconfig,
	}) {
		const pythonProgram = ServerConfig.apm.pythonProgram || 'python3.10';

		const sh = `#!/bin/bash

APM_LOCAL_REPOSITORY_DIR=${localRepositoryDir}
WORKDIR=${workdir}

mkdir -p $WORKDIR
cd $WORKDIR

if [ ! -d ${agentName} ]; then
  symlink-dir $APM_LOCAL_REPOSITORY_DIR/agents/${author}/${agentName}/${version} ${agentName} # pnpm add -g symlink-dir
fi

INIT_FILE=${agentName}/__init__.py
if [ ! -f $INIT_FILE ]; then
  tee ${agentName}/__init__.py <<END
END
fi

tee main.py <<END
from ${agentName}.Agent import Agent

params = ${JSON.stringify(apmAgent.config.input)}

saveconfig = ${JSON.stringify(saveconfig)}

agent = Agent()

agent.run(params=params, saveconfig=saveconfig)
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
		const filters = {
			wfId: payload.wfId,
			nodeId: payload.nodeId,
		};

		if (payload.name) {
			Object.assign(filters, {
				name: payload.name,
			});
		}

		if (payload.roundId) {
			Object.assign(filters, {
				roundId: payload.roundId,
			});
		}

		if (payload.tenant) {
			Object.assign(filters, {
				tenant: payload.tenant,
			});
		}

		let task;

		if (payload.deleteAfter === false) {
			task = APMAgentServiceRun.findOne(filters);

			task = task.sort({ createdAt: -1 });

			return await task;
		}

		{
			task = APMAgentServiceRun.findOneAndDelete(filters);

			task = task.sort({ createdAt: -1 });

			return await task;
		}
	}
	async cleanResult(payload) {
		const filters = {
			wfId: payload.wfId,
		};

		if (payload.nodeId) {
			Object.assign(filters, {
				nodeId: payload.nodeId,
			});
		}

		if (payload.roundId) {
			Object.assign(filters, {
				roundId: payload.roundId,
			});
		}

		if (payload.tenant) {
			Object.assign(filters, {
				tenant: payload.tenant,
			});
		}

		let task;

		task = APMAgentServiceRun.deleteMany(filters);

		return await task;
	}
	async saveResult(payload) {
		const apmAgentServiceRun = await APMAgentServiceRun.create({
			...payload,
		});

		return await apmAgentServiceRun.save();
	}
}

const AGENT_SERVICE = new AgentService();

export { AGENT_SERVICE, AgentService };
