import { APMAgent, APMAgentType } from '../../database/models/APMAgent.js';

class Agent {
	constructor() {}
	async getDetail(payload): Promise<APMAgentType> {
		const filters = { name: payload.name };

		if (payload.version) {
			Object.assign(filters, { version: payload.version });
		}

		return await APMAgent.findOne(filters).sort({ version: -1 }).lean();
	}
}

const AGENT = new Agent();

export { AGENT, Agent };
