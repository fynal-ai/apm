import { CheerioAPI } from "cheerio";
import { UserType } from "../database/models/User.js";
import { EmployeeType } from "../database/models/Employee.js";
import { TenantType } from "../database/models/Tenant.js";
import { Types } from "mongoose";

export type AvatarInfo = {
	path: string;
	media: string;
	etag: string;
};

export type WorkflowAttachmentEntryTextType = {
	type: "text";
	author: string;
	text: string;
};

export type WorkflowAttachmentEntryFileType = {
	type: "file";
	author: string;
	forWhat: "workflow";
	forWhich: string;
	forKey: string;
};

export type WorkflowAttachmentEntryType =
	| WorkflowAttachmentEntryTextType
	| WorkflowAttachmentEntryFileType;

export type VoteControlType = {
	vote: string;
	vote_any: string;
	vote_failto: string;
	vote_percent: number;
	userDecision: string;
};
export type TenantIdType = string | Types.ObjectId;
export type ReplaceUserMsgType = {
	action: string;
	objtype: string;
	tenant: TenantIdType;
	from: string;
	admin: string;
	to: string;
	tranx: string;
	todo: string[];
	tpl: string[];
};

export type EmailMsgType = {
	tenant: TenantIdType;
	recipients: string | string[];
	cc: string | string[];
	bcc: string | string[];
	subject: string;
	html: string;
	reason: string;
};
export type CommentContextType = {
	wfid?: string;
	workid?: string;
	todoid?: string;
	biztitle?: string;
};

export type SmtpInfo = {
	from: string;
	host: string;
	port: number;
	secure: boolean;
	username: string;
	password: string;
};

export type CoverInfo = {
	path: string;
	media: string;
	etag: string;
};

export type ErrResponse = {
	errors?: any;
	statusCode?: number;
	error?: string;
	code?: string;
	message?: string;
	details?: any;
};

export type NextDef = {
	CMD: string;
	tenant: string | Types.ObjectId;
	teamid: string;
	from_nodeid?: string;
	from_workid?: string;
	tplid: string;
	wfid: string;
	selector?: string;
	byroute?: string;
	rehearsal: boolean;
	starter: string;
	wfstarter?: string;
	round?: number;
	parallel_id?: string;
	route?: string;
};

export type MailNextDef = {
	////  for send mail
	CMD: string;
	tenant?: string | Types.ObjectId;
	recipients?: string[];
	subject?: string;
	html?: string;
	////////////////////////
};

export type ProcNextParams = {
	tenant: TenantIdType;
	teamid: string;
	tplid: string;
	wfid: string;
	wfIO: CheerioAPI;
	tpRoot: any;
	wfRoot: any;
	this_nodeid: string;
	this_workid: string;
	decision: string;
	nexts: any[];
	round: number;
	rehearsal: boolean;
	starter: string;
};

export type ErrorReturn = {
	error: string;
	message: string;
};

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

export type NodeBriefType = {
	nodeid: string;
	title: string;
};

export type ActionDef = {
	nodeid: string;
	workid: string;
	nodeType: string;
	route: string;
	byroute: string;
	status?: string;
	work?: any;
};

export type workflowInfo = {
	endpoint: string;
	endpointmode: string;
	wfid: string;
	tplid: string;
	kvars: any;
	kvarsArr: any[];
	starter: string;
	starterCN: string;
	wftitle: string;
	pwfid: string;
	pworkid: string;
	attachments: any[];
	status: string;
	beginat: string;
	doneat: string;
	allowdiscuss: boolean;
	history: any[];
	pbostatus: boolean;
};
export type workFullInfo = {
	kvars: any;
	kvarsArr: any[];
	wfstatus: string;
	workid: string;
	todoid: string;
	tpNode: any;
	orkid: string;
	wftitle: string;
	title: string;
	cellInfo: string;
	allowdiscuss: boolean;
	status: string;
	wfstarter: string;
	wfstarterCN: string;
	rehearsal: boolean;
	createdAt: string;
	updatedAt: string;
	doneat: string;
	allowpbo: boolean;
	mustsign: boolean;
	tenant: string;
	doer: string;
	doerCN: string;
	wfid: string;
	nodeid: string;
	byroute: string;
	withsb: boolean;
	withrvk: boolean;
	withadhoc: boolean;
	withcmt: boolean;
	from_workid: string;
	from_nodeid: string;
	sr: string;
	transferable: boolean;
	role: string;
	doer_string: string;
	comment: any[];
	wf: workflowInfo;
	instruct: string;
	routingOptions: string[];
	freejump_nodes: NodeBriefType[];
	from_actions: ActionDef[];
	following_actions: ActionDef[];
	parallel_actions: ActionDef[];
	revocable: boolean;
	returnable: boolean;
	version: string;
	ai: any;
};

export type DoerInfo = {
	eid: string;
	cn: string;
};

export type MtcCredentials = {
	user: UserType;
	employee: EmployeeType;
	tenant: TenantType;
};

export type PondFileInfoFromPayloadType = {
	author: string;
	forKey: string;
	serverId?: string;
	contentType: string;
	realName: string;
	stepid: string;
	type?: string;
};

export type PondFileInfoOnServerType = {
	tenant: string;
	eid: string;
	fileName: string;
	folder: string;
	fullPath: string;
};
export type StartWorkflowType = {
	rehearsal: boolean;
	tenant: string;
	tplid: string;
	wftitle: string;
	starter: any;
	theTemplate?: any;
	textPbo?: string[];
	pbostatus: string;
	teamid?: string;
	wfid?: string;
	parent_wf_id?: string;
	parent_work_id?: string;
	parent_vars?: any;
	runmode?: string;
	uploadedFiles?: any[];
	attachments?: any;
};

export type DoersArray = DoerInfo[];
