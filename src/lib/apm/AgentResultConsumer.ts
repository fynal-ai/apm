import axios from 'axios';
import {
	APMAgentServiceRun,
	APMAgentServiceRunType,
} from '../../database/models/APMAgentServiceRun.js';

class AgentResultConsumer {
	savingIds: string[] = [];
	async IAmAlive(payload) {
		const apmAgentServiceRuns = await APMAgentServiceRun.find({
			'remoteRunSaveResultOption.url': payload.option.callback,

			status: { $in: ['ST_DONE', 'ST_FAIL'] },
		});

		// 并发保存
		this.multiSave(apmAgentServiceRuns);

		return {
			total: apmAgentServiceRuns.length,
		};
	}
	async multiSave(apmAgentServiceRuns: APMAgentServiceRunType[]) {
		for (const apmAgentServiceRun of apmAgentServiceRuns) {
			await this.singleSave(apmAgentServiceRun);
		}
	}
	async singleSave(apmAgentServiceRun: APMAgentServiceRunType) {
		const _id = apmAgentServiceRun._id.toString();
		// avoid duplicate save
		if (this.savingIds.includes(_id)) {
			return;
		}
		this.savingIds.push(_id);

		const response = await this.saveOutputToCallbackServer(
			apmAgentServiceRun.remoteRunSaveResultOption,
			apmAgentServiceRun.output
		);

		// always delete _id after save, even if response is not 'Acknowledged', avoid next IAmAlive cannot save it
		this.savingIds.splice(this.savingIds.indexOf(_id), 1);

		if (response === 'Acknowledged') {
			// delete apmAgentServiceRun
			await APMAgentServiceRun.deleteOne({ _id });
			console.log('Deleted apmAgentServiceRun');
		}
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
