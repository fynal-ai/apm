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
						author: Joi.string().description('作者'),
						version: Joi.string().description('版本'),
						name: Joi.string().description('名称'),
						label: Joi.string().description('标签'),
						description: Joi.string().description('描述'),
						icon: Joi.string().description('图标'),
						doc: Joi.string().description('文档'),
						config: {
							input: Joi.object().description('输入参数'),
							output: Joi.object().description('输出参数'),
						},
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/apm/agent/install',
			handler: Handlers.APM.Agent.Install,
			config: {
				tags: ['api'],
				description: 'Install Agent from Agent Store to APM',
				notes: 'Provide agent specification',
				auth: 'token',
				validate: {
					payload: {
						spec: Joi.string().description('Agent install specification'),
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
				notes: '运行智能体',
				auth: 'token',
				validate: {
					payload: {
						wfId: Joi.string().required().description('流程的编号'),
						nodeId: Joi.string().required().description('节点的编号'),
						roundId: Joi.string().required().description('轮次的编号'),
						name: Joi.string().required().description('智能体名称'),
						version: Joi.string().allow('').description('智能体版本'),
						input: Joi.object().required().description('输入参数'),
						tenant: Joi.string().description('用户'),
					},
					validator: Joi,
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
