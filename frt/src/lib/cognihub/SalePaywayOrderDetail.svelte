<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';
	import type { TaskListItems } from '$lib/airender/types';
	import { _ } from '$lib/i18n';
	export let formData: any = [
		{
			appName: '',
			tradeName: '',
			amountPayable: '',
			amount: '',
			memo: '',
		},
	];

	export let formItems: TaskListItems = [
		{
			value: 'appName',
			label: '应用名称',
		},
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
		{
			value: 'amount',
			label: '数量',
		},
		{
			value: 'memo',
			label: '备注',
		},
	];
</script>

<form>
	<div
		class="text-center bg-white"
		style="overflow: auto; max-width: 100%; max-height: 64vh">
		<table class="w-100">
			<thead>
				<tr class="border-bottom position-sticky top-0 bg-light">
					{#each formItems as item}
						<th
							style="min-width: 148px;"
							class="p-1 px-sm-4 py-sm-3">
							{item.label ? $_(item.label) : ''}
						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#if formData && formData.length > 0}
					{#each formData as formItemData, index}
						<tr class="border-bottom">
							{#each formItems as item}
								<td class="p-1 px-sm-4 py-sm-3">
									<TaskProperty
										task={formItemData}
										formItem={item}>
									</TaskProperty>
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</form>
