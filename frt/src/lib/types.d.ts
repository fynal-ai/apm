/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */

export interface SmtpDef {
	host: string;
	port: number;
	secure: boolean;
	username: string;
	password: string;
	from: string;
	error?: string;
	message?: string;
}

export interface User {
	userid: string;
	account: string;
	username: string;
	group: string;
	eid: string;
	nickname: string;
	avatar: string;
	signature?: string;
	bio: string;
	notify: string;
	ps: number;
	sessionToken: string;
	password?: string;
	extra?: {
		input_search?: string;
		filter_status?: string;
	};
	perms: unknown;
}

export interface MtcSessionType {
	avatarChangedFlag: number;
	signatureChangedFlag: number;
	tplIds: string[];
	tplIdsForSearch_for_wf: string[];
	delegators: string[];
	tplIdsForSearch_for_todo: string[];
	pickedTodoId: string;
	comment_wfid?: string;
	comments?: string[];
	showpostponed: boolean;
	wfid: string;
	user: User | null;
	org: any;
	orgname: string;
	locale: string;
}

export interface Org {
	site: string;
	name: string;
	owner: string;
	css: string;
	logo: string;
	login_background: string;
	page_background: string;
	orgmode: boolean;
	feedsview: number;
	timezone: string;
	allowchecker: boolean;
	smtp: smtpDef;
	adminorg: boolean;
}

export interface Template {
	_id: string;
	tenant: string;
	pboat: string;
	endpoint: string;
	endpointmode: string;
	tplid: string;
	author: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
	ins: boolean;
	allowdiscuss: boolean;
	freejump: boolean;
}

export interface WorkDoer {
	eid: string;
	cn: string;
	signature: string;
	todoid: string;
	doneat: string;
	status: string;
	decision: string;
}
export interface DoerEntryType {
	eid: string;
	cn: string;
	signature: string;
	todoid: string;
	doneat: string;
	status: string;
	decision: string;
}

export interface HistoryTodoEntryType {
	workid: string;
	todoid: string;
	nodeid: string;
	title: string;
	status: string;
	doer: string;
	doerCN: string;
	doneby: string;
	doneat: string;
	decision: string;
	kvarsArr: any[];
	doers: DoerEntryType[];
	workDecision: string;
	comment: string[];
	isCurrent?: boolean;
	classname?: string;
}

export interface DelegationType {
	_id: string;
	delegator: string;
	delegatee: string;
	begindate: string;
	enddate: string;
}

export interface Workflow {
	_id: string;
	pbo: [string];
	pboat: string;
	endpoint: string;
	endpointmode: string;
	wfid: string;
	tenant: string;
	wftitle: string;
	teamid: string;
	tplid: string;
	status: string;
	statusLabel: string;
	starter: string;
	starterCN: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
	kvarsArr?: kvarDef[];
	attachments: any[];
	rehearsal: boolean;
	pnodeid?: string;
	pworkid?: string;
	cselector?: string[];
	kvars?: any;
	history?: WorkflowHistoryEntry[];
	commentCount: number;
	allowdiscuss: boolean;
	checked: boolean;
}
export type NodeBriefType = {
	nodeid: string;
	title: string;
};

export interface Work {
	_id: string;
	tenant: string;
	doer: string;
	doerCN: string;
	doer_string: string;
	role?: string;
	tplid: string;
	wfid: string;
	wftitle: string;
	todoid: string;
	nodeid: string;
	workid: string;
	cellInfo: string;
	title: string;
	status: string;
	kvars: unknown;
	kvarsArr: ArrayLike<kvarDef>;
	wfstatus: string;
	createdAt: string;
	updatedAt: string;
	instruct: string;
	rehearsal?: boolean;
	wfstarter?: string;
	wfstarterCN?: string;
	wf: Workflow;
	revocable?: boolean;
	returnable?: boolean;
	options?: string[];
	doneby?: string;
	doneat?: date;
	comment?: string;
	comments?: any;
	routingOptions: string[];
	freejump_nodes: NodeBriefType[];
	from_nodeid?: string;
	withsb?: boolean;
	withrvk?: boolean;
	withadhoc?: boolean;
	withcmt?: boolean;
	allowdiscuss: boolean;
	version: string;
	transferable?: boolean;
	mustsign: boolean;
	ai: string;
}

export interface TmapEntry {
	eid: string;
	cn: string;
}

