<script lang="ts">
	import * as echarts from 'echarts';
	import moment from 'moment';
	import { onDestroy, onMount } from 'svelte';

	export let list: any = [
		{
			createdAt: '2023-03-01T10:00:00.000Z',
			used: 100,
		},
	];

	let DOM;
	let chart;

	onMount(async () => {
		chart = echarts.init(DOM);

		window.addEventListener('resize', chart.resize);

		await update();
	});
	onDestroy(async () => {
		if (!chart) {
			return;
		}
		window.removeEventListener('resize', chart.resize);
	});

	async function update() {
		const dataList = list.map((item) => {
			return moment(item.createdAt).format('YYYY-MM-DD');
		});
		const valueList = list.map((item) => item.used);

		chart.setOption({
			tooltip: {},
			xAxis: {
				data: dataList,
			},
			yAxis: {},
			series: [
				{
					type: 'line',
					data: valueList,
				},
			],
		});
	}
</script>

<div
	bind:this={DOM}
	style="width: 100%; height: 360px;">
</div>
