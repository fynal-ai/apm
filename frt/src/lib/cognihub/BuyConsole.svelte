<script lang="ts">
	import BuyConsoleItems from '$lib/cognihub/BuyConsoleItems.svelte';
</script>

<section>
	<header>
		<h1>控制台</h1>
	</header>

	<section>
		<p>已购买API资源，可直接在控制台进行查看和管理</p>
		<a
			class="btn btn-primary btn-sm"
			href="/cognihub/console/dashboard">
			进入控制台
		</a>
		<BuyConsoleItems />
	</section>
</section>
