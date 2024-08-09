import axios from 'axios';
import { APMAgentServiceRun } from '../../database/models/APMAgentServiceRun.js';

class AgentResultConsumer {
	savingIds: string[] = [];
	async IAmAlive(payload) {
		const apmAgentServiceRuns = await APMAgentServiceRun.find({
			'remoteRunSaveResultOption.url': payload.option.callback,

			status: { $in: ['ST_DONE', 'ST_FAIL'] },
		});

		//
		for (const apmAgentServiceRun of apmAgentServiceRuns) {
			const _id = apmAgentServiceRun._id.toString();
			if (this.savingIds.includes(_id)) {
				continue;
			}
			this.savingIds.push(_id);

			const response = await this.saveOutputToCallbackServer(
				apmAgentServiceRun.remoteRunSaveResultOption,
				apmAgentServiceRun.output
			);

			if (response === 'Acknowledged') {
				this.savingIds.splice(this.savingIds.indexOf(_id), 1);
				// delete apmAgentServiceRun
				await APMAgentServiceRun.deleteOne({ _id });
				console.log('Deleted apmAgentServiceRun');
			}
		}

		return {
			total: apmAgentServiceRuns.length,
		};
	}

	async saveOutputToCallbackServer(config, output) {
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
