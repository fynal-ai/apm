<script lang="ts">
	import { goto } from '$app/navigation';
	import type { MenuItemType } from '$lib/baystoneTypes';
	import { _ } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';
	let dispatch = createEventDispatcher();
	export let items: MenuItemType[];
	export let current: string;
	export let customStyle = '';
</script>

<nav
	aria-label="breadcrumb"
	style={customStyle}>
	<ol class="breadcrumb">
		{#each items as item}
			<li class="breadcrumb-item kfk-tag">
				<a
					class="kfk-link"
					class:fw-bold={item.value === current}
					class:text-success={item.value === current}
					href={'#'}
					on:click={() => {
						if (item?.url) {
							goto(item?.url);
						} else {
							current = item.value;
							dispatch('toggle', current);
						}
						dispatch('itemClicked', item);
					}}>
					{$_(item.label)}
				</a>
			</li>
		{/each}
	</ol>
</nav>

<style scope>
	.breadcrumb {
		background-color: transparent;
		padding: 0 10px;
		margin: 0;
	}
</style>
