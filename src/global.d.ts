declare namespace Emp {
	interface TemplateObj {
		tplid: string;
		doc: string;
		pboat: string;
		endpoint: string;
		endpointmode: string;
		allowdiscuss: boolean;
	}

	interface KVarDef {
		name: string;
		value: string | number | string[];
		label: string;
		type?: string;
		breakrow?: boolean;
		placeholder?: string;
		required?: boolean;
		when?: string;
		id?: string;
		options?: string;
		coldef?: string;
		visi?: string;
		formula?: string;
	}

	interface CallbackDef {
		tenant: string;
		tplid: string;
		round: number;
		wfid: string;
		nodeid: string;
		workid: string;
		delete: () => void;
	}

	type WfFilter = {
		tenant: string;
		wfid: string;
	};
}
