import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

class APMAgent {
	config = {}; // apm.json
	constructor() {}
	async saveOutput(saveconfig, status = { done: true }, output = {}) {
		try {
			const url = saveconfig['url'];
			const headers = saveconfig['headers'];

			const data = saveconfig['data'];
			data['output'] = output;
			data['status'] = status;

			const response = await axios({
				method: 'POST',
				url,
				headers,
				data,
			});
			const responseJSON = response.data;
			console.log('responseJSON', responseJSON);
			return responseJSON;
		} catch (error) {
			console.log('Error while saving output to apm servier: ', error);
		}
	}
	async install(spec) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agent/install',
				headers: {
					'Content-Type': 'application/json',
					Authorization: this.config?.auth?.apm?.apiKey,
				},
				data: { spec },
				baseURL: this.config?.baseURL,
			});

			const responseJSON = response.data;
			console.log(`Succeed installed ${responseJSON.name}:${responseJSON.version}`);
			return responseJSON;
		} catch (error) {
			console.log('Error while installing apm agent: ', error.message);
		}
	}
	async uninstall(spec) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agent/uninstall',
				headers: {
					'Content-Type': 'application/json',
					Authorization: this?.config?.auth?.apm?.apiKey,
				},
				data: { spec },
				baseURL: this.config?.baseURL,
			});
			const responseJSON = response.data;
			console.log(
				`Succeed uninstalled ${responseJSON.name}` +
					(responseJSON.version ? `:${responseJSON.version}` : '')
			);
			return responseJSON;
		} catch (error) {
			console.log('Error while uninstalling apm agent: ', error.message);
		}
	}
	/**
	 * load apm.json in APM_LOCAL_REPOSITORY_DIR
	 */
	async loadConfig() {
		const localRepositoryDir =
			process.env.APM_LOCAL_REPOSITORY_DIR || path.resolve(process.env.HOME, '.apm');
		const filepath = path.resolve(localRepositoryDir, 'apm.json');

		await fs.ensureDir(path.dirname(filepath));

		if ((await fs.exists(filepath)) === true) {
			this.config = await fs.readJson(filepath);
		}
	}
}

const APM_AGENT = new APMAgent();

export { APMAgent, APM_AGENT };
