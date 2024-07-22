<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import mime from 'mime';
	import { _ } from '$lib/i18n';
	import PboStatus from '$lib/display/PboStatus.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import * as api from '$lib/api';
	import { nbArray } from '$lib/utils';
	import { Row, Col } from 'sveltestrap';
	import Confirm from '$lib/confirm.svelte';
	import type { Work, Workflow } from '$lib/types';
	import { page } from '$app/stores';
	import { createEventDispatcher, getContext } from 'svelte';
	import FileUploader from '$lib/FileUploader.svelte';
	import { ClientPermControl } from '$lib/clientperm';
	import { breakpoint } from '$lib/Stores';
	let theConfirm: any;
	let uploadingFile: boolean;
	let uploadedFiles = [];
	let user = $page.data.user;

	const dispatch = createEventDispatcher();
	export let work: Work | null = null;
	export let wf: Workflow | null = null;
	export let title: string;
	export let forWhat: string = 'workflow';
	export let forWhich: string = 'unknown';
	export let forKey: string = 'unknown';
	export let forKvar: string | undefined = undefined;
	export let uploader = true;
	export let filetype: string = 'file';

	let showInputAttach = false;
	let newTextAttach = '';
	let viewFileHere = false;
	let viewFileName = '';
	let viewFileServerId = '';
	let viewFileUrl: string = '';
	let previewWidth = 400;
	let previewHeight = 600;

	function getSuffix(filename: string) {
		console.log(filename);
		let m = filename.match(/\.([^.]+)$/);
		if (m && m.length > 1) {
			console.log(m[1]);
			return m[1];
		}
	}
	function downloadFile(serverId: string, realName: string, mode = 'download') {
		if (!wf) return;
		let wfid = wf.wfid;
		console.log(user.sessionToken);
		fetch(`${API_SERVER}/workflow/attach/viewer/${wfid}/${serverId}`, {
			headers: {
				Authorization: user.sessionToken,
			},
		})
			.then((res) => {
				return res.blob();
			})
			.then((data) => {
				var a = document.createElement('a');
				a.href = window.URL.createObjectURL(data);
				if (mode === 'download') {
					a.download = realName;
				} else if (mode === 'newtab') {
					a.target = '_blank';
				}
				a.click();
			});
	}

	// <!-- workfile在workflow和work的页面都被使用，但FileUploader只在work页面上显示，条件包括 -->
	// <!-- 1. 必须是work页面, 在workflow页面中不显示FileUploader -->
	// <!-- 2. forKey 不等于 pbo， 或者，forKey是pbo， 但当前的work允许修改pbo -->
	// <!-- 3. work的状态为ST_RUN， 并且当前用户有修改当前work的权力 -->
	// <!-- 4. uploader property值为true -->
	function canAddNewAttach() {
		return (
			work &&
			(forKey !== 'pbo' || (forKey === 'pbo' && work.allowpbo)) &&
			(work.status === 'ST_RUN' ||
				ClientPermControl(user.perms, user.eid, 'work', work, 'update')) &&
			uploader
		);
	}

	function buildFileHref(serverId: string) {
		if (!wf) return;
		let wfid = wf.wfid;
		fetch(`${API_SERVER}/workflow/attach/viewer/${wfid}/${serverId}`, {
			headers: {
				Authorization: user.sessionToken,
			},
		})
			.then((res) => {
				return res.blob();
			})
			.then((data) => {
				viewFileUrl = window.URL.createObjectURL(data);
			});
	}

	async function addPondFileToEntity() {
		let ret = await api.post(
			'workflow/addFile',
			{ wfid: work.wfid, pondfiles: uploadedFiles, forKey: forKey },
			user.sessionToken,
		);
		switch (filetype) {
			case 'file':
				if (ret && Array.isArray(ret)) {
					work.wf.attachments = ret;
					attachments = ret;
				}
				break;
			case 'csv':
				if (nbArray(ret)) dispatch('uidCheckResult', ret);
				break;
		}
	}

	const getPreviewSize = function () {
		//get browser width
		previewWidth = window.innerWidth;
		previewHeight = previewWidth * 1.5;
	};

	const removeAttachment = async function (attach) {
		console.log(attach);
		if (attach.serverId && !attach.type) attach.type = 'file';
		let ret = await api.post(
			'workflow/removeAttachment',
			{ wfid: work.wfid, attachments: [attach] },
			user.sessionToken,
		);
		if (ret.error) {
			console.log(ret.message);
		} else {
			work.wf.attachments = ret;
			attachments = ret;
		}
	};

	let attachments = work ? work.wf.attachments : wf ? wf.attachments : [];
	let theWfid = work ? work.wfid : wf ? wf.wfid : '';

	const addTextAttach = async () => {
		if (newTextAttach.trim()) {
			let ret = await api.post(
				'workflow/set/pbo',
				{ wfid: theWfid, pbo: newTextAttach.trim(), pbotype: 'text', stepid: work.todoid },
				user.sessionToken,
			);
			if (ret.error) {
				console.log(ret.message);
			} else {
				work.wf.attachments = ret;
				attachments = ret;
			}
		}
	};
