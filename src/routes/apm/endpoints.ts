'use strict';
import Joi from 'joi';
import { PAGING_PAYLOAD } from '../../lib/apm/index.js';
import Handlers from './handlers.js';

const internals = {
	endpoints: [
		{
			method: 'POST',
			path: '/apm/agent/search',
			handler: Handlers.APM.Agent.Search,
			config: {
				tags: ['api'],
				description: '搜索APM里安装的智能体',
				notes: '查找智能体',
				auth: 'token',
				validate: {
					payload: {
						...PAGING_PAYLOAD,

						q: Joi.string().description('搜索关键词'),
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
				description: '查看智能体详情',
				notes: '根据name来查询',
				auth: 'token',
				validate: {
					payload: {
						name: Joi.string().required().description('智能体名称'),
						version: Joi.string().allow('').description('智能体版本'),
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
				description: '往APM里添加智能体',
				notes: '提供智能体的详细信息',
				auth: 'token',
				validate: {
					payload: {
						author: Joi.string().required().description('作者'),
						version: Joi.string().required().description('版本'),
						name: Joi.string().required().description('名称'),
						label: Joi.string().required().description('标签'),
						description: Joi.string().description('描述'),
						icon: Joi.string().description('图标'),
						doc: Joi.string().description('文档'),
						config: {
							input: Joi.object().required().description('输入参数'),
							output: Joi.object().required().description('输出参数'),
						},
						executor: Joi.string().description('执行器'),
						md5: Joi.string().description('md5'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/login',
			handler: Handlers.APM.Agent.Login,
			config: {
				// tags: ['api'],
				description: 'login',
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
			path: '/apm/agent/install',
			handler: Handlers.APM.Agent.Install,
			config: {
				// tags: ['api'],
				description: 'Install Agent from Agent Store to APM',
				notes: 'Provide agent specification',
				// auth: 'token',
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
			path: '/apm/agent/uninstall',
			handler: Handlers.APM.Agent.Uninstall,
			config: {
				// tags: ['api'],
				description: 'Uninstall APM Agent',
				notes: 'Provide agent specification',
				// auth: 'token',
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
			path: '/apm/agent/publish',
			handler: Handlers.APM.Agent.Publish,
			config: {
				tags: ['api'],
				description: 'Publish agent package to agent store',
				notes: 'Provide agent package .tar.gz',
				auth: 'token',
				validate: {
					payload: {
						file: Joi.object().required().description('文件'),
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

		{
			method: 'POST',
			path: '/apm/agentservice/run',
			handler: Handlers.APM.AgentService.Run,
			config: {
				tags: ['api'],
				description: '运行智能体',
				notes: '运行智能体，并返回运行编号 runId，运行中的中间结果使用接口查询获取。',
				auth: 'token',
				validate: {
					payload: Joi.object({
						tenant: Joi.string().description('用户').example('669b97fd461a7529116826a7'),
						wfId: Joi.string()
							.required()
							.description('流程的编号')
							.example('949abe7a-5da2-437c-bdc5-7e5adbac4ddc'),
						nodeId: Joi.string().required().description('节点的编号').example('agent3'),
						roundId: Joi.string().required().description('轮次的编号').example('0'),
						name: Joi.string()
							.required()
							.description('智能体名称')
							.example('fynal-ai/flood_control'),
						version: Joi.string().allow('').description('智能体版本').example('1.0.1'),
						input: Joi.object().required().description('输入参数').example({
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
									runId: Joi.string().description('运行编号').example('2HVYnYiCp9KQ792MMSUoE6'),
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
				description: '查询智能体运行结果',
				notes: '根据wfId、nodeId、roundId、name查询',
				auth: 'token',
				validate: {
					payload: {
						wfId: Joi.string().required().description('流程的编号'),
						nodeId: Joi.string().required().description('节点的编号'),
						roundId: Joi.string().allow('').description('轮次的编号'),
						name: Joi.string().description('智能体名称'),
						deleteAfter: Joi.boolean()
							.default(true)
							.description('是否查询后删除，默认为true，不传时为true。'),
						tenant: Joi.string().description('用户'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agentservice/result/clean',
			handler: Handlers.APM.AgentService.Result.Clean,
			config: {
				tags: ['api'],
				description: '清除智能体运行结果',
				notes: '根据wfId、nodeId、roundId清除结果',
				auth: 'token',
				validate: {
					payload: {
						wfId: Joi.string().required().description('流程的编号'),
						nodeId: Joi.string().allow('').description('节点的编号'),
						roundId: Joi.string().allow('').description('轮次的编号'),
						tenant: Joi.string().description('用户'),
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
				tags: ['api'],
				description: '保存智能体运行结果',
				notes: 'save',
				auth: 'token',
				validate: {
					payload: {
						runId: Joi.string().required().description('运行编号'),
						wfId: Joi.string().required().description('流程的编号'),
						nodeId: Joi.string().required().description('节点的编号'),
						roundId: Joi.string().allow('').description('轮次的编号'),
						name: Joi.string().description('智能体名称'),
						version: Joi.string().allow('').description('智能体版本'),
						tenant: Joi.string().description('用户'),
						input: Joi.object().description('智能体的输入'),
						output: Joi.object().description('智能体的输出'),
						status: Joi.object().description('智能体当前的状态'),
					},
					validator: Joi,
				},
			},
		},
	],
};

export default internals;
