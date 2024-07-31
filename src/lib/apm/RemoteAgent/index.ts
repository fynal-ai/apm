import { APMAgent } from './APMAgent.js';

class RemoteAgent {
	constructor() {}
	async run(remoteAgentServer, params) {
		console.log('Receive', params);
		if (remoteAgentServer.type === 'apm') {
			const apmAgent = new APMAgent();
			return await apmAgent.run({
				baseURL: remoteAgentServer.baseURL,
				access_id: remoteAgentServer.access_id,
				access_key: remoteAgentServer.access_key,
				input: params,
			});
		}
	}
}

export { RemoteAgent };
