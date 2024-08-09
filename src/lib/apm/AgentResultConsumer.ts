import axios from 'axios';
import {
	APMAgentServiceRun,
	APMAgentServiceRunType,
} from '../../database/models/APMAgentServiceRun.js';

class AgentResultConsumer {
	runIds: string[] = [];
	async IAmAlive(payload) {
		const apmAgentServiceRuns = await APMAgentServiceRun.find({
			'remoteRunSaveResultOption.url': payload.option.callback,

			status: { $in: ['ST_DONE', 'ST_FAIL'] },
		});

		//
		for (const apmAgentServiceRun of apmAgentServiceRuns) {
			if (this.runIds.includes(apmAgentServiceRun._id.toString())) {
				continue;
			}
			this.runIds.push(apmAgentServiceRun._id.toString());

			const response = await this.saveOutputToCallbackServer(apmAgentServiceRun);

			if (response === 'Acknowledged') {
				// delete apmAgentServiceRun
				// await APMAgentServiceRun.deleteOne({ _id });
				// console.log(data.runId, 'Delete apmAgentServiceRun');
				this.runIds.splice(this.runIds.indexOf(apmAgentServiceRun._id.toString()), 1);
			}
		}

		return apmAgentServiceRuns.length;
	}

	async saveOutputToCallbackServer(apmAgentServiceRun: APMAgentServiceRunType) {
		const config = apmAgentServiceRun.remoteRunSaveResultOption;
		const output = apmAgentServiceRun.output;
		const _id = apmAgentServiceRun._id;

		// save output to run callback server
		{
			if (config?.url) {
				console.log('Try save output to callback server', config.url);
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
					console.log(data.runId, 'Callback server responseJSON', responseJSON);

					{
						if (!responseJSON) {
							console.log(data.runId, 'Callback server responseJSON is empty');
							return;
						}
						if (responseJSON.error) {
							console.log(data.runId, 'Callback server responseJSON error', responseJSON.error);
							return;
						}

						return responseJSON;
					}
				} catch (error) {
					console.log(
						config?.data?.runId,
						'Error while saving output to callback servier: ',
						error.message
					);
				}
			}
		}
	}
}

const AGENT_RESULT_CONSUMER = new AgentResultConsumer();

export { AGENT_RESULT_CONSUMER, AgentResultConsumer };
