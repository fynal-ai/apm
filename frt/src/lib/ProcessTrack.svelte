<script lang="ts">
	import { Button, Row, Col, NavLink, Nav, NavItem, Input } from 'sveltestrap';
	import { API_SERVER } from '$lib/Env';
	import { onMount } from 'svelte';
	import WorkFile from '$lib/workfile.svelte';
	import { setFadeMessage } from '$lib/Notifier';
	import WorkBadge from '$lib/WorkBadge.svelte';
	import { _, mtcDate } from '$lib/i18n';
	import { toast } from '$lib/Toast';
	import { printing, worklistChangeFlag } from '$lib/Stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import * as api from '$lib/api';
	import Signature from '$lib/Signature.svelte';
	import Signature2 from '$lib/Signature2.svelte';
	import DisplayTable from '$lib/display/Table.svelte';
	//import CommentEntry from '$lib/CommentEntry.svelte';
	import CsvDisplay from '$lib/display/CsvDisplay.svelte';
	import { StatusClass } from '$lib/status';
	import parser from '$lib/parser';
	import { goto } from '$app/navigation';
	import { filterStorage } from '$lib/mtcLocalStores';
	import fileSaver from 'file-saver';
	export let wfid: string;
	export let wf: any;
	export let workid = 'CURRENT_WORK_UNKNOWN';
	export let onPrint: any;
	export let workJustDone: any = null;
	//export let _refreshWork;
	export let rehearsal: boolean | undefined;

	let user = $page.data.user;

	let wfTitle_back: string = wf.wftitle ?? '';
	let edittingWfTitle: boolean = false;
	const toggleEdittingWfTitle = () => {
		edittingWfTitle = !edittingWfTitle;
	};

	const cancelEditWfTitle = async () => {
		edittingWfTitle = false;
	};

	const isDoable = (aDoer: any) => {
		return (
			(rehearsal && user.eid === wf.starter) || aDoer.eid === user.eid || user.group === 'ADMIN'
		);
	};

	const confirmEditWfTitle = async () => {
		edittingWfTitle = false;
		if (wfTitle_back !== wf.wftitle) {
			api
				.post(
					'workflow/set/title',
					{
						wfid: wfid,
						wftitle: wfTitle_back,
					},
					user.sessionToken,
				)
				.then((res) => {
					if (!res.error) {
						wf.wftitle = res.wftitle;
						setFadeMessage($_('message.success'), 'success');
					} else {
						setFadeMessage('Failed: ' + res.message, 'warning');
					}
				});
		}
	};
	const checkEnterAndSubmitWfTitle = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			confirmEditWfTitle();
		}
	};

	function gotoWorkflowMonitor(wfid: string) {
		goto(`/workflow/${wfid}/monitor`);
	}
	async function printWindow() {
		if (onPrint) await onPrint();
		window.print();
	}

	let showLog = false;
	let serverRunningLogs = '';
	const onRefreshLog = async (e: Event) => {
		e.preventDefault();
		serverRunningLogs = (await api.post(
			'workflow/readlog',
			{ wfid: wfid },
			user.sessionToken,
		)) as unknown as string;
		console.log(serverRunningLogs);
	};
	const onShowLog = async (e: Event) => {
		e.preventDefault();
		showLog = true;
		await onRefreshLog(e);
	};
	const onCloseLog = async (e: Event) => {
		e.preventDefault();
		showLog = false;
	};

	const restart = async (wfid: string) => {
		let payload = { wfid: wfid, op: 'restart' };
		await api.post('workflow/op', payload, user.sessionToken);
		api.removeCacheByPath('workflow/search');
		api.removeCacheByPath('work/search');
		$worklistChangeFlag++;
		toast($_('workflow.restart.success'));
		goto('/work');
	};

	const restartWithLatestTpl = async (wfid: string) => {
		let payload = { wfid: wfid, op: 'restartWithLatestTpl' };
		await api.post('workflow/op', payload, user.sessionToken);
		api.removeCacheByPath('workflow/search');
		api.removeCacheByPath('work/search');
		toast($_('workflow.reboot.success'));
		$worklistChangeFlag++;
		goto('/work');
	};

	//刚刚完成的todo，检测到后，更新history中对应todo的状态
	$: workJustDone &&
		(() => {
			if (wf) {
				for (let i = 0; i < wf.history.length; i++) {
					if (wf.history[i].workid === workJustDone.workid) {
						wf.history[i].justDone = true;
						wf.history[i].status = workJustDone.status;
						wf.history = wf.history;
						break;
					}
				}
			}
		})();

	onMount(async () => {
		console.log('!!!!ProcessTrack onMount');
	});
</script>

