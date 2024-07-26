import axios from 'axios';

class APMAgent {
	constructor() {}
	async saveOutput(saveconfig, status = { done: true }, output = {}) {
		try {
			const url = saveconfig['url'];
			const headers = saveconfig['headers'];

			const data = saveconfig['data'];
			data['output'] = output;
			data['status'] = status;

			const response = await axios({
				method: 'POST',
				url,
				headers,
				data,
			});
			const responseJSON = response.data;
			console.log('responseJSON', responseJSON);
			return responseJSON;
		} catch (error) {
			console.log('Error while saving output to apm servier: ', error);
		}
	}
	async install(spec) {
		try {
			const response = await axios({
				method: 'POST',
				url: 'http://127.0.0.1:12008/apm/agent/install',
				data: { spec },
			});

			const responseJSON = response.data;
			console.log('responseJSON', responseJSON);
			return responseJSON;
		} catch (error) {
			console.log('Error while installing apm agent: ', error);
		}
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

const APM_AGENT = new APMAgent();

export { APMAgent, APM_AGENT };
