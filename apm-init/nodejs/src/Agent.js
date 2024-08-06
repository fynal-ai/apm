import { APMAgent } from '@fynal-ai/apm';

class Agent {
	constructor() {
		this.apmAgent = new APMAgent();
	}
	async run(params, saveconfig) {
		console.log('Receive', params);

		const text = { text: params.prompt };

		// send to ChatGPT
		const responseJSON = {};

		const output = { text: Math.random().toString().substring(2, 15) };

		this.apmAgent.saveOutput(saveconfig, output);

		return output;
	}
}

export { Agent };
