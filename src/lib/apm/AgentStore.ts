import axios, { AxiosInstance } from 'axios';
import ServerConfig from '../../config/server.js';

class AgentStore {
	axios: AxiosInstance;
	baseURL: string = ServerConfig.apm.agentStore.baseURL;
	apiKey: string;

	constructor(baseURL?, apiKey?) {
		this.axios = axios.create();

		this.setBaseURL(baseURL);
		this.setApiKey(apiKey);
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
	async isExist(apmAgent) {
		// console.log('POST /agentstore/agent/detail', this.axios.defaults.baseURL);
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
}

const AGENT_STORE = new AgentStore();

export { AGENT_STORE, AgentStore };
