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

	export let layout: TaskListLayout = 'cognihub.app';

	export let formItems: TaskListItems = [
		{
			value: 'name',
			label: '应用名称',
		},
		{
			value: '_id',
			label: 'APPID',

			showCopy: true,
		},

		{
			value: 'createdAt',
			label: '创建时间',

			input: 'datetime',
		},
		{
			value: 'status',
			label: '状态',
		},
	];

	$: selected = data.filter((item) => item.selected);

	let contextMenuShow: boolean = false;
	export let contextMenuData: any = {};

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
	];
	const contextMenuOperations = [
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
	];

	async function detailRow() {
		await goto(`/cognihub/console/app/detail/${contextMenuData.task._id}`);
	}
	async function clickRow(event) {
		contextMenuData = event.detail;

		await detailRow();
	}
	async function editRow() {
		await goto(`/cognihub/console/app/edit/${contextMenuData.task._id}`);
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
				'/cognihub/console/app/delete',
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
		const confirm = await handleConfirmDelete('确认克隆？', '克隆会复制应用数据，生成新的APPID。');
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/cognihub/console/app/clone',
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
	{selected}
	bind:contextMenuData
	bind:contextMenuShow
	showOperations
	{showRefreshInterval}
	{refreshInterval}
	on:refresh
	{operations}
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
