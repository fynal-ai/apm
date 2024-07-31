import axios from 'axios';
import { APMAgentType } from '../../database/models/APMAgent';

class RemoteAgent {
	apmAgent: APMAgentType;

	constructor(apmAgent: APMAgentType) {
		this.apmAgent = apmAgent;
	}
	async auth(payload) {
		if (this.apmAgent.endpoints.authType === 'user') {
			return await this.post(this.apmAgent.endpoints.auth, {
				username: payload.username,
				password: payload.password,
			});
		}
		if (this.apmAgent.endpoints.authType === 'idandkey') {
			return await this.post(this.apmAgent.endpoints.auth, {
				access_id: payload.access_id,
				access_key: payload.access_key,
			});
		}
		if (this.apmAgent.endpoints.authType === 'keyonly') {
			return await this.post(this.apmAgent.endpoints.auth, {
				access_key: payload.access_key,
			});
		}
	}
	async run(payload) {
		return await this.sendToRun(payload);
	}
	async sendToRun(payload) {
		return await this.post(this.apmAgent.endpoints.run, payload);
	}
	async getResult(payload) {
		return await this.post(this.apmAgent.endpoints.getresult, payload);
	}
	async cleanResult(payload) {
		return await this.post(this.apmAgent.endpoints.cleanresult, payload);
	}
	async post(url, data) {
		try {
			const response = await axios({
				method: 'POST',
				url,
				data,
			});
			return response.data;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export { RemoteAgent };
