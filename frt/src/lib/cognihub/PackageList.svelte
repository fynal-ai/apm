<script lang="ts">
	import { goto } from '$app/navigation';
	import TasksDisplay from '$lib/airender/TasksDisplay.svelte';
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';
	import * as api from '$lib/api';
	import { canOffTheShelfPackage, canOnTheShelfPackage, refreshPage } from '$lib/cognihub';
	import {
		handleConfirmDelete,
		handlePostDeleteResponse,
		handlePostResponse,
		handlePostUpdateResponse,
	} from '$lib/dit';

	export let url;
	export let user;
	export let data;
	export let showRefreshInterval: boolean = false;
	export let refreshInterval: boolean = true;

	export let layout: TaskListLayout = 'cognihub.package';

	export let formItems: TaskListItems = [
		{
			value: 'name',
			label: '套餐名称',

			showCopy: true,
		},
		{
			value: 'type',
			label: '类型',
		},
		{
			value: 'status',
			label: '状态',
		},
		{
			value: 'price.original',
			label: '原价(元)',
			input: 'number',
		},
		{
			value: 'price.discount',
			label: '折扣价(元)',
			input: 'number',
		},
		{
			value: 'validity',
			label: '有效期',

			input: 'text',
		},
	];

	$: selected = data && data.length > 0 ? data.filter((item) => item.selected) : [];

	let contextMenuShow: boolean = false;
	export let contextMenuData: any = {};

	export let showOperations: boolean = true;
	const operations = [
		{
			class: 'btn btn-sm btn-primary bi bi-pencil',
			title: '编辑',
			onClick: async (event) => {
				contextMenuData = event.detail;

				await editRow();
			},
		},
		{
			class: 'btn btn-sm btn-danger bi bi-trash',
			title: '删除',

			onClick: async (event) => {
				contextMenuData = event.detail;

				await deleteRow();
			},
		},
		{
			class: 'btn btn-sm btn-primary bi bi-copy',
			title: '克隆',

			onClick: async (event) => {
				contextMenuData = event.detail;

				await cloneRow();
			},
		},
		{
			class: 'btn btn-sm btn-danger bi bi-arrow-bar-up',
			title: '上架',

			visible: async (event) => {
				return canOnTheShelfPackage(event.detail.task);
			},
			onClick: async (event) => {
				contextMenuData = event.detail;

				await onTheShellRow();
			},
		},
		{
			class: 'btn btn-sm btn-danger bi bi-arrow-bar-down',
			title: '下架',

			visible: async (event) => {
				return canOffTheShelfPackage(event.detail.task);
			},
			onClick: async (event) => {
				contextMenuData = event.detail;

				await offTheShellRow();
			},
		},
	];
	export let enableContextMenu: boolean = true;
	export let contextMenuOperations = [
		{
			class: 'btn btn-sm w-100 text-start bi bi-pencil',
			title: '编辑',
			onClick: async (event) => {
				await editRow();
			},
		},
		{
			class: 'btn btn-sm text-danger w-100 text-start bi bi-trash',
			title: '删除',
			onClick: async (event) => {
				await deleteRow();
			},
		},
		{
			class: 'btn btn-sm text-primary w-100 text-start bi bi-copy',
			title: '克隆',
			onClick: async (event) => {
				await cloneRow();
			},
		},
		{
			class: 'btn btn-sm text-primary w-100 text-start bi bi-arrow-bar-up',
			title: '上架',
			onClick: async (event) => {
				await onTheShellRow();
			},
		},
		{
			class: 'btn btn-sm text-primary w-100 text-start bi bi-arrow-bar-down',
			title: '下架',
			onClick: async (event) => {
				await offTheShellRow();
			},
		},
	];

	export let enableSelect: boolean = true;

	async function detailRow() {
		contextMenuShow = false;
	}
	async function clickRow(event) {
		contextMenuData = event.detail;

		await editRow();
	}
	async function editRow() {
		await goto(`/ai2nv/cognihub/console/package/edit/${contextMenuData.task._id}`);
	}
	async function deleteRow() {
		contextMenuShow = false;

		await deleteTasks([contextMenuData.task]);
	}
	async function cloneRow() {
		contextMenuShow = false;

		await cloneTasks([contextMenuData.task]);
	}
	async function onTheShellRow() {
		contextMenuShow = false;

		await onTheShellTasks([contextMenuData.task]);
	}
	async function offTheShellRow() {
		contextMenuShow = false;

		await offTheShellTasks([contextMenuData.task]);
	}

	async function deleteTasks(items) {
		const confirm = await handleConfirmDelete('确认删除？', '删除后将无法恢复');
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/package/delete',
				{
					_ids: items.map((a) => {
						return a._id;
					}),
				},
				user.sessionToken
			);

			if (response.deletedCount === 0) {
				response.message = '删除失败';
			}

			await handlePostDeleteResponse(response, '已删除');

			if (response.deletedCount >= 1) {
				await refreshPage(url);
			}
		}
	}
	async function cloneTasks(items) {
		const confirm = await handleConfirmDelete(
			'确认克隆？',
			'克隆会复制套餐的基本数据，包含服务数据。'
		);
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/package/clone',
				{
					_ids: items.map((a) => {
						return a._id;
					}),
				},
				user.sessionToken
			);

			if (response.length === 0) {
				response.message = '克隆失败';
			}

			await handlePostResponse({ _id: items[0]._id }, '已克隆');

			if (response.length > 0) {
				await refreshPage(url);
			}
		}
	}
	async function onTheShellTasks(items) {
		const confirm = await handleConfirmDelete(
			'确认上架？',
			'上架后，套餐将出现在用户购买套餐的列表中。'
		);
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/package/onTheShell',
				{
					_ids: items.map((a) => {
						return a._id;
					}),
				},
				user.sessionToken
			);

			const success = await handlePostUpdateResponse(response, '已上架');

			if (success) {
				await refreshPage(url);
			}
		}
	}
	async function offTheShellTasks(items) {
		const confirm = await handleConfirmDelete(
			'确认下架？',
			'下架后，套餐将不再出现在用户购买套餐的列表中。'
		);
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/package/offTheShell',
				{
					_ids: items.map((a) => {
						return a._id;
					}),
				},
				user.sessionToken
			);

			const success = await handlePostUpdateResponse(response, '已下架');

			if (success) {
				await refreshPage(url);
			}
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
					await deleteTasks(selected);
				}}>
				删除
			</button>
			<button
				class="btn btn-sm btn-primary"
				on:click={async (event) => {
					await cloneTasks(selected);
				}}>
				克隆
			</button>

			{#if !selected.find((item) => {
				return canOnTheShelfPackage(item) === false;
			})}
				<button
					class="btn btn-sm btn-danger"
					on:click={async (event) => {
						await onTheShellTasks(selected);
					}}>
					上架
				</button>
			{/if}

			{#if !selected.find((item) => {
				return canOffTheShelfPackage(item) === false;
			})}
				<button
					class="btn btn-sm btn-danger"
					on:click={async (event) => {
						await offTheShellTasks(selected);
					}}>
					下架
				</button>
			{/if}
		{/if}
	</div>
</TasksDisplay>
