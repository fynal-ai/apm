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

		{
			const isInstalled = await this.isInstalled(spec);

			if (isInstalled === true) {
				return;
			}

			{
				const isExistInAgentStore = await AGENT_STORE.isExist(spec);

				if (isExistInAgentStore === false) {
					return;
				}
			}
		}
	}
	async isInstalled(spec) {
		return true;
	}
}

const AGENT = new Agent();

export { AGENT, Agent };
