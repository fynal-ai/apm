import axios, { AxiosInstance } from 'axios';
import child_process from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import ServerConfig from '../../config/server.js';

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
	async edit(payload) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/edit',
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
	async upload(file) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/upload',
			data: { file },
		});
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
		const filepath = path.resolve(ServerConfig.apm.localRepositoryDir, 'auth.json');

		// 文件不存在
		if ((await fs.exists(filepath)) === false) {
			return;
		}

		const auth = await fs.readJson(filepath);

		this.setApiKey(auth.apiKey);
	}
	async saveToCachedAuthFile() {
		const filepath = path.resolve(ServerConfig.apm.localRepositoryDir, 'auth.json');

		await fs.ensureDir(path.dirname(filepath));

		await fs.writeJson(filepath, { apiKey: this.apiKey });
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

		// untar
		const untarDir = path.resolve(tmp_dir, md5);
		await this.untar(tmp_filepath, untarDir);

		// mv to author/name/version
		const agentName = agentStoreAgent.name.split('/').at(-1);
		const agentNameDir = path.resolve(
			localRepositoryDir,
			'agents',
			agentStoreAgent.author,
			agentName
		);
		const agentVersionDir = path.resolve(agentNameDir, agentStoreAgent.version);
		await fs.ensureDir(path.dirname(agentNameDir));
		await fs.move(untarDir, agentVersionDir);
	}
	async untar(filepath, outputDir) {
		await fs.ensureDir(outputDir);
		await child_process.exec(`tar zxvf ${filepath}`, {
			cwd: outputDir,
		});
	}
}

const AGENT_STORE = new AgentStore();

export { AGENT_STORE, AgentStore };
