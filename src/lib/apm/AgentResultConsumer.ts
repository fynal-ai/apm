import axios from 'axios';
import { APMAgentServiceRun } from '../../database/models/APMAgentServiceRun.js';

class AgentResultConsumer {
	async IAmAlive(payload) {
		const apmAgentServiceRuns = await APMAgentServiceRun.find({
			'remoteRunSaveResultOption.url': payload.option.callback,

			status: { $in: ['ST_DONE', 'ST_FAIL'] },
		});

		//
		for (const apmAgentServiceRun of apmAgentServiceRuns) {
			await this.saveOutputToCallbackServer(
				apmAgentServiceRun.remoteRunSaveResultOption,
				apmAgentServiceRun.output
			);
		}

		return apmAgentServiceRuns;
	}

	async saveOutputToCallbackServer(config, output) {
		// save output to run callback server
		{
			if (config?.url) {
				console.log('Try save output to callback server');
				try {
					const url = config['url'];
					const headers = config['headers'];

					const data = config['data'];
					data['output'] = output;

					const response = await axios({
						method: 'POST',
						url,
						headers,
						data,
					});
					const responseJSON = response.data;
					console.log('Callback server responseJSON', responseJSON);
				} catch (error) {
					console.log('Error while saving output to callback servier: ', error);
				}
			}
		}
	}
}

const AGENT_RESULT_CONSUMER = new AgentResultConsumer();

export { AGENT_RESULT_CONSUMER, AgentResultConsumer };
