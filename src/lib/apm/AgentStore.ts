import axios, { AxiosInstance } from 'axios';
import child_process from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import ServerConfig from '../../config/server.js';
import EmpError from '../EmpError.js';
import { AGENT } from './Agent.js';

class AgentStore {
	axios: AxiosInstance;
	baseURL: string = ServerConfig.apm.agentStore.baseURL;
	username: string;
	password: string;
	sessionToken: string;

	constructor(baseURL?, sessionToken?) {
		this.axios = axios.create();

		this.setBaseURL(baseURL);
		this.setSessionToken(sessionToken);
		if (!this.sessionToken) {
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
		if (response.data.error) {
			throw new EmpError(response.data.error, response.data.message);
		}
		this.username = username;
		this.password = password;
		this.setSessionToken(response.data.sessionToken);
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
		if (response.data.error) {
			throw new EmpError(response.data.error, response.data.message);
		}
		return response.data;
	}
	async upload(payload) {
		// console.log(typeof payload.file._data);

		// save to tmp
		const tmp_dir = await AGENT.getTMPWorkDirCreate();
		console.log('save to tmp', tmp_dir);
		const md5 = await AGENT.saveUploadFile(tmp_dir, payload.file);
		// read from tmp
		console.log('read from tmp', md5);
		const filename = `${md5}.tar.gz`;

		const filepath = path.join(tmp_dir, filename);
		console.log('filepath', filepath);

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

		// console.log(response.data);
		if (response.data.error) {
			throw new EmpError(response.data.error, response.data.message);
		}
		return response.data;
	}
	async search(payload) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/search',
			data: payload,
		});
		if (response.data.error) {
			throw new EmpError(response.data.error, response.data.message);
		}
		return response.data;
	}

	setSessionToken(sessionToken: string) {
		if (sessionToken) {
			this.sessionToken = sessionToken;
		}

		if (this.sessionToken) {
			this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.sessionToken}`;
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

		this.setSessionToken(auth?.agentstore?.sessionToken);
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

		Object.assign(fileJSON.auth.agentstore, {
			username: this.username,
			password: this.password,
			sessionToken: this.sessionToken,
		});

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
		if (await fs.exists(outputDir)) {
			return;
		}

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
		if (await fs.exists(agentVersionDir)) {
			console.log('rm exists agent version', agentVersionDir);
			await fs.remove(agentVersionDir);
		}
		await fs.move(folder, agentVersionDir);

		return agentVersionDir;
	}
}

const AGENT_STORE = new AgentStore();

export { AGENT_STORE, AgentStore };
