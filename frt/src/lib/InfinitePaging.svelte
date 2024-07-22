<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let list_element;

	let lastInView: boolean = false;
	let lastInViewCount: number = 0;

	let dispatch = createEventDispatcher();
</script>

<svelte:window
	on:scroll={() => {
		if (list_element === undefined && list_element.children.length === 0) {
			return;
		}

		const view_height = window.innerHeight;

		const last_top =
			list_element.children[list_element.children.length - 1].getClientRects()[0].top;

		if (last_top < view_height) {
			lastInView = true;

			lastInViewCount = lastInViewCount + 1;
		} else {
			lastInView = false;
			lastInViewCount = 0;
		}

		// 最后一个元素首次进入视野时
		if (lastInView === true && lastInViewCount === 1) {
			dispatch('loadNextPage');
		}
	}} />
