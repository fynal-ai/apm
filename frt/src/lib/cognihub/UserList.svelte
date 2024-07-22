<script lang="ts">
	import TasksDisplay from '$lib/airender/TasksDisplay.svelte';
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';
	import * as api from '$lib/api';
	import { handleConfirmDelete, handlePostDeleteResponse } from '$lib/dit';

	export let url;
	export let user;
	export let data;
	export let showRefreshInterval: boolean = false;
	export let refreshInterval: boolean = true;

	export let layout: TaskListLayout = 'cognihub.app';

	export let formItems: TaskListItems = [
		{
			value: 'account',
			label: '账号',
		},
		// {
		// 	value: 'nickname',
		// 	label: '昵称',
		// },
		// {
		// 	value: 'role',
		// 	valueRender: async (task) => {
		// 		if (task.group.includes('AI2NV_COGNIHUB')) {
		// 			return 'admin';
		// 		}
		// 		return 'user';
		// 	},
		// 	label: '角色',
		// },
		{
			value: 'createdAt',
			label: '创建时间',

			input: 'datetime',
		},
	];

	$: selected = data && data.length > 0 ? data.filter((item) => item.selected) : [];

	let contextMenuShow: boolean = false;
	export let contextMenuData: any = {};

	export let showOperations: boolean = false;
	const operations = [
		{
			class: 'btn btn-sm btn-danger bi bi-key',
			title: '重置支付密码',
			onClick: async (event) => {
				contextMenuData = event.detail;

				await resetPayPasswordRow();
			},
		},
	];
	export let enableContextMenu: boolean = false;
	export let contextMenuOperations = [
		{
			class: 'btn btn-sm w-100 text-danger text-start bi bi-key',
			title: '重置支付密码',
			onClick: async (event) => {
				await resetPayPasswordRow();
			},
		},
	];

	export let enableSelect: boolean = false;

	async function detailRow() {
		contextMenuShow = false;
	}
	async function clickRow(event) {
		contextMenuData = event.detail;

		await detailRow();
	}
	async function resetPayPasswordRow() {
		contextMenuShow = false;

		await resetPayPasswordTasks([contextMenuData.task]);
	}

	async function resetPayPasswordTasks(items) {
		const confirm = await handleConfirmDelete('确认重置用户的支付密码？', '重置后将无法恢复');
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/user/balance/password/reset',
				{
					_ids: items.map((a) => {
						return a._id;
					}),
				},
				user.sessionToken
			);

			await handlePostDeleteResponse(
				{
					deletedCount: 1,
				},
				'已重置'
			);
		}
	}
</script>

<TasksDisplay
	{layout}
	bind:data
	{formItems}
	{enableSelect}
	{selected}
	bind:contextMenuData
	bind:contextMenuShow
	{showOperations}
	{showRefreshInterval}
	{refreshInterval}
	on:refresh
	{operations}
	{enableContextMenu}
	{contextMenuOperations}
	onClickRow={clickRow}
	on:loadNextPage>
	<div slot="header">
		{#if selected.length > 0}
			<button
				class="btn btn-sm btn-danger"
				on:click={async (event) => {
					await resetPayPasswordTasks(selected);
				}}>
				重置支付密码
			</button>
		{/if}
	</div>
</TasksDisplay>
