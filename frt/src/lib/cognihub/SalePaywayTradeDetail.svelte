<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';
	import type { TaskListLayout } from '$lib/airender/types';

	export let formData: any = {};
	export let formItems = [
		{
			value: 'orderDetail',
			label: '订单信息',
		},
		{
			value: 'createdAt',
			label: '订单时间',

			input: 'datetime',
		},
		{
			value: 'amountPayable',
			label: '应付金额',

			valueRender: async (value) => {
				return await value.amount;
			},
		},
	];
	export let layout: TaskListLayout = 'cognihub.sale.payway';
</script>

<div>
	{#each formItems as item}
		<div class="row px-2">
			<div
				class="p-1 d-flex col col-3 col-sm-2 col-md-2 col-lg-1 justify-content-end"
				class:align-items-center={item.value !== 'orderDetail'}
				style="min-width: 94px;">
				{item.label}:
			</div>
			<div
				class="p-1 col"
				style="word-break: break-all;">
				<TaskProperty
					task={formData}
					formItem={item}
					{layout}>
				</TaskProperty>
			</div>
		</div>
	{/each}
</div>
