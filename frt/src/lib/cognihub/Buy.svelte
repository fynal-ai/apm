<script lang="ts">
	import BuyConsole from '$lib/cognihub/BuyConsole.svelte';
	import BuyPackage from '$lib/cognihub/BuyPackage.svelte';

	export let url;
	export let user;
	export let searchParams = {
		appID: '',
		packageID: '',
		serviceID: '',
	};
	export let formData: any = {
		name: '',
		app: {},
		package: {},
	};
</script>

<section>
	<section class="card p-4">
		<BuyPackage
			{url}
			{user}
			{searchParams}
			{formData} />
	</section>

	<section class="card p-4">
		<BuyConsole />
	</section>
</section>
