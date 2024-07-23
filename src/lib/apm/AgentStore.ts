import axios, { AxiosInstance } from 'axios';

class AgentStore {
	axios: AxiosInstance;
	baseURL: string = 'https://agentstoreemp.baystoneai.com';
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
		if (!apiKey) {
			return;
		}

		this.apiKey = apiKey;
		this.axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
	}
	setBaseURL(baseURL: string) {
		if (!baseURL) {
			return;
		}

		this.baseURL = baseURL;
		this.axios.defaults.baseURL = baseURL;
	}
	async isExist(spec) {
		const response = await this.axios({
			method: 'POST',
			url: '/agentstore/agent/is/exist',
			data: { spec },
		});

		if (response.data) {
			return response.data;
		}

		return false;
	}
}

const AGENT_STORE = new AgentStore();

export { AGENT_STORE, AgentStore };
