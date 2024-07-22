<script lang="ts">
	import StatusStatistics from '../../routes/(authed)/dit/StatusStatistics.svelte';
	import type { DashboardLayoutType } from './types';

	export let layout: DashboardLayoutType = 'user';
	export let user;
	export let data: any = {
		status: [
			{
				value: 'all',

				label: '所有',
				amount: 0,
				url: '/ai2nv/cognihub/console/package/list',

				color: 'secondary',
			},
		],
	};
</script>

<section>
	{#if data?.status}
		{#if layout === 'admin'}
			<StatusStatistics data={data.status}></StatusStatistics>
		{:else}
			套餐用量
		{/if}
	{/if}
</section>
