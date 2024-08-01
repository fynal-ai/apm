import { APMAgent } from '@jobsimi/apm';

class Agent {
	constructor() {
		this.apmAgent = new APMAgent();
	}
	async run(params, saveconfig) {
		console.log('Receive', params);

		const text = { text: params.prompt };

		// send to ChatGPT
		const responseJSON = {};

		const output = { text: '' };

		this.apmAgent.saveOutput(saveconfig, output);

		return output;
	}
}

export { Agent };
