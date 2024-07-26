import { APMAgent, APMAgentType } from '../../database/models/APMAgent.js';
import EmpError from '../EmpError.js';
import { AGENT_STORE } from './AgentStore.js';

class Agent {
	constructor() {}
	async getDetail(payload): Promise<APMAgentType> {
		const filters = { name: payload.name };

		if (payload.version) {
			Object.assign(filters, { version: payload.version });
		}

		return await APMAgent.findOne(filters).sort({ version: -1 }).lean();
	}
	async login(payload) {
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
}

const AGENT = new Agent();

export { AGENT, Agent };
