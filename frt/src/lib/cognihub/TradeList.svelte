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
	import {
		canCancelTrade,
		canPayTrade,
		canRefundTrade,
		copyToClipboard,
		refreshPage,
	} from '$lib/cognihub';
	import { handleConfirmDelete, handlePostResponse, handlePostUpdateResponse } from '$lib/dit';

	export let url;
	export let user;
	export let data;
	export let showRefreshInterval: boolean = false;
	export let refreshInterval: boolean = true;

	export let layout: TaskListLayout = 'cognihub.trade';

	let formItems: TaskListItems =
		layout === 'cognihub.trade.admin'
			? [
					{
						value: 'owner.nickname',
						label: '用户',
					},
					{
						value: '_id',
						label: '订单号',
					},
					{
						value: 'name',
						label: '商品名称',
					},

					{
						value: 'amount',
						label: '实付金额',

						valueRender: async (value) => {
							return `¥${value.amount.toFixed(2)}`;
						},
					},
					{
						value: 'status',
						label: '订单状态',
					},
					{
						value: 'type',
						label: '订单类型',
					},
					{
						value: 'createdAt',
						label: '下单时间',

						input: 'datetime',
					},
					{
						value: 'paidAt',
						label: '支付时间',

						input: 'datetime',
					},
					{
						value: 'payway',
						label: '支付方式',
					},
			  ]
			: [
					{
						value: '_id',
						label: '订单号',
					},
					{
						value: 'name',
						label: '商品名称',
					},

					{
						value: 'amount',
						label: '实付金额',

						valueRender: async (value) => {
							return `¥${value.amount.toFixed(2)}`;
						},
					},
					{
						value: 'status',
						label: '订单状态',
					},
					{
						value: 'createdAt',
						label: '下单时间',

						input: 'datetime',
					},
			  ];

	$: selected = data && data.length > 0 ? data.filter((item) => item.selected) : [];

	let contextMenuShow: boolean = false;
	export let contextMenuData: any = {};

	export let showOperations: boolean = true;

	export let operationsLayout: OperationLayout =
		layout === 'cognihub.trade.admin' ? 'row' : 'table-column';
	const operations: OperationItemsType = [
		...(layout === 'cognihub.trade'
			? [
					{
						class: 'btn btn-sm btn-primary',
						title: '去付款',

						visible: async (event) => {
							return canPayTrade(event.detail.task);
						},

						onClick: async (event) => {
							contextMenuData = event.detail;

							await payRow();
						},

						showTitle: true,
					},
			  ]
			: []),
		{
			class:
				layout === 'cognihub.trade.admin'
					? 'btn btn-sm btn-primary bi bi-arrow-right-circle'
					: 'btn btn-sm btn-primary',
			title: '订单详情',
			onClick: async (event) => {
				contextMenuData = event.detail;

				await detailRow();
			},

			showTitle: layout === 'cognihub.trade',
		},
		{
			class:
				layout === 'cognihub.trade.admin'
					? 'btn btn-sm btn-secondary bi bi-copy'
					: 'btn btn-sm btn-secondary',
			title: '复制订单号',

			onClick: async (event) => {
				contextMenuData = event.detail;

				await copyRow();
			},

			showTitle: layout === 'cognihub.trade',
		},
		...(layout === 'cognihub.trade'
			? [
					{
						class: 'btn btn-sm btn-danger',
						title: '取消订单',

						visible: async (event) => {
							return canCancelTrade(event.detail.task);
						},

						onClick: async (event) => {
							contextMenuData = event.detail;

							await cancelRow();
						},

						showTitle: true,
					},
			  ]
			: []),
		...(layout === 'cognihub.trade.admin'
			? [
					{
						class: 'btn btn-sm btn-danger',
						title: '退款',

						visible: async (event) => {
							return canRefundTrade(event.detail.task);
						},

						onClick: async (event) => {
							contextMenuData = event.detail;

							await refundRow();
						},

						showTitle: true,
					},
			  ]
			: []),
	];
	export let enableContextMenu: boolean = true;
	export let contextMenuOperations = [
		...(layout === 'cognihub.trade'
			? [
					{
						class: 'btn btn-sm w-100 text-start text-primary bi bi-cart',
						title: '去付款',

						visible: async (event) => {
							return canPayTrade(event.detail.task);
						},

						onClick: async (event) => {
							await payRow();
						},
					},
			  ]
			: []),
		{
			class: 'btn btn-sm w-100 text-start text-primary bi bi-arrow-right-circle',
			title: '订单详情',
			onClick: async (event) => {
				await detailRow();
			},
		},
		{
			class: 'btn btn-sm w-100 text-start text-secondary bi bi-copy',
			title: '复制订单号',
			onClick: async (event) => {
				await copyRow();
			},
		},
		...(layout === 'cognihub.trade'
			? [
					{
						class: 'btn btn-sm w-100 text-start text-danger bi bi-x-square',
						title: '取消订单',

						visible: async (event) => {
							return canCancelTrade(event.detail.task);
						},

						onClick: async (event) => {
							await cancelRow();
						},
					},
			  ]
			: []),
		...(layout === 'cognihub.trade.admin'
			? [
					{
						class: 'btn btn-sm w-100 text-start text-danger bi bi-x-square',
						title: '退款',

						visible: async (event) => {
							return canRefundTrade(event.detail.task);
						},

						onClick: async (event) => {
							await refundRow();
						},
					},
			  ]
			: []),
	];

	export let enableSelect: boolean = true;

	async function detailRow() {
		if (layout === 'cognihub.trade.admin') {
			await goto(`/ai2nv/cognihub/console/financial/trade/detail/${contextMenuData.task._id}`);
			return;
		}
		await goto(`/cognihub/console/financial/trade/detail/${contextMenuData.task._id}`);
	}
	async function clickRow(event) {
		contextMenuData = event.detail;

		await detailRow();
	}
	async function copyRow() {
		contextMenuShow = false;

		// console.log([contextMenuData.task]);

		const trade = contextMenuData.task;
		await copyToClipboard(trade._id);

		await handlePostResponse({ _id: '1' }, '已复制订单号: ' + trade._id);
	}
	async function cancelRow() {
		contextMenuShow = false;

		await cancelTasks([contextMenuData.task]);
	}
	async function payRow() {
		await goto(`/cognihub/sale/payway?tradeID=${contextMenuData.task._id}`);
	}
	async function refundRow() {
		contextMenuShow = false;

		await refundTasks([contextMenuData.task]);
	}

	async function cancelTasks(items) {
		const confirm = await handleConfirmDelete('确认取消订单？', '取消订单后可能无法再次享受优惠');
		if (confirm !== true) {
			return;
		}

		{
			const response = await api.post(
				'/cognihub/console/financial/trade/cancel',
				{
					_ids: items.map((a) => {
						return a._id;
					}),
				},
				user.sessionToken
			);

			const success = await handlePostUpdateResponse(response, '已取消');

			if (success) {
				await refreshPage(url); // 刷新页面
			}
		}
	}
	async function refundTasks(items) {
		const confirm = await handleConfirmDelete(
			'确认给订单退款？',
			'给订单退款后钱款将原路返回给相应支付方式，相应的服务也将被立即停用，请知悉。'
		);
		if (confirm !== true) {
			return;
		}

		{
			let success;
			const _ids = items.map((a) => {
				return a._id;
			});
			for (let i = 0; i < _ids.length; i = i + 1) {
				const _id = _ids[i];
				const response = await api.post(
					'/ai2nv/cognihub/console/financial/trade/refund',
					{
						_id,
					},
					user.sessionToken
				);

				success = await handlePostResponse(response, '已退款');
			}
			if (success) {
				await refreshPage(url); // 刷新页面
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
			{#if layout === 'cognihub.trade'}
				{#if !selected.find((item) => {
					return canCancelTrade(item) === false;
				})}
					<button
						class="btn btn-sm btn-danger"
						on:click={async (event) => {
							await cancelTasks(selected);
						}}>
						取消订单
					</button>
				{/if}
			{/if}
			{#if layout === 'cognihub.trade.admin'}
				{#if !selected.find((item) => {
					return canRefundTrade(item) === false;
				})}
					<button
						class="btn btn-sm btn-danger"
						on:click={async (event) => {
							await refundTasks(selected);
						}}>
						退款
					</button>
				{/if}
			{/if}
		{/if}
	</div>
</TasksDisplay>
