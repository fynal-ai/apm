<script lang="ts">
	import { replaceURLSearchPath } from '$lib/airender';
	import { createEventDispatcher } from 'svelte';

	export let path;
	export let url: any = '';

	let breadcrumbs: any = [];
	$: {
		const names = path.split('/').filter((a) => {
			return a;
		});
		breadcrumbs = names.map((name, index) => {
			return {
				name: index === 0 ? name + ':' : name,
				path: `/${names.slice(0, index + 1).join('/')}`,
			};
		});
	}

	const dispatch = createEventDispatcher();
</script>

<nav
	style="--bs-breadcrumb-divider: '›'; word-break: break-all;"
	aria-label="breadcrumb">
	<ol class="breadcrumb fw-bold mb-0">
		<li class="breadcrumb-item">
			{#if path === '/'}
				我的资产
			{:else}
				<a
					href={url ? replaceURLSearchPath(url, '/') : '#'}
					class="text-decoration-none text-secondary opacity-50 breadcrumb-hover"
					data-sveltekit-noscroll
					on:click={async (event) => {
						dispatch('clickBreadcrumb', {
							event,
							breadcrumb: { path: '/' },
						});
					}}>
					我的资产
				</a>
			{/if}
		</li>
		{#each breadcrumbs as breadcrumb}
			<li class="breadcrumb-item">
				{#if breadcrumb.path === path}
					{breadcrumb.name}
				{:else}
					<a
						href={url ? replaceURLSearchPath(url, breadcrumb.path) : '#'}
						class="text-decoration-none text-secondary opacity-50 breadcrumb-hover"
						data-sveltekit-noscroll
						on:click={async (event) => {
							dispatch('clickBreadcrumb', {
								event,
								breadcrumb,
							});
						}}>
						{breadcrumb.name}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb-hover:hover {
		color: #12a0ff !important;
		opacity: 1 !important;
	}
</style>
