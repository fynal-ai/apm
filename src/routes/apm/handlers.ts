'use strict';
import { Request, ResponseToolkit } from '@hapi/hapi';

import { APMAgent } from '../../database/models/APMAgent.js';
import { easyResponse } from '../../lib/EasyResponse.js';
import { AGENT } from '../../lib/apm/Agent.js';
import { AGENT_SERVICE } from '../../lib/apm/AgentService.js';

export default {
	APM: {
		Agent: {
			Search: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					const filters = {};

					if (PLD.name) {
						Object.assign(filters, { name: PLD.name });
					}

					if (PLD.pagingMark) {
						Object.assign(filters, { updatedAt: { $lt: PLD.pagingMark } });
					}

					if (PLD.extrajson) {
						Object.assign(filters, PLD.extrajson);
					}

					if (PLD.q) {
						Object.assign(filters, {
							$or: [
								{
									name: {
										$all: PLD.q.split(' ').map((word: string) => {
											return new RegExp(word, 'i');
										}),
									},
								},
								{
									label: {
										$all: PLD.q.split(' ').map((word: string) => {
											return new RegExp(word, 'i');
										}),
									},
								},
							],
						});
					}

					let task = APMAgent.find(filters, {}).lean().sort(PLD.sortBy).limit(PLD.limit);

					if (PLD.skip) {
						task = task.skip(PLD.skip);
					}

					if (PLD.hastotal === true) {
						const total = await APMAgent.countDocuments(filters).lean();
						return {
							total: total,
							list: await task,
						};
					}

					return await task;
				});
			},
			Detail: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT.getDetail(PLD);
				});
			},
			Create: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					let apmAgent = new APMAgent({
						...PLD,
					});

					return await apmAgent.save();
				});
			},
			Install: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT.install(PLD);
				});
			},
			Publish: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT.publish(PLD);
				});
			},
		},
		AgentService: {
			Run: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT_SERVICE.run({
						...PLD,

						token: req.auth.artifacts.token,
					});
				});
			},
			Result: {
				Get: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT_SERVICE.getResult(PLD);
					});
				},
				Clean: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT_SERVICE.cleanResult(PLD);
					});
				},
				Save: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT_SERVICE.saveResult(PLD);
					});
				},
			},
		},
	},
};
