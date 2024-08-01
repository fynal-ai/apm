import axios, { AxiosInstance } from 'axios';
import child_process from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import ServerConfig from '../../config/server.js';
import { AGENT } from './Agent.js';

class AgentStore {
	axios: AxiosInstance;
	baseURL: string = ServerConfig.apm.agentStore.baseURL;
	apiKey: string;

	constructor(baseURL?, apiKey?) {
		this.axios = axios.create();

		this.setBaseURL(baseURL);
		this.setApiKey(apiKey);
		if (!this.apiKey) {
			this.readCachedAuthFile();
		}
	}

	// Agent Store's agent CRUD API:
	// - login
	// - create
	// - edit
	// - detail
	// - search
	// - delete
	// - upload
	async login(username, password) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/login',
			data: { username, password },
		});
		this.setApiKey(response.data.sessionToken);
		await this.saveToCachedAuthFile();
		return response.data;
	}
	async create(payload) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/create',
			data: {
				name: payload.name,
				version: payload.version,
				label: payload.label,
				description: payload.description,
				icon: payload.icon,
				doc: payload.doc,
				config: payload.config,
				executor: payload.executor,
				md5: payload.md5,
			},
		});
	}
	async shelf(payload) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/shelf',
			data: {
				_id: payload._id,
				label: payload.label,
				description: payload.description,
				icon: payload.icon,
				doc: payload.doc,
				config: payload.config,
				executor: payload.executor,
			},
		});
		return response.data;
	}
	async upload(payload) {
		// console.log(typeof payload.file._data);

		// save to tmp
		const tmp_dir = await AGENT.getTMPWorkDirCreate();
		const md5 = await AGENT.saveUploadFile(tmp_dir, payload.file);
		// read from tmp
		const filename = `${md5}.tar.gz`;
		const filepath = path.join(tmp_dir, filename);

		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/upload',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			data: {
				...payload,
				file: fs.createReadStream(filepath),
			},
		});
		return response.data;
	}

	setApiKey(apiKey: string) {
		if (apiKey) {
			this.apiKey = apiKey;
		}

		if (this.apiKey) {
			this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
		}
	}
	setBaseURL(baseURL: string) {
		if (baseURL) {
			this.baseURL = baseURL;
		}

		if (this.baseURL) {
			this.axios.defaults.baseURL = this.baseURL;
		}
	}
	async getDetail(apmAgent) {
		// console.log(
		// 	'POST /agentstore/agent/detail',
		// 	this.axios.defaults.baseURL,
		// 	this.axios.defaults.headers
		// );
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/detail',
			data: apmAgent,
		});

		if (response.data) {
			return response.data;
		}

		return false;
	}
	async readCachedAuthFile() {
		const filepath = path.resolve(ServerConfig.apm.localRepositoryDir, 'apm.json');

		// 文件不存在
		if ((await fs.exists(filepath)) === false) {
			return;
		}

		const { auth } = await fs.readJson(filepath);

		this.setApiKey(auth?.agentstore?.apiKey);
	}
	async saveToCachedAuthFile() {
		const filepath = path.resolve(ServerConfig.apm.localRepositoryDir, 'apm.json');

		await fs.ensureDir(path.dirname(filepath));

		let fileJSON: any = {};
		// 文件不存在
		if ((await fs.exists(filepath)) === false) {
			fileJSON = {
				auth: {
					agentstore: {},
				},
			};
		} else {
			fileJSON = await fs.readJson(filepath);
		}

		Object.assign(fileJSON.auth.agentstore, { apiKey: this.apiKey });

		await fs.writeJson(filepath, fileJSON, { spaces: 4 });
	}
	async download(agentStoreAgent) {
		const localRepositoryDir = ServerConfig.apm.localRepositoryDir;
		const { md5 } = agentStoreAgent;
		const tmp_dir = path.resolve(localRepositoryDir, 'tmp');
		const tmp_filepath = path.resolve(tmp_dir, `${md5}.tar.gz`);
		await fs.ensureDir(path.dirname(tmp_filepath));

		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/download',
			data: {
				name: agentStoreAgent.name,
				version: agentStoreAgent.version,
			},
			responseType: 'stream',
		});

		await response.data.pipe(fs.createWriteStream(tmp_filepath));

		console.log('Retrived agent data from Agent Store', tmp_filepath);

		// untar
		const untarDir = path.resolve(tmp_dir, md5);
		await this.untar(tmp_filepath, untarDir);

		// mv to author/name/version
		return await this.moveToAuthorAgentDir(untarDir, agentStoreAgent);
	}
	async untar(filepath, outputDir) {
		await fs.ensureDir(outputDir);
		console.log('untar', filepath, '=>', outputDir);
		await child_process.exec(`tar zxvf ${filepath}`, {
			cwd: outputDir,
		});
	}
	// mv to author/name/version
	async moveToAuthorAgentDir(folder, agentStoreAgent) {
		const localRepositoryDir = ServerConfig.apm.localRepositoryDir;

		const agentName = agentStoreAgent.name.split('/').at(-1);
		const agentNameDir = path.resolve(
			localRepositoryDir,
			'agents',
			agentStoreAgent.author,
			agentName
		);
		const agentVersionDir = path.resolve(agentNameDir, agentStoreAgent.version);
		await fs.ensureDir(path.dirname(agentNameDir));
		await fs.move(folder, agentVersionDir);

		return agentVersionDir;
	}
}

const AGENT_STORE = new AgentStore();

export { AGENT_STORE, AgentStore };
