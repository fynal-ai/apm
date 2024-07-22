<script lang="ts">
	import { goto } from '$app/navigation';
	import TasksDisplay from '$lib/airender/TasksDisplay.svelte';
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';
	import * as api from '$lib/api';
	import { handleConfirmDelete, handlePostDeleteResponse, handlePostResponse } from '$lib/dit';
	import { refreshPage } from '.';

	export let url;
	export let user;
	export let data;
	export let showRefreshInterval: boolean = false;
	export let refreshInterval: boolean = true;

	export let layout: TaskListLayout = 'cognihub.app.service';

	export let formItems: TaskListItems = [
		{
			value: 'service.name',
			label: '服务名称',
		},
		{
			value: 'status',
			label: '状态',
		},
		{
			value: 'used',
			label: '当前使用量',
		},
		{
			value: 'remaining',
			label: '剩余量',
		},
		{
			value: 'total',
			label: '总量',
		},
		{
			value: 'qps',
			label: 'QPS',
		},
		{
			value: 'endTime',
			label: '有效期至',

			input: 'datetime',
		},
	];

	$: selected = data && data.length > 0 ? data.filter((item) => item.selected) : [];

	let contextMenuShow: boolean = false;
	export let contextMenuData: any = {};

	export let showOperations: boolean = true;
	const operations = [
		{
			class: 'btn btn-sm btn-primary bi bi-arrow-right-circle',
			title: '服务详情',
			onClick: async (event) => {
				contextMenuData = event.detail;

				await detailRow();
			},
		},
	];
	export let enableContextMenu: boolean = true;
	export let contextMenuOperations = [
		{
			class: 'btn btn-sm text-primary w-100 text-start bi bi-arrow-right-circle',
			title: '服务详情',
			onClick: async (event) => {
				await detailRow();
			},
		},
	];

	export let enableSelect: boolean = false;

	async function detailRow() {
		contextMenuShow = false;

		await goto(
			`/cognihub/console/app/detail/${contextMenuData.task.app}/${contextMenuData.task._id}`
		);
	}
	async function clickRow(event) {
		contextMenuData = event.detail;

		await detailRow();
	}
	async function editRow() {
		await goto(`/ai2nv/cognihub/console/service/edit/${contextMenuData.task._id}`);
	}
	async function deleteRow() {
		contextMenuShow = false;

		await deleteTasks([contextMenuData.task]);
	}
	async function cloneRow() {
		contextMenuShow = false;

		await cloneTasks([contextMenuData.task]);
	}

	async function deleteTasks(items) {
		const confirm = await handleConfirmDelete('确认删除？', '删除后将无法恢复');
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/service/delete',
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
		const confirm = await handleConfirmDelete('确认克隆？', '克隆会复制服务的基本数据');
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/ai2nv/cognihub/console/service/clone',
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
		{/if}
	</div>
</TasksDisplay>
