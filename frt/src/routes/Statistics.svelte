<script lang="ts">
	import { getHomepageStatistics } from '$lib/aiconfig/getConfig';
	import { _ } from '$lib/i18n';
	import { onMount } from 'svelte';
	let config = [
		{ color: 'primary', title: 'baystone.homepage.statistics.airesources', badge: '512P+' },
		{ color: 'success', title: 'baystone.homepage.statistics.models', badge: '99+' },
		{ color: 'danger', title: 'baystone.homepage.statistics.datasets', badge: '199' },
		{ color: 'warning', title: 'baystone.homepage.statistics.apps', badge: '300' },
		{ color: 'info', title: 'baystone.homepage.statistics.ecopartners', badge: '99+' },
	];

	onMount(async () => {
		config = (await getHomepageStatistics()) || config;
	});
</script>

<div class="d-flex gap-2 flex-wrap justify-content-center">
	{#each config as cfg, i}
		<button
			type="button"
			class:ms-2={i > 0}
			class="btn btn-md p-0 px-1 btn-{cfg.color} position-relative rounded-pill">
			{$_(cfg.title)}
			<span class="badge rounded-pill bg-light text-dark">{cfg.badge}</span>
		</button>
	{/each}
</div>
