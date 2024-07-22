<script lang="ts">
	import Dashboard from '$lib/cognihub/Dashboard.svelte';

	export let data: any;
</script>

<Dashboard
	url={data.url}
	user={data.user}
	dashboard={data.dashboard}
	layout={data.layout}>
</Dashboard>
