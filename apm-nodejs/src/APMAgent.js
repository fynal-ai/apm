import axios from 'axios';
import child_process from 'child_process';
import CLITable from 'cli-table3';
import FormData from 'form-data';
import fs from 'fs-extra';
import Joi from 'joi';
import path from 'path';
import { fileURLToPath } from 'url';

class APMAgent {
	apmAccessToken = '';
	apmBaseURL = '';
	agentStoreUsername = '';
	agentStorePassword = '';
	agentStoreSessionToken = '';

	regex = {
		author: /^[a-zA-Z][a-zA-Z0-9_\-]{2,28}[a-zA-Z0-9]$/,
		password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/,
		agentName: /^[a-zA-Z][a-zA-Z0-9_\-]{0,28}[a-zA-Z0-9]?$/,
	};
	constructor() {}
	/**
	 * save output by saveconfig when saveconfig is setted, or print output to console
	 * @param {Object} saveconfig
	 * @param {Object} output
	 */
	async saveOutput(saveconfig, output = {}) {
		// print output in console
		if (!saveconfig) {
			console.log('output', output);
			return;
		}

		// save output to apm server
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

			// recursive find parent folder which has agent.json
			let folderpath = await this.recursiveFindAgent('.');

			if (!folderpath) {
				console.log('Current folder is not an agent folder.');
				return;
			}

			return await this.installFromAgentFolder(folderpath);
		}

		const isAgentFolder = await this.isAgentFolder(spec);

		if (isAgentFolder) {
			return await this.installFromAgentFolder(spec);
		}

