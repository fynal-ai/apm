<script lang="ts">
	import LandPage from '$lib/apm/LandPage.svelte';

	export let data: any;
</script>

<LandPage user={data.user}></LandPage>
