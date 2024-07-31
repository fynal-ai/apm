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
								schema: Joi.object({
									access_id: Joi.string().required().description('access_id'),
									access_token: Joi.string().required().description('access_token'),
								}),
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
						token: Joi.string().required().description('token'),

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
						token: Joi.string().required().description('token'),
						runId: Joi.string().required().description('run id'),
						deleteAfter: Joi.boolean()
							.default(true)
							.description('delete after request, default is true'),
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
						token: Joi.string().required().description('token'),

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
				auth: 'token',
				validate: {
					payload: {
						runId: Joi.string().required().description('run id'),
						runMode: Joi.string().valid('sync', 'async').description('run mode'),
						name: Joi.string().description('agent name'),
						version: Joi.string().allow('').description('agent version'),
						input: Joi.object().description('agent input'),
						output: Joi.object().description('agent output'),
						status: Joi.object({
							stage: Joi.string()
								.valid(
									'notstart',
									'pending',
									'underway',
									'finished',
									'failure',
									'stopped',
									'offline'
								)
								.description('stage'),
							done: Joi.boolean().description('is done'),
							message: Joi.string().description('message'),
							code: Joi.number().description('code'),
							error: Joi.string().description('error'),
							progress: Joi.number().description('progress'),
						})
							.description('current run status')
							.example({
								done: true,
							}),
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
			path: '/apm/agentstore/agent/publish',
			handler: Handlers.APM.AgentStore.Agent.Publish,
			config: {
				// tags: ['api'],
				description: 'Publish agent package to agent store',
				notes: 'Provide agent package .tar.gz',
				auth: 'token',
				validate: {
					payload: {
						file: Joi.object().required().description('file'),
					},
					validator: Joi,
				},

				payload: {
					maxBytes: 1024 * 1024 * 100, // 100MB
					output: 'stream',
					allow: 'multipart/form-data', // important
					multipart: true, // important
				},
			},
		},
	],
};

export default internals;
