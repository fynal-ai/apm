import axios from 'axios';
import child_process from 'child_process';
import FormData from 'form-data';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

class APMAgent {
	apmAccessKey = '';
	apmBaseURL = '';
	agentStoreUsername = '';
	agentStorePassword = '';
	agentStoreSessionToken = '';
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
		if (!spec) {
			console.log('Try install agent from current folder');

			return await this.installFromAgentFolder('.');
		}

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
					Authorization: this.apmAccessKey,
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
			const folderpath = path.resolve('.');
			console.log(`Publish agent from folder ${folderpath}`);
			// parse agent.json
			const apmAgent = await fs.readJson(path.resolve(folderpath, 'agent.json'));
			console.log('Agent author', apmAgent.author);
			console.log('Agent name', apmAgent.name);
			console.log('Agent version', apmAgent.version);
			console.log('Agent executor', apmAgent.executor);

			// tar ignore .gitignore files to dist/[agentName]-v[version].tar.gz
			// folder to .tmp/[md5].tar.gz
			const tarFilePath = await this.tarAgentFolder(folderpath);
			console.log('tarFilePath', tarFilePath);

			// upload to agentstore
			const dbAgent = await this.uploadAgentToAgentStore(tarFilePath, apmAgent);

			// edit
			await this.editAgentStoreAgent(dbAgent._id, apmAgent);

			console.log('Succeed published agent to agent store');
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

			this.apmAccessKey = config?.auth?.apm?.access_key;
			this.apmBaseURL = config?.baseURL;
			this.agentStoreUsername = config?.auth?.agentstore?.username;
			this.agentStorePassword = config?.auth?.agentstore?.password;
			this.agentStoreSessionToken = config?.auth?.agentstore?.sessionToken;
		} else {
			throw new Error(
				'APM config file apm.json not found, it should be auto installed by APM (https://github.com/fynal-ai/apm) at env "APM_LOCAL_REPOSITORY_DIR". Try set env "APM_LOCAL_REPOSITORY_DIR" to you apm repository dir manual.'
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
		if (await fs.exists(spec)) {
			return (await fs.stat(spec)).isDirectory();
		}
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
			await this.installRemoteFromAgentFolder(folderpath, apmAgent);
		} else {
			// local
			await this.installLocalFromAgentFolder(folderpath, apmAgent);
		}

		console.log('Succeed installed agent');
	}
	async installLocalFromAgentFolder(folderpath, apmAgent) {
		// folder to .tmp/[md5].tar.gz
		const tarFilePath = await this.tarAgentFolder(folderpath);
		console.log('tarFilePath', tarFilePath);

		// upload to apm
		const dbAgent = await this.uploadAgentToAPM(tarFilePath, apmAgent);
		// edit
		await this.editAPMAgent(dbAgent._id, apmAgent);
	}
	async installRemoteFromAgentFolder(folderpath, apmAgent) {
		console.log('Installing remote agent...');
		await this.createAgent(apmAgent);
	}
	async installFromAgentStore(spec) {
		if (!spec) {
			throw new Error('Invalid agent spec, try "apm install <agent>:[version]"');
		}

		console.log('Installing agent from agent store');

		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agentstore/agent/install',
				headers: {
					'Content-Type': 'application/json',
					Authorization: this.apmAccessKey,
				},
				data: { spec },
				baseURL: this.apmBaseURL,
			});

			const responseJSON = response.data;
			console.log(`Succeed installed ${responseJSON.name}:${responseJSON.version}`);
			return responseJSON;
		} catch (error) {
			console.error(error.response.data.message);
			throw new Error(`Error while install apm agent: ${error.message}`);
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
	async uploadAgentToAPM(filepath, apmAgent) {
		return await this.uploadAgent('/apm/agent/upload', filepath, apmAgent);
	}
	async uploadAgentToAgentStore(filepath, apmAgent) {
		return await this.uploadAgent('/apm/agentstore/agent/upload', filepath, apmAgent);
	}
	async uploadAgent(url, filepath, apmAgent) {
		await this.loadConfig();

		try {
			const formData = new FormData();
			formData.append('author', apmAgent.author);
			formData.append('name', apmAgent.name);
			formData.append('version', apmAgent.version);
			formData.append('file', fs.createReadStream(filepath));

			const response = await axios({
				method: 'POST',
				url,
				headers: {
					Authorization: this.apmAccessKey,
				},
				data: formData,
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			if (responseJSON.error) {
				console.error(responseJSON.error, responseJSON.message);
				throw new Error(`Error while upload agent: ${responseJSON.error}`);
			}
			console.log(
				`Succeed uploaded ${responseJSON.name}` +
					(responseJSON.version ? `:${responseJSON.version}` : '')
			);
			return responseJSON;
		} catch (error) {
			console.error(error.response.data.message);
			throw new Error(`Error while upload agent: ${error.message}`);
		}
	}
	async editAPMAgent(_id, payload) {
		return await this.editAgent('/apm/agent/edit', _id, payload);
	}
	async editAgentStoreAgent(_id, payload) {
		return await this.editAgent('/apm/agentstore/agent/shelf', _id, payload);
	}
	async editAgent(url, _id, payload) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url,
				headers: {
					Authorization: this.apmAccessKey,
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
			if (responseJSON.error) {
				console.error(responseJSON.error, responseJSON.message);
				throw new Error(`Error while edit agent: ${responseJSON.error}`);
			}
			console.log(
				`Succeed edited ${responseJSON.name}` +
					(responseJSON.version ? `:${responseJSON.version}` : '')
			);
			return responseJSON;
		} catch (error) {
			console.error(error.response.data.message);
			throw new Error(`Error while edit agent: ${error.message}`);
		}
	}
	async createAgent(payload) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agent/create',
				headers: {
					Authorization: this.apmAccessKey,
				},
				data: payload,
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;

			console.log(
				`Succeed created ${responseJSON.name}` +
					(responseJSON.version ? `:${responseJSON.version}` : '')
			);
			return responseJSON;
		} catch (error) {
			console.error(error.response.data.message);
			throw new Error(`Error while create apm agent: ${error.message}`);
		}
	}
	async login(payload) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agentstore/agent/login',
				headers: {
					Authorization: this.apmAccessKey,
				},
				data: payload,
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			if (responseJSON.error) {
				console.error(responseJSON.error, responseJSON.message);
				throw new Error(`Error while login Agent Store: ${responseJSON.error}`);
			}

			console.log(`Succeed logged ${responseJSON.user.account}`);
			return responseJSON;
		} catch (error) {
			console.error(error?.response?.data?.message);
			throw new Error(`Error while login to Agent Store: ${error.message}`);
		}
	}
}

const APM_AGENT = new APMAgent();

export { APMAgent, APM_AGENT };
