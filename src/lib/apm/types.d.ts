interface AgentDefinition {
	_id: string;
	author: string;
	version: string;
	name: string;
	description: string;
	icon: string;
	label: string;
	doc?: string;
	config: {
		input: Record<string, any>;
		output: Record<string, any>;
	};
}

export { AgentDefinition };
