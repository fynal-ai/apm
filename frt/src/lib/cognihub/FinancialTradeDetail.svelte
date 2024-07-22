<script lang="ts">
	import type { TaskListLayout } from '$lib/airender/types';
	import SalePaywayTradeDetail from '$lib/cognihub/SalePaywayTradeDetail.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import { canInvoiceTrade } from '.';
	import FinancialTradeNext from './FinancialTradeNext.svelte';

	export let trade: any;
	export let layout: TaskListLayout = 'cognihub.trade';

	export let url;
	export let user;
</script>

<section>
	<SectionHeader title={'订单详情 - ' + trade._id}>
		<a
			class="text-primary text-decoration-none"
			href={layout === 'cognihub.trade.admin'
				? '/ai2nv/cognihub/console/financial/trade'
				: '/cognihub/console/financial/trade'}>
			返回订单列表
		</a>
	</SectionHeader>

	<!-- 商品列表 -->
	<section>
		<SalePaywayTradeDetail
			layout="cognihub.trade"
			formData={trade}
			formItems={[
				{
					value: 'orderDetail',
					label: '商品列表',
				},
				{
					value: 'amountPayable',
					label: '实付金额',

					valueRender: async (value) => {
						return await value.amount;
					},
				},
				{
					value: 'createdAt',
					label: '下单时间',

					input: 'datetime',
				},
				...(canInvoiceTrade(trade)
					? [
							{
								value: 'paidAt',
								label: '付款时间',

								input: 'datetime',
							},
					  ]
					: []),
				...(trade.payway &&
				((['package_purchase'].includes(trade.type) && ['completed'].includes(trade.status)) ||
					['recharge'].includes(trade.type))
					? [
							{
								value: 'payway',
								label: '支付方式',
							},
					  ]
					: []),
				...(trade.payno && ['completed'].includes(trade.status)
					? [
							{
								value: 'payno',
								label: '支付交易号',
							},
					  ]
					: []),
				{
					value: 'status',
					label: '订单状态',
				},
			]}>
		</SalePaywayTradeDetail>
	</section>

	<!-- 去付款 或 更多操作 -->
	{#if layout === 'cognihub.trade'}
		<section>
			<FinancialTradeNext
				{url}
				{user}
				{trade}>
			</FinancialTradeNext>
		</section>
	{/if}
</section>
