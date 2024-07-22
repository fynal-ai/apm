<script lang="ts">
	import StatusStatistics from '../../routes/(authed)/dit/StatusStatistics.svelte';

	export let user;
	export let app: any = {
		status: [
			{
				value: 'all',

				label: '所有',
				amount: 0,
				url: '/cognihub/console/app/my',

				color: 'secondary',
			},
		],
	};
</script>

<section>
	{#if app?.status}
		<StatusStatistics data={app.status}></StatusStatistics>
	{/if}
</section>
