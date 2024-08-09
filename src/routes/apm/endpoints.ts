'use strict';
import Joi from 'joi';
import { PAGING_PAYLOAD } from '../../lib/apm/index.js';
import Handlers from './handlers.js';

const internals = {
	endpoints: [
		{
			method: 'POST',
			path: '/apm/auth',
			handler: Handlers.APM.Auth,
			config: {
				tags: ['api'],
				description: 'Get access_token',
				notes: 'Provide access_id, access_key',
				validate: {
					payload: {
						access_id: Joi.string().required().description('access_id'),
						access_key: Joi.string().required().description('access_key'),
					},
					validator: Joi,
				},
				plugins: {
					'hapi-swagger': {
						responses: {
							200: {
								schema: Joi.string().required().description('access_token'),
							},
						},
					},
				},
			},
		},

		{
			method: 'POST',
			path: '/apm/agent/search',
			handler: Handlers.APM.Agent.Search,
			config: {
				tags: ['api'],
				description: 'Search installed agents in APM',
				notes: 'Search agents',
				auth: 'token',
				validate: {
					payload: {
						...PAGING_PAYLOAD,

						q: Joi.string().allow('').description('query'),
						executor: Joi.string().allow('').description('agent executor'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/detail',
			handler: Handlers.APM.Agent.Detail,
			config: {
				tags: ['api'],
				description: 'Agent detail',
				notes: 'By name',
				auth: 'token',
				validate: {
					payload: {
						name: Joi.string().required().description('agent name'),
						version: Joi.string().allow('').description('agent version'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/create',
			handler: Handlers.APM.Agent.Create,
			config: {
				// Include this API in swagger documentation
				// tags: ['api'],
				description: 'Register agent to APM',
				notes: 'Provide agent info',
				auth: 'token',
				validate: {
					payload: {
						author: Joi.string().required().description('author'),
						version: Joi.string().required().description('version'),
						name: Joi.string().required().description('name'),
						label: Joi.string().required().description('label'),
						description: Joi.string().description('description'),
						icon: Joi.string().description('icon'),
						doc: Joi.string().description('doc'),
						config: {
							input: Joi.object().required().description('input params'),
							output: Joi.object().required().description('output example'),
						},
						executor: Joi.string().description('executor'),
						executorConfig: Joi.object().description('executor config'),
						md5: Joi.string().description('md5'),
						endpoints: Joi.object().description('remote agent endpoints'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/upload',
			handler: Handlers.APM.Agent.Upload,
			config: {
				// Include this API in swagger documentation
				// tags: ['api'],
				description: 'Upload agent to APM',
				notes: 'Provide agent info',
				auth: 'token',
				validate: {
					payload: {
						author: Joi.string()
							.required()
							.description(
								'The author, same as your Agent Store username, and should appear in agent name'
							),
						name: Joi.string()
							.required()
							.description('The name: with author')
							.example('fynalai/flood_control'),
						version: Joi.string().required().description('version'),

						file: Joi.object().required().description('agent .tar.gz file'),
					},
					validator: Joi,
				},

				plugins: {
					'hapi-swagger': {
						payloadType: 'form',
					},
				},

				payload: {
					maxBytes: 1024 * 1024 * 500, // 500MB
					output: 'stream',
					allow: 'multipart/form-data', // important
					multipart: true, // important
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/edit',
			handler: Handlers.APM.Agent.Edit,
			config: {
				// Include this API in swagger documentation
				// tags: ['api'],
				description: 'Edit agent in APM',
				notes: 'Provide agent info',
				auth: 'token',
				validate: {
					payload: {
						_id: Joi.string().description('agent _id'),
						label: Joi.string().description('label'),
						description: Joi.string().description('description'),
						icon: Joi.string().description('icon url'),
						doc: Joi.string().description('doc in markdown'),
						config: Joi.object({
							input: Joi.object().required().description('agent input params'),
							output: Joi.object().required().description('agent output example'),
						})
							.description('agent input params and output example')
							.example({
								input: {
									style: '水墨画',
									prompt: '无边落木萧萧下，不尽长江滚滚来。',
								},
								output: {
									text: "![Create a serene landscape using the style of traditional Chinese ink painting. Focus on capturing the essence of the poem 'Wild Geese Flapping Down, Endless River Rolling On'. Emphasize the interplay of light and shadow to evoke a sense of tranquility and depth. Incorporate the imagery of falling leaves and a flowing river, ensuring the composition reflects the poem's themes of nature's constant cycle and the passage of time.](https://staticxin.baystoneai.com/d8daa6efa267455f9eb0635fd8ca7170.jpg)",
								},
							}),
						executor: Joi.string()
							.valid('python', 'nodejs', 'aiwork')
							.required()
							.description('Use which executor to run agent'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/init',
			handler: Handlers.APM.Agent.Init,
			config: {
				// tags: ['api'],
				description: 'download agent init template',
				notes: 'Provide agent author, name, executor',
				// auth: 'token',
				validate: {
					payload: Joi.object({
						author: Joi.string().required().description('agent author').example('fynal-ai'),
						name: Joi.string()
							.required()
							.description('agent name')
							.example('fynal-ai/flood_control'),
						executor: Joi.string()
							.valid('python', 'nodejs', 'remote')
							.description('agent executor')
							.example('nodejs'),
					}).label('AgentInitPayload'),
					validator: Joi,
				},
			},
		},

		{
			method: 'POST',
			path: '/apm/agentservice/auth',
			handler: Handlers.APM.AgentService.Auth,
			config: {
				tags: ['api'],
				description: 'Get remote agent service auth token',
				notes: 'Provide remote agent auth info',
				validate: {
					payload: Joi.object({
						name: Joi.string().required().description('name'),
						version: Joi.string().description('version'),
						arg1: Joi.string().required().description('arg1'),
						arg2: Joi.string().description('arg2'),
					}).description('auth'),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentservice/run',
			handler: Handlers.APM.AgentService.Run,
			config: {
				tags: ['api'],
				description: 'Run agent',
				notes:
					'Run agent and return runId immediately. There could be many intermediate results, using /result/get to get the result and using /result/clean to clean results。',
				// auth: 'token',
				validate: {
					payload: Joi.object({
						access_token: Joi.string().required().description('access_token'),

						runId: Joi.string().description('run id'),
						name: Joi.string()
							.required()
							.description('agent name')
							.example('fynal-ai/flood_control'),
						version: Joi.string().allow('').description('agent version').example('1.0.1'),
						input: Joi.object().required().description('agent input').example({
							prompt: '潘家塘最大降雨量多少？',
							start_time: 1715961600,
							end_time: 1721364927,
						}),

						option: Joi.object({
							callback: Joi.string().description('async agent callback url'),
						})
							.label('APMAgentServiceRunOption')
							.description(
								'Option for async agent to save output with POST {runId: <runId>, output: <output>}'
							),
					}).label('APMAgentServiceRunPayload'),
					validator: Joi,
				},
				plugins: {
					'hapi-swagger': {
						responses: {
							200: {
								schema: Joi.object({
									runId: Joi.string().description('run id').example('2HVYnYiCp9KQ792MMSUoE6'),
								}).label('APMAgentServiceRunResponse'),
							},
						},
					},
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentservice/result/get',
			handler: Handlers.APM.AgentService.Result.Get,
			config: {
				tags: ['api'],
				description: 'Get agent run result',
				notes: 'By runId',
				// auth: 'token',
				validate: {
					payload: {
						access_token: Joi.string().required().description('access_token'),

						runId: Joi.string().required().description('run id'),
						deleteAfter: Joi.boolean()
							.default(false)
							.description('delete after request, default is false'),
					},
					validator: Joi,
				},
				plugins: {
					'hapi-swagger': {
						responses: {
							200: {
								schema: Joi.object({
									runId: Joi.string().description('run id').example('3x6pAypWsmhGzgactBFVG8'),
									name: Joi.string().description('agent name').example('fynal-ai/flood_control'),
									version: Joi.string().description('agent version').example('1.0.1'),
									input: Joi.object().description('agent input').example({
										prompt: '潘家塘最大降雨量多少？',
										start_time: 1715961600,
										end_time: 1721364927,
									}),
									output: Joi.object().description('agent output').example({
										text: '山峡水库在2024-06-18 10:00:00时的上水位最高为167m;这是这时间段内的最高水位。',
									}),
									status: Joi.string()
										.valid('ST_RUN', 'ST_FAIL', 'ST_DONE')
										.description('agent running status'),
								}).label('APMAgentServiceRunResponse'),
							},
						},
					},
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentservice/result/clean',
			handler: Handlers.APM.AgentService.Result.Clean,
			config: {
				tags: ['api'],
				description: 'Clean run results',
				notes: 'By runId',
				// auth: 'token',
				validate: {
					payload: {
						access_token: Joi.string().required().description('access_token'),

						runId: Joi.string().required().description('run id'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentservice/result/save',
			handler: Handlers.APM.AgentService.Result.Save,
			config: {
				// tags: ['api'],
				description: 'Create a run result and save',
				notes: 'save',
				// auth: 'token',
				validate: {
					payload: {
						access_token: Joi.string().required().description('access_token'),

						runId: Joi.string().required().description('run id'),
						runMode: Joi.string().valid('sync', 'async').description('run mode'),
						name: Joi.string().description('agent name'),
						version: Joi.string().allow('').description('agent version'),
						input: Joi.object().description('agent input'),
						output: Joi.object().description('agent output'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentservice/result/test/save',
			handler: Handlers.APM.AgentService.Result.Test.Save,
			config: {
				// tags: ['api'],
				description: 'Create a run result and save',
				notes: 'save',
				// auth: 'token',
				validate: {
					payload: {
						runId: Joi.string().required().description('run id'),
						output: Joi.object().description('agent output'),
					},
					validator: Joi,
				},
			},
		},

		{
			method: 'POST',
			path: '/apm/agentResultConsumer/iamalive',
			handler: Handlers.APM.AgentResultConsumer.IAmAlive,
			config: {
				tags: ['api'],
				description: 'Callback ping',
				notes: 'ping',
				validate: {
					payload: {
						access_token: Joi.string().required().description('access_token'),

						option: Joi.object({
							callback: Joi.string().description('async agent callback url'),
						})
							.label('APMAgentServiceRunOption')
							.description(
								'Option for async agent to save output with POST {runId: <runId>, output: <output>}'
							),
					},
					validator: Joi,
				},
			},
		},

		{
			method: 'POST',
			path: '/apm/agentstore/agent/login',
			handler: Handlers.APM.AgentStore.Agent.Login,
			config: {
				// tags: ['api'],
				description: 'Login',
				notes: 'Auto register to login to Agent Store.',
				validate: {
					payload: Joi.object({
						username: Joi.string()
							.required()
							.description(
								'The username: 4-20 English characters, beginning with a letter, ending with a letter or number, with an underscore allowed'
							),
						password: Joi.string()
							.required()
							.description(
								'The password: Length 6-20, must contain both uppercase and lowercase letters, numbers and special characters; special characters only !@#$%^&*'
							),
					}).label('AgentLoginPayload'),
					validator: Joi,
				},
				plugins: {
					'hapi-swagger': {
						responses: {
							200: {
								schema: Joi.object({
									sessionToken: Joi.string()
										.description('sessionToken')
										.example('eyJhbGci.eyJpZCI6I.j1nqU4ZkYIXwH3loinfiZkYvm9YO'),
								}).label('LoginResponse'),
							},
						},
					},
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentstore/agent/install',
			handler: Handlers.APM.AgentStore.Agent.Install,
			config: {
				// tags: ['api'],
				description: 'Install Agent from Agent Store to APM',
				notes: 'Provide agent specification',
				auth: 'token',
				validate: {
					payload: {
						spec: Joi.string()
							.required()
							.description('Agent install specification')
							.example('fynalai/flood_control:1.0.1'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentstore/agent/uninstall',
			handler: Handlers.APM.AgentStore.Agent.Uninstall,
			config: {
				// tags: ['api'],
				description: 'Uninstall APM Agent',
				notes: 'Provide agent specification',
				auth: 'token',
				validate: {
					payload: {
						spec: Joi.string()
							.required()
							.description('Agent uninstall specification')
							.example('fynalai/flood_control:1.0.1'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentstore/agent/upload',
			handler: Handlers.APM.AgentStore.Agent.Upload,
			config: {
				// Include this API in swagger documentation
				// tags: ['api'],
				description: 'Upload agent to Agent Store',
				notes: 'Provide agent info',
				auth: 'token',
				validate: {
					payload: {
						author: Joi.string()
							.required()
							.description(
								'The author, same as your Agent Store username, and should appear in agent name'
							),
						name: Joi.string()
							.required()
							.description('The name: with author')
							.example('fynalai/flood_control'),
						version: Joi.string().required().description('version'),

						file: Joi.object().required().description('agent .tar.gz file'),
					},
					validator: Joi,
				},

				plugins: {
					'hapi-swagger': {
						payloadType: 'form',
					},
				},

				payload: {
					maxBytes: 1024 * 1024 * 500, // 500MB
					output: 'stream',
					allow: 'multipart/form-data', // important
					multipart: true, // important
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentstore/agent/shelf',
			handler: Handlers.APM.AgentStore.Agent.Shelf,
			config: {
				// Include this API in swagger documentation
				// tags: ['api'],
				description: 'Shelf agent to Agent Store',
				notes: 'Provide agent info',
				auth: 'token',
				validate: {
					payload: {
						_id: Joi.string().description('agent _id'),
						label: Joi.string().description('label'),
						description: Joi.string().description('description'),
						icon: Joi.string().description('icon url'),
						doc: Joi.string().description('doc in markdown'),
						config: Joi.object({
							input: Joi.object().required().description('agent input params'),
							output: Joi.object().required().description('agent output example'),
						})
							.description('agent input params and output example')
							.example({
								input: {
									style: '水墨画',
									prompt: '无边落木萧萧下，不尽长江滚滚来。',
								},
								output: {
									text: "![Create a serene landscape using the style of traditional Chinese ink painting. Focus on capturing the essence of the poem 'Wild Geese Flapping Down, Endless River Rolling On'. Emphasize the interplay of light and shadow to evoke a sense of tranquility and depth. Incorporate the imagery of falling leaves and a flowing river, ensuring the composition reflects the poem's themes of nature's constant cycle and the passage of time.](https://staticxin.baystoneai.com/d8daa6efa267455f9eb0635fd8ca7170.jpg)",
								},
							}),
						executor: Joi.string()
							.valid('python', 'nodejs', 'aiwork')
							.required()
							.description('Use which executor to run agent'),

						price: Joi.object({
							original: Joi.number().default(0).description('agent original price'),
							discount: Joi.number().description('agent discount price').example(0),
						})
							.description('agent original and discount price')
							.example({
								original: 100,
								discount: 0,
							}),
						costType: Joi.string()
							.description('agent cost type')
							.valid('trial', 'subscription')
							.example('trial'),
						validity: Joi.object({
							validityType: Joi.string()
								.default('forever')
								.valid('forever', 'limited')
								.description('agent validity'),
							quantity: Joi.number().description(
								'agent valid quantity when validityType is limited'
							),
							unit: Joi.string()
								.valid('hour', 'day', 'week', 'month', 'year')
								.description('agent valid quantity unit when validityType is limited '),
						})
							.description('agent validity')
							.example({
								validityType: 'forever',
							})
							.example({
								validityType: 'limited',
								quantity: 1,
								unit: 'year',
							}),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentstore/agent/search',
			handler: Handlers.APM.AgentStore.Agent.Search,
			config: {
				tags: ['api'],
				description: 'Search agents in Agent Store',
				notes: 'Provide search info',
				validate: {
					payload: {
						...PAGING_PAYLOAD,

						q: Joi.string().allow('').description('query'),
						executor: Joi.string().allow('').description('agent executor'),
					},
					validator: Joi,
				},
			},
		},
	],
};

export default internals;
