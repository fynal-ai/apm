import axios from 'axios';
import child_process from 'child_process';
import FormData from 'form-data';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

class APMAgent {
	apmApiKey = '';
	apmBaseURL = '';
	constructor() {}
	async saveOutput(saveconfig, output = {}) {
		try {
			const url = saveconfig['url'];
			const headers = saveconfig['headers'];

			const data = saveconfig['data'];
			data['output'] = output;

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
		// install from agent folder
		// install from agent store

		const isAgentFolder = await this.isAgentFolder(spec);

		if (isAgentFolder) {
			return await this.installFromAgentFolder(spec);
		}

		return await this.installFromAgentStore(spec);
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
		} else {
			throw new Error(
				'APM config file apm.json not found, it should be auto installed at env "APM_LOCAL_REPOSITORY_DIR". Try set env "APM_LOCAL_REPOSITORY_DIR" to you apm repository dir manual.'
			);
		}
	}
	getLocalRepositoryDir() {
		return process.env.APM_LOCAL_REPOSITORY_DIR || path.resolve(process.env.HOME, '.apm');
	}
	async getCLIVersion() {
		// get version in package.json
		return (await fs.readJson(path.resolve(fileURLToPath(import.meta.url), '../../package.json')))
			.version;
	}
	async isAgentFolder(spec) {
		return (await fs.stat(spec)).isDirectory();
	}
	async installFromAgentFolder(folderpath) {
		folderpath = path.resolve(folderpath);
		console.log(`Installing agent from folder ${folderpath}`);

		// parse agent.json
		const apmAgent = await fs.readJson(path.resolve(folderpath, 'agent.json'));
		console.log('Agent author', apmAgent.author);
		console.log('Agent name', apmAgent.name);
		console.log('Agent version', apmAgent.version);
		console.log('Agent executor', apmAgent.executor);
		// remote agent
		if (apmAgent.executor === 'remote') {
			return await this.installRemoteFromAgentFolder(folderpath, apmAgent);
		}
		// local
		return await this.installLocalFromAgentFolder(folderpath, apmAgent);
	}
	async installLocalFromAgentFolder(folderpath, apmAgent) {
		// folder to .tmp/[md5].tar.gz
		const tarFilePath = await this.tarAgentFolder(folderpath);
		console.log('tarFilePath', tarFilePath);

		// upload to apm
		const dbAPMAgent = await this.uploadAgent(tarFilePath, apmAgent);
		// edit
		await this.editAgent(dbAPMAgent._id, apmAgent);
		console.log('Succeed install agent');
	}
	async installRemoteFromAgentFolder(folderpath, apmAgent) {
		console.log('Remote agent not supported yet');
	}
	async installFromAgentStore(spec) {
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
	async tarAgentFolder(folderpath) {
		const outputDir = path.resolve(folderpath, 'tmp');
		await fs.remove(outputDir);
		await fs.ensureDir(outputDir);

		const foldername = path.basename(folderpath);
		const outputname = `${foldername}.tar.gz`;
		const outputFilePath = path.join(outputDir, outputname);

		{
			const command = `tar zcvf ${outputFilePath} --exclude-from=.gitignore  .`;
			// console.log('command', command);
			await new Promise(async (resolve) => {
				const childProcess = await child_process.exec(command, {
					cwd: folderpath,
				});
				childProcess.stdout.on('data', async (data) => {
					// console.log('data', data);
				});
				childProcess.stderr.on('data', async (data) => {
					// console.log(data);
				});
				childProcess.stdout.on('close', async () => {
					resolve(true);
				});
			});
		}

		return outputFilePath;
	}
	async uploadAgent(filepath, apmAgent) {
		await this.loadConfig();

		try {
			const formData = new FormData();
			formData.append('author', apmAgent.author);
			formData.append('name', apmAgent.name);
			formData.append('version', apmAgent.version);
			formData.append('file', fs.createReadStream(filepath));

			const response = await axios({
				method: 'POST',
				url: '/apm/agent/upload',
				headers: {
					Authorization: this.apmApiKey,
				},
				data: formData,
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			console.log(
				`Succeed uploaded ${responseJSON.name}` +
					(responseJSON.version ? `:${responseJSON.version}` : '')
			);
			return responseJSON;
		} catch (error) {
			console.log('Error while upload apm agent: ', error.message);
		}
	}
	async editAgent(_id, payload) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agent/edit',
				headers: {
					Authorization: this.apmApiKey,
				},
				data: {
					_id,
					label: payload.label,
					description: payload.description,
					icon: payload.icon,
					doc: payload.doc,
					config: payload.config,
					executor: payload.executor,
				},
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			console.log(
				`Succeed edited ${responseJSON.name}` +
					(responseJSON.version ? `:${responseJSON.version}` : '')
			);
			return responseJSON;
		} catch (error) {
			console.log('Error while edit apm agent: ', error.message);
		}
	}
}

const APM_AGENT = new APMAgent();

export { APMAgent, APM_AGENT };
