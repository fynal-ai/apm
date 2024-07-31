import axios from 'axios';
import ServerConfig from '../../config/server.js';

class RemoteAgent {
	baseURL = 'http://127.0.0.1:12008';
	access_token = ServerConfig.apm.remoteRunAccessToken;
	constructor() {}
	async run(params) {
		// console.log("Receive", params);

		// console.log("prompt", prompt);
		return await this.sendToRun(params);
	}
	async auth(payload) {
		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/auth',
				data: payload,
				baseURL: this.baseURL,
			});
			if (response.data.access_token) {
				this.access_token = response.data.access_token;
			}
			// console.log(response.data);
			if (response.data.error) {
				throw new Error(response.data.error.message);
			}
		} catch (error) {
			throw new Error(error.message);
		}
	}
	async sendToRun(payload) {
		return await this.post('/apm/agentservice/run', payload);
	}
	async getResult(payload) {
		return await this.post('/apm/agentservice/result/get', payload);
	}
	async post(url, data) {
		try {
			const response = await axios({
				method: 'POST',
				url,
				headers: this.access_token
					? {
							Authorization: 'Bearer ' + this.access_token,
						}
					: {},
				data,
				baseURL: this.baseURL,
			});
			return response.data;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export { RemoteAgent };
