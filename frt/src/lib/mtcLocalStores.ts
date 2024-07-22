import Const from '$lib/Const';
import mtcLocalStorage from '$lib/mtcLocalStorage';
import type { FilterPicks, MtcTags, WhichTab, WorkStatus } from '$lib/types';

export const TagStorage = mtcLocalStorage<MtcTags>('tags', { org: [], mine: [] });
export const wfMonitorInterval = mtcLocalStorage<
	ReturnType<typeof setInterval> | number | undefined
>('wfminterval', 0);
export const kshareCate = mtcLocalStorage('ksharecate', 'scenario');
export const inputs = mtcLocalStorage('inputs', <
	Record<string, Record<string, string | number | string[]>>
>{
	FIRST_INPUT: {},
});
export const WorkStatusStorage = mtcLocalStorage<WorkStatus>('work_status', { status: 'ST_DONE' });
export const debugOption = mtcLocalStorage<string>('debugOption', 'no');
export const autorefreshid = mtcLocalStorage<string>('autorefreshid', '0');
export const version = mtcLocalStorage<string>('version', Const.VERSION);
export const clientlocale = mtcLocalStorage<string>('clientlocale', 'zh-CN');
export const confirmlocale = mtcLocalStorage<boolean>('confirmlocale', false);
export const SetFor = mtcLocalStorage('idSelect', {
	setTagFor: '',
	setDescFor: '',
	setAuthorFor: '',
	setVisiFor: '',
	settingFor: '',
});

export const whichTabStorage = mtcLocalStorage<WhichTab>('whichtab', {
	template: 'home',
	team: 'search',
	worklist: 'ST_RUN',
	workflow: 'ST_RUN',
	setting: 'personal',
});

export const filterStorage = mtcLocalStorage<FilterPicks>('filter', {
	wf: { tplTag: '', sortby: '-updatedAt' },
	todo: { tplTag: '', sortby: 'lastdays' },
	tpl: { tplTag: '', sortby: '-updatedAt' },
	gotoUID: '',
	try_with_teamid: '',
	try_with_eid: '',
	try_with_kvar: '',
	try_with_wfid: '',
	col_per_row: { xs: 1 },
	pageSize: 10,
	showprocesstrack: true,
	curve: true,
	debug: '',
	calendar_begin: '',
	calendar_end: '',
});
export const startedWorkflow = mtcLocalStorage<any>('startedWorkflow', null);