</script>

{#if canAddNewAttach() && showInputAttach}
	<Row class="m-2">
		{$_('attach.security_warning')}
		<Col>
			<div class="input-group">
				<input
					class="form-control"
					name="textattach"
					type="text"
					placeholder={$_('attach.input_a_url')}
					bind:value={newTextAttach} />
				<button
					class="btn btn-primary"
					on:click={addTextAttach}
					type="button">
					{$_('attach.btn_add_a_url')}
				</button>
			</div>
			<FileUploader
				allowRemove={false}
				allowMultiple={true}
				{forWhat}
				{forWhich}
				{forKey}
				{forKvar}
				stepid={work.todoid}
				on:uploading={() => {
					uploadingFile = true;
					dispatch('uploading', true);
				}}
				on:remove={async (e) => {
					//remove has been disabled
					uploadingFile = false;
					let serverId = null;
					for (let i = 0; i < uploadedFiles.length; i++) {
						if (uploadedFiles[i].id === e.detail.id) {
							serverId = uploadedFiles[i].serverId;
							break;
						}
					}
					if (serverId) {
						await removeAttachment(serverId);
						dispatch('remove', serverId);
					}
				}}
				on:uploaded={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					await addPondFileToEntity();
					let serverId = uploadedFiles[0].serverId;
					dispatch('uploaded', serverId);
				}}
				on:warning={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await addPondFileToEntity();
				}}
				on:error={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await addPondFileToEntity();
				}} />
			{filetype === 'csv' ? '请上传.csv文件或xlsx文件，不支持旧格式后缀为xls的文件' : ''}
		</Col>
	</Row>
{/if}
{#if attachments.length > 0 || canAddNewAttach()}
	<div class="row">
		<div class="col text-center">
			{#if title}
				<span class="fs-4">{title}</span>
				{#if wf.pbostatus}
					<br />
					{$_('workflow.pbostatus')}: <PboStatus {wf} />
				{/if}
				<!-- <span class="ms-5"> -->
				<!-- 	{$_('work.pbostatus')}: {work?.wf?.kvars?.pboStatus?.value ?? 'NOT_SET'} -->
				<!-- </span> -->
			{/if}
			{#if canAddNewAttach()}
				<a
					href={'#'}
					class="ms-3 kfk-workflow-id tnt-workflow-id kfk-link"
					on:click={() => (showInputAttach = !showInputAttach)}>
					<AniIcon
						icon={showInputAttach ? 'cloud-arrow-up-fill' : 'cloud-arrow-up'}
						ani="aniShake" />
				</a>
			{/if}
		</div>
	</div>
{/if}
<div class="container mb-3">
	{#each attachments as attach}
		<div class="row kfk-link">
			<div class="col">
				{#if attach.type === 'file' || (attach.serverId && attach.realName)}
					<!-- if could display directly in browser. -->
					{#if ['pdf', 'png', 'html', 'docx', 'xlsx'].indexOf(getSuffix(attach.realName)) >= 0}
						<a
							class="kfk-link"
							href={'#'}
							on:click|preventDefault={() => {
								getPreviewSize();
								buildFileHref(attach.serverId);
								viewFileHere = true;
								viewFileName = attach.realName;
								viewFileServerId = attach.serverId;
							}}>
							<!-- {$_('button.view')} -->
							{attach.realName}
							({attach.author ? attach.author : ''})
						</a>
					{:else}
						<!-- if could not display directly in browser, then download it. -->
						<a
							class="kfk-link"
							href={'#'}
							on:click|preventDefault={() => {
								downloadFile(attach.serverId, attach.realName, 'newtab');
							}}>
							{attach.realName}
							({attach.author ? attach.author : ''})
							<i class="bi bi-box-arrow-up-right ms-1" />
						</a>
					{/if}
				{:else}
					<!-- if not a file, but a url, then display it as a href -->
					<a
						class="kfk-link"
						href={attach.text}
						target="_blank"
						rel="noreferrer">
						{attach.text}
						({attach.author ? attach.author : ''})
					</a>
				{/if}
			</div>
			<div class="col col-auto">
				<!-- 在当前提交时可以删除，一旦提交不能再删除-->
				<!-- 管理员可以删除-->
				<!-- 对当前活动拥有update权限可以删除-->
				<!-- {#if (attach.stepid === work.todoid && work.status === 'ST_RUN' && attach.author === user.eid) || user.group === 'ADMIN' || ClientPermControl(user.perms, user.eid, 'work', work, 'update')} -->
				<!-- allowpbo 指的是是否允许编辑pbo -->
				{#if work && work.allowpbo && ((attach.stepid === work.todoid && work.status === 'ST_RUN' && attach.author === user.eid) || user.group === 'ADMIN')}
					<a
						href={'#'}
						on:click|preventDefault={() => {
							theConfirm.title = $_('confirm.title.areyousure');
							theConfirm.body = $_(`confirm.body.delete${attach.type}`);
							theConfirm.buttons = [$_('confirm.button.delete')];
							theConfirm.callbacks = [
								async () => {
									await removeAttachment(attach);
								},
							];
							theConfirm.toggle();
						}}>
						<i class="bi bi-trash ms-1" />
					</a>
				{/if}
			</div>
		</div>
	{/each}
</div>
{#if viewFileHere}
	<div class="floatPreview">
		<div class="row m-3">
			<div class="col">
				{$_('button.preview')}
				<span class="mx-2">{viewFileName}</span>
				<a
					class="kfk-link"
					href={'#'}
					on:click|preventDefault={() => {
						downloadFile(viewFileServerId, viewFileName, 'download');
						viewFileHere = false;
					}}>
					{$_('button.download')}
					<i class="bi bi-download" />
				</a>
			</div>
			<div class="col-auto">
				<button
					class="btn btn-sm btn-outline-secondary"
					on:click={() => {
						viewFileHere = false;
					}}>
					{$_('button.closepreview')}
				</button>
			</div>
		</div>
		{#if mime.getType(viewFileName).startsWith('image/')}
			<img
				src={viewFileUrl}
				alt={viewFileName} />
		{:else}
			<iframe
				src={viewFileUrl}
				title={viewFileName}
				width="100%"
				height="100%"
				style="border: none;">
				<center>
					<p>
						{$_('error.couldnotdisplayfile', { values: { url: viewFileUrl } })}
					</p>
					<p>
						<a
							href={'#'}
							on:click|preventDefault={() => {
								downloadFile(viewFileServerId, viewFileName, 'download');
								viewFileHere = false;
							}}>
							{$_('button.download')}
							<i class="bi bi-download" />
						</a>
					</p>
				</center>
			</iframe>
		{/if}
	</div>
{/if}
<Confirm bind:this={theConfirm} />

<style>
	.floatPreview {
		position: fixed;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background-color: white;
		z-index: 1000;
	}
</style>