<div class="m-0 p-3 kfk-highlight-2">
	{#if wf}
		<div class="text-center mb-3">
			{#if edittingWfTitle}
				<div class="input-group">
					<input
						class="form-control ms-auto"
						type="text"
						placeholder="Set workflow titile"
						aria-label="Set workflow title here..."
						bind:value={wfTitle_back}
						on:keyup={checkEnterAndSubmitWfTitle} />
					<span class="input-group-text">
						<button
							type="button"
							on:click={confirmEditWfTitle}
							class="btn btn-primary btn-sm">
							<i class="bi bi-arrow-return-left" />
							&nbsp; {$_('confirm.button.confirm')}
						</button>
						<button
							type="button"
							on:click={cancelEditWfTitle}
							class="btn btn-secondary btn-sm">
							&nbsp; {$_('confirm.button.cancel')}
						</button>
					</span>
				</div>
			{:else}
				<div
					class="fs-3"
					on:keydown={() => {}}
					on:click={(e) => {
						e.preventDefault();
						goto(`/workflow/${wfid}`);
					}}>
					{wf.wftitle}
					{#if user.group === 'ADMIN' || user.eid === wf.starter}
						<sup>
							<span
								class="clickable kfk-link"
								on:keydown={null}
								on:click={toggleEdittingWfTitle}>
								<AniIcon
									icon="pencil"
									ani="aniShake" />
							</span>
						</sup>
					{/if}
				</div>
			{/if}
			<!-- <span class="text-nowrap">{$_('work.more.thisbiz')}:</span> -->
			<!-- <a -->
			<!-- 	href={`/biz/${wf.tplid}`} -->
			<!-- 	class="kfk-link"> -->
			<!-- 	{wf.tplid} -->
			<!-- </a> -->
		</div>
		<!--hstack-->
		<Row class="mb-2 bg-primary bg-opacity-10 justify-content-end">
			<Col>
				{$_('todo.startby')}: {wf.starterCN}
			</Col>
		</Row>
		<Row
			class="mb-2 bg-primary bg-opacity-10 justify-content-end"
			cols={{ lg: 4, md: 2, sm: 1 }}>
			<Col>
				{$_('workflow.startat')}:
				{mtcDate(wf.beginat)}
			</Col>
			<Col>
				{$_('workflow.doneat')}:
				{#if wf.status === 'ST_DONE'}
					{mtcDate(wf.doneat)}
				{/if}
			</Col>
		</Row>
		<Row class="mb-2 bg-primary bg-opacity-10 justify-content-end">
			<WorkFile
				title={$_('todo.pbo')}
				forWhat={'workflow'}
				{wf}
				forKey="pbo" />
		</Row>
		<div class="snapshot">
			<object
				type="image/svg+xml"
				data={`/snapshot?objtype=wf&objid=${wfid}`}
				width="100%"
				title="" />
		</div>

		{#if $printing === false}
			<Row class=" bg-primary bg-opacity-10 justify-content-end">
				<Nav pills>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0 pills pill"
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflowMonitor(wfid);
							}}>
							<AniIcon
								icon="kanban"
								ani="aniShake" />
							&nbsp;
							{$_('todo.monitor')}
						</NavLink>
					</NavItem>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0 pills pill"
							on:click={(e) => {
								e.preventDefault();
								restart(wfid);
							}}>
							<AniIcon
								icon="arrow-clockwise"
								ani="aniShake" />
							&nbsp;
							{$_('workflow.restart')}
						</NavLink>
					</NavItem>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0 pills pill"
							on:click={(e) => {
								e.preventDefault();
								restartWithLatestTpl(wfid);
							}}>
							<AniIcon
								icon="bootstrap-reboot"
								ani="aniShake" />
							&nbsp;
							{$_('workflow.reboot')}
						</NavLink>
					</NavItem>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0"
							on:click={printWindow}>
							<AniIcon
								icon="printer"
								ani="aniShake" />
							&nbsp;
							{$_('todo.print')}
						</NavLink>
					</NavItem>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0"
							on:click={onShowLog}>
							<AniIcon
								icon="journal-arrow-down"
								ani="aniShake" />
							&nbsp;
							{$_('todo.showlog')}
						</NavLink>
					</NavItem>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0"
							on:click={async (e) => {
								e.preventDefault();
								api
									.postSimple('mining/data', { tplid: '', wfid: wfid }, user.sessionToken)
									.then((res) => {
										return res.blob();
									})
									.then(async (data) => {
										fileSaver.saveAs(data, wfid + '_data.xlsx');
									});
							}}>
							<AniIcon
								icon="filetype-xlsx"
								ani="aniShake" />
							&nbsp;
							{$_('setting.orgchart.btn.export')}
						</NavLink>
					</NavItem>
					<NavItem class="px-3">
						<NavLink
							class="kfk-link m-0 p-0"
							on:click={(e) => {
								e.preventDefault();
								$filterStorage.showprocesstrack = !$filterStorage.showprocesstrack;
							}}>
							<AniIcon
								icon={$filterStorage.showprocesstrack ? 'caret-up' : 'caret-right'}
								ani="aniShake" />
							&nbsp;
							{$filterStorage.showprocesstrack ? $_('todo.track.shouqi') : $_('todo.track.dakai')}
						</NavLink>
					</NavItem>
				</Nav>
			</Row>
		{/if}
		<hr />
		{#if $filterStorage.showprocesstrack}
			{#each wf.history as entry}
				<div
					class={'row mt-2 border rounded-3 pt-0 kfk-trackentry kfk-work-kvars tnt-work-kvars ' +
						(entry.isCurrent ? 'border-primary' : '')}>
					<div class="row">
						<div class="col col-12 col-md-6"><span class="fs-5">{entry.title}</span></div>
						<div class="col col-12 col-md-6">
							<!-- 这里是当前活动的总体最终结果，与下面的每个人的选择可能不同，如果多个用户执行 -->
							<!-- 同一项工作，这里是最终计算的结果 -->
							<span class="fs-2">{entry.workDecision ? entry.workDecision : ''}</span>
							<WorkBadge
								bind:entry
								bind:workid />
							<span>{entry.doneat ? mtcDate(entry.doneat) : ''}</span>
						</div>
					</div>
					<div class="row">
						{#each entry.doers as aDoer}
							<div class="col border-top border-1">
								<div
									on:keydown={null}
									on:click|preventDefault={async () => {
										await tick();
										if (isDoable(aDoer)) goto(`/work/${aDoer.todoid}`);
										else {
											toast($_('error.notyourwork'));
										}
									}}
									class="clickable btn btn-sm m-1 kfk-link">
									{#if aDoer.status === 'ST_DONE'}
										<!-- 这是每个人的个人选择 -->
										{#if aDoer.decision}
											<div
												class="border border-primary text-primary border-5
              m-0 p-0 fs-4">
												{aDoer.decision}
											</div>
										{/if}
										<Signature2
											cn={aDoer.cn}
											objid={aDoer.todoid} />
										<div class="m-0 p-0">{aDoer.cn}</div>
										<!-- <div>{mtcDate(aDoer.doneat)}</div> -->
									{:else if aDoer.status === 'ST_IGNORE'}
										<div>&nbsp;</div>
										<div class=" d-flex align-items-center  justify-content-center">
											<i class="fs-4 bi text-black-50 bi-emoji-smile-upside-down" />
										</div>
										<div>{aDoer.cn}</div>
										<div>&nbsp;</div>
									{:else}
										<div>&nbsp;</div>
										<div class=" d-flex align-items-center  justify-content-center">
											<i class="fs-4 bi bi-emoji-expressionless" />
										</div>
										<div>{aDoer.cn}</div>
										<div>&nbsp;</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
					<div>
						{#if entry.kvarsArr.filter((x) => x.name[0] != '$').length > 0 || (Array.isArray(entry.comment) && entry.comment.length > 0)}
							{#if entry.kvarsArr.filter((x) => x.name[0] != '$').length > 0}
								<Row
									cols={{ xs: 1, md: 2, lg: 4 }}
									class="kfk-work-kvars tnt-work-kvars border-top">
									{#each entry.kvarsArr.filter((x) => x.name[0] != '$') as kvar}
										<!-- table, textarea width = 100% -->
										<div
											class={'col p-2 border border-1 ' +
												(['tbl', 'textarea'].includes(kvar.type) ? 'w-100' : '')}>
											{#if kvar.type === 'tbl'}
												<div class="fw-bold">{kvar.label}</div>
												<DisplayTable {kvar} />
											{:else if kvar.type === 'textarea'}
												<div class="fw-bold">{kvar.label}</div>
												<div class="text-start">
													<span class="kfk-kvar-value-display">
														{@html parser.newlineToBreak(kvar.value)}
													</span>
												</div>
											{:else if kvar.type === 'csv'}
												<div class="fw-bold">{kvar.label}</div>
												<CsvDisplay fileId={kvar.value} />
											{:else}
												<div class="fw-bold">{kvar.label}</div>
												<span class="kfk-kvar-value-display">
													{kvar.display ? kvar.display : kvar.value}
												</span>
											{/if}
										</div>
									{/each}
								</Row>
							{/if}
							<!--
							{#if Array.isArray(entry.comment) && entry.comment.length > 0}
								<Row cols="1" class="border-top">
									<Col class="px-3 d-flex">
										<div class="text-nowrap">{$_('todo.comments')}</div>
										<div class="ps-3">
											<CommentEntry bind:comment={entry.comment} />
										</div>
									</Col>
								</Row>
							{/if}
							-->
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	{/if}
	<!-- 展开 -->
</div>

{#if showLog}
	<Row
		class="m-3 p-3"
		cols="1">
		<Col class="m-0 p-0 d-flex justify-content-end">
			<Button on:click={onRefreshLog}>
				<i class="bi bi-arrow-clockwise" />
			</Button>
			<Button
				class="ms-1"
				on:click={onCloseLog}>
				<i class="bi bi-x" />
			</Button>
		</Col>
		<Col class="m-0 p-0">
			<Input
				type="textarea"
				rows={10}
				value={serverRunningLogs} />
		</Col>
	</Row>
{/if}

<style>
	.local_work_doneby {
		font-weight: bolder;
		color: blue;
	}
</style>
