import { Agent } from '../src/index.js';

const agent = new Agent();

const params = {
	style: 'ink',
	prompt: 'hello',
};
const saveconfig = {
	url: 'http://127.0.0.1:12008/apm/agentservice/result/save',
	headers: {
		Authorization:
			'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OTlmODkzMThlNjI2YTEwNWQ1NDUzZiIsImlhdCI6MTcyMTgwMTMxNX0.0JlOvoihh70nchouIa9yLFj4U04x5ppQ3qDIHewXWFA',
	},
	data: {
		tenant: '669b818c79aa01f32f312b15',
		wfId: '669b818c79aa01f32f312b13',
		nodeId: '669b8068c478890c2e76dd14',
		roundId: '0',
		name: 'fynal-ai/draw_image',
		version: '1.0.1',
		input: {
			style: '油画',
		},
		output: {},
	},
	status: {},
};

const output = await agent.run(params, saveconfig);
console.log('output', output);
