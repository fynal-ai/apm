class AgentResultConsumer {
	async IAmAlive(payload) {
		return true;
	}
}

const AGENT_RESULT_CONSUMER = new AgentResultConsumer();

export { AGENT_RESULT_CONSUMER, AgentResultConsumer };
