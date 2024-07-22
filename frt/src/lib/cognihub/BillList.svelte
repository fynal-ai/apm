<script lang="ts">
	import { goto } from '$app/navigation';
	import TasksDisplay from '$lib/airender/TasksDisplay.svelte';
	import type {
		OperationItemsType,
		OperationLayout,
		TaskListItems,
		TaskListLayout,
	} from '$lib/airender/types';
	import * as api from '$lib/api';
	import { handleConfirmDelete, handlePostResponse } from '$lib/dit';
	import { refreshPage } from '.';
	import BalanceRechargeAdminModal from './BalanceRechargeAdminModal.svelte';

	export let url;
	export let user;
	export let data;
	export let showRefreshInterval: boolean = false;
	export let refreshInterval: boolean = true;

	export let layout: TaskListLayout = 'cognihub.bill';

	let formItems: TaskListItems = [
		{
			value: 'createdAt',
			label: '创建时间',

			input: 'datetime',
		},

		{
			value: 'amount',
			label: '金额',

			valueRender: async (value) => {
				return `¥${value.amount.toFixed(2)}`;
			},
		},

		{
			value: 'memo',
			label: '备注',
		},

		...(layout === 'cognihub.bill.admin'
			? [
					{
						value: 'owner.nickname',
						label: '用户',
					},
			  ]
			: []),

		{
			value: 'snapshot.trade._id',
			label: '订单号',

			onClick: async (event) => {
				await goto(
					(layout === 'cognihub.bill.admin' ? '/ai2nv' : '') +
						`/cognihub/console/financial/trade/detail/${event.detail.task.snapshot.trade._id}`
				);
			},
		},
		{
			value: 'snapshot.trade.name',
			label: '订单名称',
		},

		{
			value: 'snapshot.balance.amount',
			label: '余额',

			valueRender: async (task) => {
				return `¥${task.snapshot.balance.amount.toFixed(2)}`;
			},
		},
	];

	$: selected = data && data.length > 0 ? data.filter((item) => item.selected) : [];

	let contextMenuShow: boolean = false;
	export let contextMenuData: any = {};

	export let showOperations: boolean = false;

	export let operationsLayout: OperationLayout = 'table-column';
	const operations: OperationItemsType = [
		{
			class: 'btn btn-sm btn-primary',
			title: '充值',

			onClick: async (event) => {
				contextMenuData = event.detail;

				await rechargeRow();
			},

			showTitle: true,
		},
	];
	export let enableContextMenu: boolean = false;
	export let contextMenuOperations = [
		{
			class: 'btn btn-sm w-100 text-start text-primary bi bi-cart',
			title: '充值',

			onClick: async (event) => {
				await rechargeRow();
			},
		},
	];

	export let enableSelect: boolean = false;

	let rechargeModalVisible: boolean = false;
	let rechargeFormData = {
		_ids: [],
		amount: 10,
	};

	async function detailRow() {}
	async function clickRow(event) {
		contextMenuData = event.detail;

		await detailRow();
	}
	async function rechargeRow() {
		contextMenuShow = false;

		await rechargeTasks([contextMenuData.task]);
	}

	async function rechargeTasks(items) {
		rechargeModalVisible = true;
		rechargeFormData._ids = items.map((a) => {
			return a._id;
		});
	}

	async function confirmRechargeTasks(event) {
		const confirm = await handleConfirmDelete(
			'确认充值？',
			`将立即充值 <span class="fs-1 text-danger">${rechargeFormData.amount.toFixed(
				2
			)}</span>元 给用户，请确认是否充值。`
		);
		if (confirm !== true) {
			return;
		}

		{
			const postData = {
				...rechargeFormData,
			};

			{
				const response = await api.post(
					'/ai2nv/cognihub/console/financial/balance/recharge',
					postData,
					user.sessionToken
				);

				const success = await handlePostResponse(
					response.length > 0
						? { _id: response[0]._id }
						: {
								message: '充值失败',
						  },
					`已充值: ${rechargeFormData.amount.toFixed(2)}元`
				);

				if (success) {
					await refreshPage(url); // 刷新页面
				}
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
	{operationsLayout}
	{enableContextMenu}
	{contextMenuOperations}
	onClickRow={clickRow}
	on:loadNextPage>
	<div slot="header">
		{#if selected.length > 0}
			<button
				class="btn btn-sm btn-primary"
				on:click={async (event) => {
					await rechargeTasks(selected);
				}}>
				充值
			</button>
		{/if}
	</div>
</TasksDisplay>

{#if rechargeModalVisible == true}
	<BalanceRechargeAdminModal
		bind:visible={rechargeModalVisible}
		bind:formData={rechargeFormData}
		on:confirm={confirmRechargeTasks}>
	</BalanceRechargeAdminModal>
{/if}
