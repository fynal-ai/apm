import { Agent } from '../src/index.js';

const agent = new Agent();

const input = {
	style: 'ink',
	prompt: 'hello',
};

const output = await agent.run(input);
console.log('output', output);