export interface Tmap {
	[k: string]: TmapEntry[];
}

export interface Team {
	_id: string;
	tenant: string;
	teamid: string;
	author: string;
	createdAt: string;
	updatedAt: string;
	tmap: Tmap;
}

export interface kvarDef {
	name: string;
	value: string | number | string[];
	display?: string | number | string[];
	type: InputType;
	label: string;
	placeholder?: string;
	breakrow: boolean;
	id: string;
	options?: string;
	required?: boolean;
	when?: string;
	cssClass?: string;
	hide?: string;
	ui?: string | string[];
	formula?: string;
	wrong_input?: string;
}
export interface KVarDefInput {
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
	min?: number;
	max?: number;
	step?: number;
}

export interface KFKclass {
	setTool: (tool: string, evt?: any) => any;
	lastEvt: any;
	loadTemplateDoc: (template: any, tpl_mode: string) => any;
	reloadNodeProp: (nodeid: string) => any;
	designerCallback: any;
	addDocumentEventHandler: any;
	setConnectProperties: any;
}

export interface StateContext {
	getState: () => {
		page: number;
		pageSize: number;
		rows: any;
		filteredRows: any;
	};
	setPage: (_page: number) => {
		page: number;
	};
	setRows: (_rows: any) => any;
}

export interface radioOption {
	value: string;
	label: string;
}

export interface NodeInfo {
	nodeType: string;
	jqDiv: any;
	theConnect: any;
	caseValue: string;
	setValue: string;
	pbostatus: string;
	nodeProps: Record<string, any>;
}

export interface NodePropJSON {
	subject: string;
	content: string;
	role: string;
	cc: string;
	bot: { wecom: boolean };
	code: string;
	runmode: string;
	label: string;
	sub: string;
	byall: boolean;
	csv: string;
	withcsv: boolean;
	allowpbo: boolean;
	mustsign: boolean;
	vote: string;
	vote_any: string;
	vote_failto: string;
	vote_percent: number;
	instruct: string;
	alone: boolean;
	transferable: boolean;
	sr: boolean;
	freejump: string;
	withsb: boolean;
	withrvk: boolean;
	withadhoc: boolean;
	withcmt: boolean;
	repeaton: string;
	cronrun: number;
	cronexpr: string;
	ai: string;
}

export interface SearchResult {
	total: number;
	objs: any[];
}

export interface KFKError {
	statusCode: number;
	error: string;
	code: string;
	message: string;
}

export interface WhichTab {
	template: string;
	team: string;
	worklist: string;
	workflow: string;
	setting: string;
}
export interface WorkStatus {
	status: string;
}
export interface FilterPicks {
	[key: string]: string | nubmer | boolean | any;
}
export interface EmpResponse {
	error?: string;
	errMsg?: string;
	user?: Record;
	perm?: string;
	message?: string;
	account?: string;
}
export interface OrgMember {
	member?: string;
	nickname?: string;
	group: string;
	mg: string;
	checked: boolean;
	eid: string;
	username?: string;
	account: string;
}
export interface OrgMembers {
	adminorg?: bollean;
	members: OrgMember[];
}
export interface oneArgFunc {
	(arg: any): any;
}

export interface MtcConfirmType {
	title: string;
	body: string;
	buttons: string[];
	callbacks: any[];
}

export interface MtcTags {
	org: string[];
	mine: string[];
}

export interface OrgChartEntry {
	display: boolean;
	expanded: boolean;
	eid: string;
	ou: string;
	cn: string;
	level: number;
	icon: string;
	number_of_children: number;
	position: string[];
	_id: string;
}
export interface registerParam {
	username: string;
	account: string;
	password: string;
	joincode?: number;
}

export interface KsTpl {
	name: string;
	desc: string;
	price: number;
	tags: string[];
	newtag: string;
}

export interface UiSectionType {
	tag: boolean;
	search: boolean;
	sort: boolean;
	layout: boolean;
}

export interface BlogCategoryType {
	value: string;
	label: string;
	active: boolean;
}
export interface BlogType {
	_id: string;
	editor: string;
	category: string;
	title: string;
	icon: string;
	image: string;
	abstract: string;
	content: string;

	status: 'draft' | 'published' | 'deleted';

	createdAt: date;
	updatedAt: date;
}
export type BlogLayout = 'list' | 'grid' | 'banner';
export type BlogListLayoutSize = 'small' | 'medium' | 'large';