		return await this.installFromAgentStore(spec);
	}

	async uninstall(spec) {
		// Try uninstall current folder
		if (!spec) {
			console.log('Try uninstall agent from current folder');

			// recursive find parent folder which has agent.json
			let folderpath = await this.recursiveFindAgent('.');

			if (!folderpath) {
				console.log('Current folder is not an agent folder.');
				return;
			}

			console.log(`Uninstalling agent in folder ${folderpath}`);

			const agentJSONFilePath = path.resolve(folderpath, 'agent.json');

			// parse agent.json
			const apmAgent = await this.parseAgentJSONFile(agentJSONFilePath);

			spec = `${apmAgent.name}:${apmAgent.version}`;
		}

		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agentstore/agent/uninstall',
				headers: {
					'Content-Type': 'application/json',
					Authorization: this.apmAccessToken,
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
	async inspect(spec) {
		// Try inspect agent
		if (!spec) {
			console.log('Agent spec is required. Try "apm --help"');
			return;
		}

		console.log(`Try inspect agent ${spec} in APM Server`);

		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agent/inspect',
				headers: {
					'Content-Type': 'application/json',
					Authorization: this.apmAccessToken,
				},
				data: { spec },
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			console.dir(responseJSON, { depth: null, colors: true });
			return responseJSON;
		} catch (error) {
			console.log('Error while inspect apm agent: ', error.message);
		}
	}
	async list(payload) {
		await this.loadConfig();

		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agent/search',
				headers: {
					Authorization: this.apmAccessToken,
				},
				data: payload,
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			if (responseJSON.error) {
				console.error(responseJSON.error, responseJSON.message);
				throw new Error(`Error while list apm agent: ${responseJSON.error}`);
			}
			// console.log(responseJSON)
			// [{
			// 	_id: '66b18cdfee884b6462f373f4',
			// 	author: 'jobsimi',
			// 	version: '0.0.1',
			// 	name: 'jobsimi/HelloAPM',
			// 	label: 'HelloPythonAgent',
			// 	description: 'APM python agent template',
			// 	icon: 'https://bonsai.baystoneai.com/favicon.png',
			// 	doc: 'Markdown doc',
			// 	config: { input: [Object], output: [Object] },
			// 	executor: 'python',
			// 	md5: 'cc033e0df3bee6ddfdb74361f25d5a48',
			// 	createdAt: '2024-08-06T02:39:27.342Z',
			// 	updatedAt: '2024-08-06T02:39:27.342Z',
			// 	__v: 0
			// }]
			// format to |name|author|version|description|
			console.log(`List of installed APM agents (${responseJSON.length}):`);
			const columns = ['name', 'author', 'version', 'executor', 'updatedAt', 'description'];
			await this.beautifyPrintList(
				responseJSON.map((a, index) => {
					return {
						'': index,
						...columns.reduce((previousValue, currentValue) => {
							previousValue[currentValue] = a[currentValue];
							return previousValue;
						}, {}),
					};
				})
			);

			return responseJSON;
		} catch (error) {
			console.error(error?.response?.data?.message);
			throw new Error(`Error while list apm agent: ${error.message}`);
		}
	}
	async init({ author, name, executor = 'nodejs', apikey_provider = 'me', force = false } = {}) {
		try {
			console.log(
				`Try init a agent for author ${author}, name ${name}, executor ${executor}, apikey_provider: ${apikey_provider} `
			);
			if (!author || !name) {
				throw new Error('author and name are required');
			}
			if (name.startsWith(author + '/') === false) {
				throw new Error('name should start with author');
			}

			// Retrive apm-init template from apm server
			// untar <taskId>.tar.gz to agent folder
			// remove .tar.gz
			{
				const agentName = this.parseAgentName(name);
				const agentdir = path.resolve(process.cwd(), agentName);

				// if exists, error
				if ((await fs.exists(agentdir)) && force === false) {
					throw new Error(
						`Agent ${agentName} already exists in ${agentdir}. Try --force to init anyway.`
					);
				}

				{
					const tmp_filepath = path.resolve(process.cwd(), `${agentName}.tar.gz`);

					const response = await axios({
						method: 'POST',
						url: '/apm/agent/init',
						data: { author, name, executor, apikey_provider },
						responseType: 'stream',

						baseURL: this.apmBaseURL,
					});

					await response.data.pipe(fs.createWriteStream(tmp_filepath));

					console.log(`Retrived agent init template from apm server to`, tmp_filepath);

					// untar <taskId>.tar.gz to agent folder
					await this.untar(tmp_filepath, agentdir);

					// remove .tar.gz
					await fs.remove(tmp_filepath);
				}

				console.log('Succeed init agent', agentdir);
			}
		} catch (error) {
			console.log('Error while init apm agent: ', error.message);
		}
	}

	async publish() {
		try {
			// recursive find parent folder which has agent.json
			let folderpath = await this.recursiveFindAgent('.');

			if (!folderpath) {
				console.log('folderpath', folderpath);
				console.log('Current folder is not an agent folder.');
				return;
			}

			console.log(`Publish agent from folder ${folderpath}`);
			// parse agent.json
			const agentJSONFilePath = path.resolve(folderpath, 'agent.json');
			const apmAgent = await this.parseAgentJSONFile(agentJSONFilePath);

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
	async search(payload) {
		try {
			const response = await axios({
				method: 'POST',
				url: '/apm/agentstore/agent/search',
				data: payload,
				baseURL: this.apmBaseURL,
			});
			const responseJSON = response.data;
			if (responseJSON.error) {
				console.error(responseJSON.error, responseJSON.message);
				throw new Error(`Error while search Agent Store agents: ${responseJSON.error}`);
			}
			// console.log(responseJSON)
			console.log(`List of Agent Store agents (${responseJSON.length}):`);
			const columns = ['name', 'author', 'version', 'executor', 'updatedAt', 'description'];
			await this.beautifyPrintList(
				responseJSON.map((a, index) => {
					return {
						'': index,
						...columns.reduce((previousValue, currentValue) => {
							previousValue[currentValue] = a[currentValue];
							return previousValue;
						}, {}),
					};
				})
			);

			return responseJSON;
		} catch (error) {
			console.error(error?.response?.data?.message);
			throw new Error(`Error while search Agent Store agents: ${error.message}`);
		}
	}
	// TODO
	async run(spec, { input } = {}) {
		//   apm run
		//   apm run --input <input.json>
		//   apm run -i <input.json>
		//   apm run <name>[:version]
		//   apm run <name>[:version] --input <input.json>
		//   apm run <name>[:version> -i <input.json>

		if (!spec) {
			console.log('Try run agent from current folder');
			return await this.runFromAgentFolder(spec, { input });
		}

		const isAgentFolder = await this.isAgentFolder(spec);

		if (isAgentFolder) {
			return await this.runFromAgentFolder(spec, { input });
		}

		return await this.runFromAgentStore(spec, { input });
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

			this.apmAccessToken = config?.auth?.apm?.access_token;
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
		const agentJSONFilePath = path.resolve(folderpath, 'agent.json');
		const apmAgent = await this.parseAgentJSONFile(agentJSONFilePath);
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
					Authorization: this.apmAccessToken,
				},
				data: { spec },
				baseURL: this.apmBaseURL,
			});

			const responseJSON = response.data;
			if (responseJSON.error) {
				console.error(responseJSON.error, responseJSON.message);
				throw new Error(`Error while upload agent: ${responseJSON.error}`);
			}
			console.log(`Succeed installed ${responseJSON.name}:${responseJSON.version}`);
			return responseJSON;
		} catch (error) {
			console.error(error?.response?.data?.message);
			throw new Error(`Error while install apm agent: ${error.message}`);
		}
	}
	async tarAgentFolder(folderpath) {
		const outputDir = path.resolve(folderpath, 'tmp');
		if (await fs.exists(outputDir)) {
			await fs.emptyDir(outputDir);
		} else {
			await fs.ensureDir(outputDir);
		}

		const foldername = path.basename(folderpath);
		const outputname = `${foldername}.tar.gz`;
		const outputFilePath = path.join(outputDir, outputname);

		{
			// const command = `tar zcvf ${outputFilePath} --exclude-from=.gitignore --options '!timestamp'  .`;
			const command = `tar zcvf ${outputFilePath} --exclude-from=.gitignore .`;
			console.log('command', command);
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
	async untar(filepath, outputDir) {
		if (await fs.exists(outputDir)) {
			await fs.emptyDir(outputDir);
		} else {
			await fs.ensureDir(outputDir);
		}

		console.log('untar', filepath, '=>', outputDir);

		{
			const command = `tar zxvf ${filepath}`;
			// console.log('command', command);
			await new Promise(async (resolve) => {
				const childProcess = await child_process.exec(command, {
					cwd: outputDir,
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
					Authorization: this.apmAccessToken,
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
			console.error(error?.response?.data?.message);
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
					Authorization: this.apmAccessToken,
				},
				data: {
					_id,
					label: payload.label,
					description: payload.description,
					icon: payload.icon,
					doc: payload.doc,
					config: payload.config,
					executor: payload.executor,
					apikey_provider: payload.apikey_provider,
					runMode: payload.runMode,
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
			console.error(error?.response?.data?.message);
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
					Authorization: this.apmAccessToken,
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
			console.error(error?.response?.data?.message);
			throw new Error(`Error while create apm agent: ${error.message}`);
		}
	}
	async login(payload) {
		await this.loadConfig();

		try {
			const postData = {
				method: 'POST',
				url: '/apm/agentstore/agent/login',
				data: payload,
				baseURL: this.apmBaseURL,
			};
			// console.log('postData', postData);
			const response = await axios(postData);
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
	async recursiveFindAgent(folderpath) {
		// recursive find parent folder which has agent.json
		folderpath = path.resolve(folderpath);
		// console.log('folderpath', folderpath);
		while (folderpath !== '/') {
			const agentJSONFilePath = path.resolve(folderpath, 'agent.json');
			if ((await fs.exists(agentJSONFilePath)) === true) {
				console.log(`Found agent.json in folder ${folderpath}`);
				return folderpath;
			}
			folderpath = path.resolve(folderpath, '..');
		}
	}
	async beautifyPrintList(list) {
		if (!list || Array.isArray(list) === false || list.length === 0) {
			console.log('No data.');
			return;
		}

		const table = new CLITable({
			head: Object.keys(list[0]),
			// colWidths: [100, 200]
		});

		// table is an Array, so you can `push`, `unshift`, `splice` and friends
		for (let i = 0; i < list.length; i = i + 1) {
			table.push(Object.values(list[i]));
		}

		console.log(table.toString());
	}
	async parseAgentJSONFile(agentJSONFilePath) {
		// parse agent.json
		const apmAgent = await fs.readJson(agentJSONFilePath);
		console.log('Agent author', apmAgent.author);
		console.log('Agent name', apmAgent.name);
		console.log('Agent version', apmAgent.version);
		console.log('Agent executor', apmAgent.executor);
		console.log('Agent runMode', apmAgent.runMode);

		// validate
		{
			// author
			{
				const valid = this.validateAuthor(apmAgent.author);
				if (valid !== true) {
					throw new Error(`Agent author ${apmAgent.author} is invalid: ${valid}`);
				}
			}
			{
				const agentName = this.parseAgentName(apmAgent.name);
				const valid = this.validateAgentName(agentName);
				if (valid !== true) {
					throw new Error(
						`Agent name ${agentName} without author ${apmAgent.author} is invalid: ${valid}`
					);
				}
			}
		}

		return apmAgent;
	}
	parseAgentName(name) {
		return name.substring(name.indexOf('/') + 1);
	}
	validateAuthor(input) {
		const schema = Joi.string().regex(this.regex.author).lowercase().required().label('author');
		const e = schema.validate(input).error;
		if (e?.message) {
			return e.message;
		}
		return true;
	}
	validateAgentName(input) {
		const schema = Joi.string().regex(this.regex.agentName).required().label('name');
		const e = schema.validate(input).error;
		if (e?.message) {
			return e.message;
		}
		return true;
	}
	validateUsername(input) {
		const schema = Joi.string().regex(this.regex.author).lowercase().required().label('username');
		const e = schema.validate(input).error;
		if (e?.message) {
			return e.message;
		}
		return true;
	}
	validatePassword(input) {
		const schema = Joi.string().regex(this.regex.password).required().label('password');
		const e = schema.validate(input).error;
		if (e?.message) {
			return e.message;
		}
		return true;
	}
}

const APM_AGENT = new APMAgent();

export { APMAgent, APM_AGENT };
