import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

class APMAgent {
	apmApiKey = '';
	apmBaseURL = '';
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
					Authorization: this.apmApiKey,
				},
				data: { spec },
				baseURL: this.apmBaseURL,
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
				url: '/apm/agentstore/agent/uninstall',
				headers: {
					'Content-Type': 'application/json',
					Authorization: this.apmApiKey,
				},
				data: { spec },
				baseURL: this.apmBaseURL,
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
	async init({ author, name, executor = 'nodejs' } = {}) {
		try {
			if (!author || !name) {
				throw new Error('author and name are required');
			}
			if (name.startsWith(author + '/') === false) {
				throw new Error('name should start with author');
			}

			// copy template

			const localRepositoryDir = this.getLocalRepositoryDir();
			const tmpdir = path.resolve(localRepositoryDir, 'apm-init', executor);
			const agentName = name.split('/').at(-1);
			const agentdir = path.resolve(process.cwd(), agentName);
			await fs.ensureDir(agentdir);
			await fs.copy(tmpdir, agentdir);

			// replace {{AUTHOR}}, {{NAME}} in agent.json, package.json
			{
				for (let file of ['agent.json', 'package.json']) {
					const filePath = path.resolve(agentdir, file);
					if ((await fs.exists(filePath)) === false) {
						continue;
					}
					let fileContent = await fs.readFile(filePath, 'utf8');
					fileContent = fileContent.replace(/{{AUTHOR}}/g, author);
					fileContent = fileContent.replace(/{{NAME}}/g, agentName);
					await fs.writeFile(filePath, fileContent);
				}
			}

			console.log(`Succeed init apm agent for ${executor} in ${agentdir}`);
		} catch (error) {
			console.log('Error while init apm agent: ', error.message);
		}
	}
	async publish() {
		try {
			// tar ignore .gitignore files to dist/[agentName]-v[version].tar.gz
		} catch (error) {
			console.log('Error while publish apm agent: ', error.message);
		}
	}
	/**
	 * load apm.json in APM_LOCAL_REPOSITORY_DIR
	 */
	async loadConfig() {
		const localRepositoryDir = this.getLocalRepositoryDir();
		const filepath = path.resolve(localRepositoryDir, 'apm.json');

		await fs.ensureDir(path.dirname(filepath));

		if ((await fs.exists(filepath)) === true) {
			const config = await fs.readJson(filepath);

			this.apmApiKey = config?.auth?.apm?.apiKey;
			this.apmBaseURL = config?.baseURL;
		}
	}
	getLocalRepositoryDir() {
		return process.env.APM_LOCAL_REPOSITORY_DIR || path.resolve(process.env.HOME, '.apm');
	}
}

const APM_AGENT = new APMAgent();

export { APMAgent, APM_AGENT };
