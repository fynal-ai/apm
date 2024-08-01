'use strict';
import { Request, ResponseToolkit } from '@hapi/hapi';

import { APMAgent } from '../../database/models/APMAgent.js';
import { easyResponse } from '../../lib/EasyResponse.js';
import { AGENT } from '../../lib/apm/Agent.js';
import { AGENT_SERVICE } from '../../lib/apm/AgentService.js';
import { Auth } from '../../lib/apm/Auth.js';

export default {
	APM: {
		/**
		 * ## loginUser
		 *
		 * Find the user by username, verify the password matches and return
		 * the user
		 *
		 */

		Auth: Auth,
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

					const list = await task;

					for (let i = 0; i < list.length; i = i + 1) {
						const detail = list[i];
						AGENT.replaceRemoteEndpoints(detail);
					}

					if (PLD.hastotal === true) {
						const total = await APMAgent.countDocuments(filters).lean();
						return {
							total: total,
							list,
						};
					}

					return list;
				});
			},
			Detail: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT.getDetail(PLD);
				});
			},
			Create: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					// check if exists
					{
						const apmAgent = await APMAgent.findOne({
							author: PLD.author,
							name: PLD.name,
							version: PLD.version,
						});
						if (apmAgent) {
							return apmAgent;
						}
					}

					// create new
					let apmAgent = new APMAgent({
						...PLD,
					});

					return await apmAgent.save();
				});
			},
			Upload: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return AGENT.upload(PLD);
				});
			},
			Edit: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return AGENT.edit(PLD);
				});
			},
		},
		AgentService: {
			Auth: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT_SERVICE.auth(PLD);
				});
			},
			Run: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT_SERVICE.run(PLD);
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
						delete PLD.status;
						delete PLD.token;
						return await AGENT_SERVICE.saveResult(PLD);
					});
				},
			},
		},
		AgentStore: {
			Agent: {
				Login: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT.login(PLD);
					});
				},
				Install: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT.install(PLD);
					});
				},
				Uninstall: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT.uninstall(PLD);
					});
				},
				Publish: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return await AGENT.publish(PLD);
					});
				},
			},
		},
	},
};
