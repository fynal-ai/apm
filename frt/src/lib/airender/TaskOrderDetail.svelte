<script lang="ts">
	import SalePaywayOrderDetail from '$lib/cognihub/SalePaywayOrderDetail.svelte';
	import type { TaskListLayout } from './types';

	export let task;

	export let layout: TaskListLayout = 'cognihub.sale.payway';

	function getFormData() {
		if (['recharge'].includes(task?.type)) {
			return [
				{
					tradeName: task.name,
					amountPayable: task.amount,
					memo: task.memo || '--',
				},
			];
		}

		if (['package_purchase'].includes(task?.type) && task?.snapshot?.orderDetailFormData) {
			return task?.snapshot?.orderDetailFormData.map((item) => {
				return {
					...item,

					tradeName: task.name,

					memo: task?.snapshot?.memoFormData.memo,

					logistics: task?.snapshot?.logisticsFormData?.logistics || '无发货信息',
				};
			});
		}

		return [];
	}
</script>

{#if ['cognihub.sale.payway', 'cognihub.trade'].includes(layout)}
	<SalePaywayOrderDetail
		formData={getFormData()}
		formItems={[
			...(['package_purchase'].includes(task?.type)
				? [
						{
							value: 'appName',
							label: '应用名称',
						},
				  ]
				: []),
			{
				value: 'tradeName',
				label: '商品名称',
			},
			{
				value: 'amountPayable',
				label: '总价',

				layout: 'yen',
				withoutClass: true,
			},
			...(['package_purchase'].includes(task?.type)
				? [
						{
							value: 'amount',
							label: '数量',
						},
				  ]
				: []),
			{
				value: 'memo',
				label: '备注',
			},
			...(['cognihub.trade'].includes(layout) && ['service_upgrade'].includes(task?.type)
				? [
						{
							value: 'logistics',
							label: '物流信息',
						},
				  ]
				: []),
		]}>
	</SalePaywayOrderDetail>
{/if}
