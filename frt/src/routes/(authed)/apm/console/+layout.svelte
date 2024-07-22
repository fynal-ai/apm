<script lang="ts">
	import ConsoleLayout from '$lib/cognihub/ConsoleLayout.svelte';

	let navs = [
		{
			label: '仪表盘',
			url: '/apm/console/dashboard',
		},
		{
			label: 'TOKEN',
			url: '/apm/console/token',
			baseURL: '/apm/console/token',
		},
		// {
		// 	label: '统计',
		// 	url: '/cognihub/console/statistics',
		// },
		// {
		// 	label: '工单',
		// 	url: '/cognihub/console/workorder',
		// },
	];
</script>

<ConsoleLayout
	layout="user"
	{navs}>
	<slot />
</ConsoleLayout>
