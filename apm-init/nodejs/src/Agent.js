import { APMAgent } from '@fynal-ai/apm';

class Agent {
	constructor() {
		this.apmAgent = new APMAgent();
	}
	async run(input, saveconfig) {
		console.log('Receive', input);

		const text = { text: input.prompt };

		// send to ChatGPT
		const responseJSON = {};

		const output = { text: Math.random().toString().substring(2, 15) };

		this.apmAgent.saveOutput(saveconfig, output);

		return output;
	}
}

export { Agent };
