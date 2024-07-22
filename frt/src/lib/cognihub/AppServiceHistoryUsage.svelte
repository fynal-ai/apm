<script lang="ts">
	import { goto } from '$app/navigation';
	import { replaceURLSearch } from '$lib/airender';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import AppServiceHistoryUsageChart from './AppServiceHistoryUsageChart.svelte';
	import ListLoadingHandler from './ListLoadingHandler.svelte';

	export let url;

	export let formData = {
		startTime: new Date(new Date().setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000),
		endTime: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000),
	};
	export let list: any = [
		{
			createdAt: '2023-03-01T10:00:00.000Z',
			used: 100,
		},
	];

	let formItems: any = [
		{
			value: 'startTime',
			label: '开始时间',

			input: 'date',

			col: 6,

			onChange: async (value) => {
				formData.startTime = value;

				loading = true;

				await goto(replaceURLSearch(url, 'startTime', value));

				loading = false;
			},
		},
		{
			value: 'endTime',
			label: '结束时间',

			input: 'date',

			col: 6,

			onChange: async (value) => {
				formData.endTime = value;

				loading = true;

				await goto(replaceURLSearch(url, 'endTime', value));

				loading = false;
			},
		},
	];

	let loading: boolean = false;
</script>

<section class="m-0">
	<div class="row row-cols-1 row-cols-sm-2">
		{#each formItems as item}
			<div
				class={['col my-1', item.col ? `col-sm-${item.col}` : `col-sm-12`]
					.filter((item) => {
						return item;
					})
					.join(' ')}>
				<div class="form-floating">
					<FormItem
						value={formData[item.value]}
						{item}>
					</FormItem>
				</div>
			</div>
		{/each}
	</div>

	<section>
		<ListLoadingHandler
			bind:loading
			{list}>
			<AppServiceHistoryUsageChart {list}></AppServiceHistoryUsageChart>
		</ListLoadingHandler>
	</section>
</section>
