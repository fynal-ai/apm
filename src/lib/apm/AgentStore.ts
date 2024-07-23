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
