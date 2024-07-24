import child_process from 'child_process';
import fs from 'fs-extra';
import ServerConfig from '../../config/server.js';
import { APMAgentType } from '../../database/models/APMAgent.js';
import {
	APMAgentServiceRun,
	APMAgentServiceRunType,
} from '../../database/models/APMAgentServiceRun.js';
import { AGENT } from './Agent.js';

class AgentService {
	async run(payload) {
		const apmAgent = await AGENT.getDetail({ name: payload.name, version: payload.version });

		// 读取input
		apmAgent.config.input = payload.input;

		// 执行代码
		this.executeAgentCode(
			{
				wfId: payload.wfId,
				nodeId: payload.nodeId,
				roundId: payload.roundId,
				tenant: payload.tenant,
			},
			apmAgent,
			payload.token
		);

		return {};
	}
	async executeAgentCode(workflow, apmAgent: APMAgentType, token) {
		const author = apmAgent.author;
		const agentName = apmAgent.name.split('/').at(-1);
		const version = apmAgent.version;

		const localRepositoryDir = ServerConfig.apm.localRepositoryDir;
		const workdir = `${localRepositoryDir}/run/${workflow.wfId}/${workflow.nodeId}/${workflow.roundId}`;

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
			const pythonProgram = ServerConfig.apm.pythonProgram || 'python3.10';

			const sh = `#!/bin/bash

APM_LOCAL_REPOSITORY_DIR=${localRepositoryDir}
WORKDIR=${workdir}

mkdir -p $WORKDIR  # [runid]
cd $WORKDIR

if [ ! -d ${agentName} ]; then
  symlink-dir $APM_LOCAL_REPOSITORY_DIR/agents/${author}/${agentName}/${version} ${agentName} # pnpm add -g symlink-dir
fi

INIT_FILE=${agentName}/__init__.py
if [ ! -f $INIT_FILE ]; then
  tee ${agentName}/__init__.py <<END
END
fi

tee ${agentName}/APMAgent.py <<END
import requests


class APMAgent:
    def __init__(self):
        pass

    def save_output(self, saveconfig, status = {"done": True}, output = {}):
        """
        save output to apm server
        """
        url = saveconfig.get("url")
        headers = saveconfig.get("headers")
        
        data = saveconfig.get("data")
        data["output"] = output
        data["status"] = status

        # print("data", data)

        try:
            response = requests.post(url=url, headers=headers, json=data)
            response_json = response.json()
            print("response_json", response_json)
            return response_json
        except Exception as e:
            print("Error while saving output to apm server: ", e)
END

tee main.py <<END

import json
import os

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
			await fs.ensureDir(workdir);
			await fs.writeFile(`${workdir}/run.sh`, sh);
		}

		// 创建虚拟环境

		// 执行sh
		{
			await new Promise(async (resolve) => {
				{
					const childProcess = await child_process.exec('bash ./run.sh', {
						cwd: workdir,
					});
					childProcess.stdout.on('data', (data) => {
						// console.log(data);
					});
					childProcess.stderr.on('data', (data) => {
						console.log(data);
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
