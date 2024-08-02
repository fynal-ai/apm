import * as crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import JwtAuth from '../../auth/jwt-strategy.js';
import ServerConfig from '../../config/server.js';
import { APMAgent, APMAgentType } from '../../database/models/APMAgent.js';
import { User } from '../../database/models/User.js';
import EmpError from '../EmpError.js';
import { AGENT_STORE } from './AgentStore.js';

class Agent {
	constructor() {}
	async getDetail(payload): Promise<APMAgentType> {
		const detail = await this.getDBDetail(payload);

		this.replaceRemoteEndpoints(detail);

		return detail;
	}
	replaceRemoteEndpoints(detail) {
		if (detail?.executor === 'remote') {
			let baseURL = 'https://apmemp.baystoneai.com';
			detail.endpoints = {
				...detail.endpoints,

				auth: baseURL + '/apm/agentservice/auth',
				run: baseURL + '/apm/agentservice/run',
				getresult: baseURL + '/apm/agentservice/result/get',
				cleanresult: baseURL + '/apm/agentservice/result/clean',
			};
		}
	}
	async getDBDetail(payload): Promise<APMAgentType> {
		const filters = { name: payload.name };

		if (payload.version) {
			Object.assign(filters, { version: payload.version });
		}

		return await APMAgent.findOne(filters).sort({ version: -1 }).lean();
	}
	async login(payload) {
		// cache apm auth
		await this.getConfigFileCreate();
		// login to agent store
		return await AGENT_STORE.login(payload.username, payload.password);
	}
	async install(payload) {
		const { spec } = payload;

		if (!spec) {
			throw new EmpError('MISSING_AGENT_INSTALL_SPEC', 'spec is required');
		}

		const parsedAgentSpec = this.parseAgentSpec(spec);

		// Local APM Repository already has this agent
		{
			const apmAgent = await this.getDetail({
				name: parsedAgentSpec.name,
				version: parsedAgentSpec.version,
			});

			if (apmAgent) {
				console.log('Agent already exists');
				return apmAgent;
			}
		}

		// Retrive agent from Agent Store
		{
			const agentStoreAgent = await AGENT_STORE.getDetail({
				name: parsedAgentSpec.name,
				version: parsedAgentSpec.version,
			});

			if (!agentStoreAgent) {
				throw new EmpError('AGENT_NOT_EXIST_IN_AGENT_STORE', 'agent not found in Agent Store');
			}

			// console.log('Found agent in Agent Store', agentStoreAgent);
			console.log('Found agent in Agent Store', agentStoreAgent.name, agentStoreAgent.version);

			// download to agents/author/name/version
			{
				const outputDir = await AGENT_STORE.download(agentStoreAgent);

				console.log('Downloaded agent to', outputDir);
			}

			// save a APMAgent in database
			{
				const toSavedAgent = { ...agentStoreAgent };
				['_id', '__v', 'createdAt', 'updatedAt'].forEach((k) => {
					delete toSavedAgent[k];
				});

				let apmAgent = new APMAgent(toSavedAgent);
				await apmAgent.save();
				console.log('Saved agent to database');

				return apmAgent;
			}
		}
	}
	async uninstall(payload) {
		const { spec } = payload;

		if (!spec) {
			throw new EmpError('MISSING_AGENT_INSTALL_SPEC', 'spec is required');
		}

		const parsedAgentSpec = this.parseAgentSpec(spec);

		// Local APM Repository already has this agent
		{
			const apmAgent = await this.getDetail({
				name: parsedAgentSpec.name,
				version: parsedAgentSpec.version,
			});

			if (!apmAgent) {
				console.log('Agent has been uninstalled');
				return parsedAgentSpec;
			}

			// delete folder
			{
				const agentVersionDir = path.resolve(
					ServerConfig.apm.localRepositoryDir,
					'agents',
					apmAgent.name,
					apmAgent.version
				);
				await fs.remove(agentVersionDir);
				console.log('Deleted agent from local repository');
			}

			// delete database
			{
				await APMAgent.deleteOne({ _id: apmAgent._id });
				console.log('Deleted agent from database');
			}

			console.log('Agent has been uninstalled');

			return apmAgent;
		}
	}
	/**
	 * upload
	 */
	async upload(PLD) {
		// author in name
		const author = PLD.name.split('/')[0];
		{
			{
				if (author !== PLD.author) {
					throw new EmpError(
						'AUTHOR_MISSING_IN_AGENT_NAME',
						'author is not in agent name, like author "fynalai" in "fynalai/flood_control"'
					);
				}
			}
		}

		// Check if exists

		{
			const apmAgent = await APMAgent.findOne({
				author: author,
				name: PLD.name,
				version: PLD.version,
			});

			if (apmAgent) {
				return apmAgent;
			}
		}

		// save file
		{
			const tmp_dir = await this.getTMPWorkDirCreate();
			let md5 = await this.saveUploadFile(tmp_dir, PLD.file);

			// extract to user dir
			{
				const tmp_filepath = path.resolve(tmp_dir, `${md5}.tar.gz`);

				const workdir = await this.getUserWorkDirCreate(author);
				// untar
				const untarDir = path.resolve(tmp_dir, md5);
				await AGENT_STORE.untar(tmp_filepath, untarDir);

				// mv to author/name/version
				await AGENT_STORE.moveToAuthorAgentDir(untarDir, {
					author,
					name: PLD.name,
					version: PLD.version,
				});
			}

			// Create Agent
			{
				let apmAgent = new APMAgent({
					author,
					name: PLD.name,
					version: PLD.version,
					md5,
				});

				apmAgent = await apmAgent.save();

				return apmAgent;
			}
		}
	}
	async edit(PLD) {
		const apmAgent = await APMAgent.findOneAndUpdate(
			{ _id: PLD._id },
			{
				$set: {
					label: PLD.label,
					description: PLD.description,
					icon: PLD.icon,
					doc: PLD.doc,
					config: PLD.config,
					executor: PLD.executor,
				},
			},
			{
				new: true,
			}
		).lean();

		if (!apmAgent) {
			throw new EmpError('AGENT_NOT_FOUND', `Agent not found`);
		}

		return apmAgent;
	}

