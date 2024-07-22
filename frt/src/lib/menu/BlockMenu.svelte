<script lang="ts">
	import { mygoto } from './Util';
	import { menus } from '$lib/Stores';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import type { menuItemType } from './MenuData';
	const dispatch = createEventDispatcher();

	export let menuItems: menuItemType[] = [];

	const getLabel = (item: menuItemType): string => {
		let label = item.id;
		if (item.alias) {
			label = item.alias;
		} else {
			label = item.id;
		}
		return label;
	};
	const isFolder = (item: menuItemType) => {
		return item.hasSub;
	};

	const onMouseOver = () => {};
	const onMouseOut = () => {};
	const onClickLogo = () => {
		mygoto('/');
	};
	const onBlur = () => {};
	const onFocus = () => {};

	const checkVisible = (item: menuItemType) => {
		let ret = true;
		if (!item.display) {
			ret = false;
		} else if (!(item.visible ?? true)) {
			ret = false;
		} else {
			if (item.check_visible) {
				ret = item.check_visible.fn(item.check_visible.what, item.check_visible.expect);
			}
		}

		return ret;
	};

	const onClickItem = (item: menuItemType) => {
		if (item.callback) {
			try {
				dispatch(item.callback, item.payload);
			} catch (e) {
				console.error(e);
			}
		}
		if (item.target) {
			window && window.open(item.href, item.target);
		} else if (item.href) {
			let m = item.href.match(/^dispatch:([^:]+):?(.+)/);
			if (m) {
				let action = m[1];
				dispatch(action, m[2]);
			} else {
				mygoto(item.href);
			}
		}
	};

	onMount(async () => {});
</script>

<div class="container mt-3">
	<ul>
		{#each $menus.filter((item) => item.level === 0) as item, index}
			{#if checkVisible(item)}
				<div class="category fs-3">{getLabel(item)}</div>
				<div class="row">
					{#each $menus.filter((subitem) => subitem.folder === item.folder + item.id + '/') as subitem}
						<div
							on:keydown={null}
							on:click|preventDefault={(_) => {
								onClickItem(item);
							}}
							class="col-auto btn btn-light function d-flex align-items-center justify-content-center text-wrap">
							{getLabel(subitem)}
						</div>
					{/each}
				</div>
			{/if}
		{/each}
	</ul>
</div>

<style>
	.function {
		border: 1px solid #ccc;
		border-radius: 5px;
		margin: 0.5rem;
		width: 10rem;
		height: 6.18rem;
	}
</style>
