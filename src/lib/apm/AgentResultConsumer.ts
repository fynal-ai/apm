import { APMAgentServiceRun } from '../../database/models/APMAgentServiceRun.js';

class AgentResultConsumer {
	taskList: [] = [];
	async IAmAlive(payload) {
		const apmAgentServiceRuns = await APMAgentServiceRun.find({
			remoteRunSaveResultOption: payload.option,

			status: { $in: ['ST_DONE', 'ST_FAIL'] },
		});

		return apmAgentServiceRuns;
	}
}

const AGENT_RESULT_CONSUMER = new AgentResultConsumer();

export { AGENT_RESULT_CONSUMER, AgentResultConsumer };
