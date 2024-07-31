import axios from 'axios';

class APMAgent {
	baseURL = '';
	access_token = '';
	constructor() {}
	async run(params) {
		this.baseURL = params.baseURL;
		// console.log("Receive", params);

		// console.log("prompt", prompt);
		await this.auth({
			access_id: params.access_id,
			access_key: params.access_key,
		});

		return await this.sendToRun(params.input);
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
		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agentservice/run',
				headers: this.access_token
					? {
							Authorization: 'Bearer ' + this.access_token,
						}
					: {},
				data: payload,
				baseURL: this.baseURL,
			});
			return response.data;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export { APMAgent };
