'use strict';
import { Request, ResponseToolkit } from '@hapi/hapi';

import { APMAgent } from '../../database/models/APMAgent.js';
import { Ownership } from '../../database/models/Ownership.js';
import { easyResponse } from '../../lib/EasyResponse.js';
import EmpError from '../../lib/EmpError.js';
import { AGENT } from '../../lib/apm/Agent.js';
import { AGENT_RESULT_CONSUMER } from '../../lib/apm/AgentResultConsumer.js';
import { AGENT_SERVICE } from '../../lib/apm/AgentService.js';
import { AGENT_STORE } from '../../lib/apm/AgentStore.js';
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
					if (PLD.executor) {
						Object.assign(filters, { executor: PLD.executor });
					}

					if (PLD.pagingMark) {
						Object.assign(filters, { updatedAt: { $lt: PLD.pagingMark } });
					}

					if (PLD.extrajson) {
						Object.assign(filters, PLD.extrajson);
					}

					const andCondition = [];
					if (PLD.q) {
						andCondition.push({
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
								{
									executor: {
										$all: PLD.q.split(' ').map((word: string) => {
											return new RegExp(word, 'i');
										}),
									},
								},
							],
						});
					}

					const ownedAgentNames = await Ownership.find({ owner: PLD.owner }).distinct('agentName');
					andCondition.push({
						$or: [{ isPublic: true }, { name: { $in: ownedAgentNames } }],
					});

					Object.assign(filters, { $and: andCondition });

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
				return easyResponse(req, h, async (PLD, _) => {
					return await AGENT.getDetail(PLD);
				});
			},
			Inspect: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, _) => {
					return await AGENT.inspect(PLD);
				});
			},
			Create: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, _) => {
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
			Init: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD) => {
					const streamData = await AGENT.init(PLD);
					// console.log('streamData', streamData, typeof streamData);

					const contentType = 'application/octet-stream';

					return h.response(streamData).header('Content-Type', contentType);
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
				Test: {
					Save: async (req: Request, h: ResponseToolkit) => {
						return easyResponse(req, h, async (PLD, CRED) => {
							// 随机：正常返回或失败
							if (Math.random() > 0.5) {
								return 'Acknowledged';
							} else {
								throw new EmpError(
									'CALLBACK_SAVE_OUTPUT_ERROR',
									'Error to save output to callback server'
								);
							}
						});
					},
				},
			},
		},
		AgentResultConsumer: {
			IAmAlive: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, CRED) => {
					return await AGENT_RESULT_CONSUMER.IAmAlive(PLD);
				});
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
				Upload: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return AGENT_STORE.upload(PLD);
					});
				},
				Shelf: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return AGENT_STORE.shelf(PLD);
					});
				},
				Search: async (req: Request, h: ResponseToolkit) => {
					return easyResponse(req, h, async (PLD, CRED) => {
						return AGENT_STORE.search(PLD);
					});
				},
			},
		},
		Ownership: {
			Runable: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, _) => {
					const ownedAgentNames = await Ownership.find({ owner: PLD.owner }).distinct('agentName');
					const apmAgent = await APMAgent.findOne({ name: PLD.name });
					if (!apmAgent) {
						throw new EmpError('AGENT_NOT_FOUND', `Agent ${PLD.name} not found`);
					}
					return apmAgent.isPublic || ownedAgentNames.includes(PLD.name);
				});
			},
			Set: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, _) => {
					const apmAgent = await APMAgent.findOne({ name: PLD.name });
					if (!apmAgent) {
						throw new EmpError('AGENT_NOT_FOUND', `Agent ${PLD.name} not found`);
					}
					if (apmAgent.isPublic) {
						throw new EmpError('AGENT_IS_PUBLIC', `Add ownership is not allowed for pulbic agent`);
					}
					return await new Ownership({ agentName: PLD.name, owner: PLD.owner }).save();
				});
			},
			Remove: async (req: Request, h: ResponseToolkit) => {
				return easyResponse(req, h, async (PLD, _) => {
					const apmAgent = await APMAgent.findOne({ name: PLD.name });
					if (!apmAgent) {
						throw new EmpError('AGENT_NOT_FOUND', `Agent ${PLD.name} not found`);
					}
					return await Ownership.deleteOne({ agentName: PLD.name, owner: PLD.owner });
				});
			},
		},
	},
};
