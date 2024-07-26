import { APMAgent, APMAgentType } from '../../database/models/APMAgent.js';
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
	async install(payload) {
		const { spec } = payload;

		if (!spec) {
			throw new Error('spec is required');
		}

		const parsedAgentSpec = this.parseAgentSpec(spec) as APMAgentType;

		{
			const apmAgent = await this.getDetail({
				name: parsedAgentSpec.name,
				version: parsedAgentSpec.version,
			});

			if (apmAgent) {
				return;
			}

			{
				const isExistInAgentStore = await AGENT_STORE.isExist(apmAgent);

				if (isExistInAgentStore === false) {
					return;
				}
			}
		}
	}
	async isInstalled(apmAgent: APMAgentType) {
		return true;
	}
	async login(payload) {
		await AGENT_STORE.login(payload.username, payload.password);
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
