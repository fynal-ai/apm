import axios from 'axios';
import { APMAgentType } from '../../database/models/APMAgent.js';
import EmpError from '../EmpError.js';

class RemoteAgent {
	apmAgent: APMAgentType;

	constructor(apmAgent: APMAgentType) {
		this.apmAgent = apmAgent;
	}
	async auth(payload) {
		if (this.apmAgent.endpoints.authType === 'user') {
			return await this.post(this.apmAgent.endpoints.auth, {
				username: payload.arg1,
				password: payload.arg2,
			});
		}
		if (this.apmAgent.endpoints.authType === 'idandkey') {
			return await this.post(this.apmAgent.endpoints.auth, {
				access_id: payload.arg1,
				access_key: payload.arg2,
			});
		}
		if (this.apmAgent.endpoints.authType === 'keyonly') {
			return await this.post(this.apmAgent.endpoints.auth, {
				access_key: payload.arg1,
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
		// console.log(url, data);

		try {
			if (data.access_token) {
				if (this.apmAgent.endpoints.tokenpos === 'header') {
					delete data.access_token;
				}
			}
			const response = await axios({
				method: 'POST',
				url,
				headers: data.access_token
					? {
							Authorization: `Bearer ${data.access_token}`,
						}
					: {},
				data,
			});
			return response.data;
		} catch (error) {
			// console.log(error.message);
			throw new EmpError('REMOTE_AGENT_ERROR', error.message);
		}
	}
}

export { RemoteAgent };