	async publish(payload) {
		const { file } = payload;

		const md5 = await AGENT_STORE.upload(file);
		await AGENT_STORE.create({
			name: payload.name,
			version: payload.version,
			label: payload.label,
			description: payload.description,
			icon: payload.icon,
			doc: payload.doc,
			config: payload.config,
			executor: payload.executor,
			md5,
		});
	}
	parseAgentSpec(agentSpec) {
		// jobsimi/draw-image:1.0.1
		const name = agentSpec.split(':')[0];
		const version = agentSpec.split(':')[1] || '';
		const author = name.split('/')[0];
		return {
			author,
			name,
			version,
		};
	}
	async getConfigFileCreate() {
		const filepath = path.resolve(ServerConfig.apm.localRepositoryDir, 'apm.json');

		await fs.ensureDir(path.dirname(filepath));

		// file 404
		if ((await fs.exists(filepath)) === false) {
			const access_token = await this.getAccessToken();
			await fs.writeJson(
				filepath,
				{
					baseURL: `http://127.0.0.1:${ServerConfig.hapi.port}`,
					auth: {
						apm: {
							...(access_token ? { access_token } : {}),
						},
						agentstore: {},
					},
				},
				{ spaces: 4 }
			);
		}

		return filepath;
	}
	async getAccessToken() {
		// apm user from process.env.ACCESS_ID
		const user = await User.findOne({ account: ServerConfig.apm.access_id }).sort({
			createdAt: -1,
		});
		if (!user) {
			return;
		}
		return JwtAuth.createToken({ id: user._id });
	}

	async getUserWorkDirCreate(username) {
		const sharefolder = ServerConfig.apm.localRepositoryDir;
		const workdir = path.join(sharefolder, 'agents', username);
		await fs.ensureDir(workdir);
		return workdir;
	}
	async getTMPWorkDirCreate() {
		const sharefolder = ServerConfig.apm.localRepositoryDir;
		const workdir = path.join(sharefolder, 'tmp');
		await fs.ensureDir(workdir);
		return workdir;
	}
	async saveUploadFile(workdir, file) {
		// 保存为随机文件名
		const tmp_filename = `${crypto.randomBytes(16).toString('hex')}.tar.gz`;
		const tmp_filepath = path.join(workdir, tmp_filename);
		await fs.writeFile(tmp_filepath, file._data);

		// 计算md5
		const md5 = await this.getFileMD5(tmp_filepath);

		// 重命名
		const filename = `${md5}.tar.gz`;
		const filepath = path.join(workdir, filename);
		if (await fs.exists(filepath)) {
			await fs.remove(tmp_filepath);
		} else {
			await fs.move(tmp_filepath, filepath);
		}

		return md5;
	}
	async getFileMD5(filepath): Promise<string> {
		return new Promise(async (resolve, reject) => {
			const stream = await fs.createReadStream(filepath);
			const hash = crypto.createHash('md5');
			stream.on('data', (chunk: any) => {
				hash.update(chunk);
			});
			stream.on('end', () => {
				const md5 = hash.digest('hex');
				// console.log(md5);

				resolve(md5);
			});
		});
	}
}

const AGENT = new Agent();

export { AGENT, Agent };
