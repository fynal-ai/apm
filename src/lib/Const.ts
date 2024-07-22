const internals = {
	VERSION: '8.0',
	COMMENT_LOAD_NUMBER: -1,
	INJECT_INTERNAL_VARS: true,
	NO_INTERNAL_VARS: false,
	DEL_NEW_COMMENT_TIMEOUT: 30,
	GARBAGE_REHEARSAL_CLEANUP_MINUTES: 5,
	GARBAGE_SCRIPT_CLEANUP_MINUTES: 30,
	VAR_IS_EFFICIENT: 'yes',
	VAR_NOT_EFFICIENT: 'no',
	VISI_FOR_NOBODY: 'NOBODY',
	FOR_WHOLE_PROCESS: 'workflow',
	ENTITY_WORKFLOW: 'workflow',
	supportedClasses: [
		'ACTION',
		'SCRIPT',
		'AND',
		'OR',
		'TIMER',
		'GROUND',
		'START',
		'END',
		'INFORM',
		'THROUGH',
	],
	supportedSTStatus: [
		'ST_RUN',
		'ST_PAUSE',
		'ST_DONE',
		'ST_STOP',
		'ST_IGNORE',
		'ST_RETURNED',
		'ST_REVOKED',
		'ST_END',
	],
	scenarios: ['碳中和', '研发', '生产', '营销', '物资', '财务', '行政', '人事'],
	industries: ['制造', '互联网', '医药', '医疗', '保险'],
};

export default internals;
export const appStatus = {
	PREPARE: 'PREPARE',
	FAILED: 'FAILED',
	READY: 'READY',
	RUNNING: 'RUNNING',
	PAUSED: 'PAUSED',
	PREEXPIRE: 'PREEXPIRE',
	EXPIRED: 'EXPIRED',
	DELETED: 'DELETED',
	CANCELED: 'CANCELED',
};

export const AiResourceCategoryDesc = {
	baremetal: '裸金属',
	airdrop: '空投',
	cloud: '云服务',
};

export const AiResourceAgreements = {
	baremetal: '/agreements/bare_metal',
	airdrop: '/agreements/airdrop',
	cloud: '/agreements/cloud',
};
