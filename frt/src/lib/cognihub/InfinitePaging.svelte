<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let scrollDOM: any = undefined;

	let inView: any = false;
	let inViewCount: number = 0;

	let dispatch = createEventDispatcher();

	let DOM: any;

	let loading: boolean = false;

	function isElementInViewport(element, container) {
		if (!element) {
			return false;
		}

		// container is window
		if (container.innerHeight) {
			const view_height = window.innerHeight;
			const last_top = element.getClientRects()[0].top;

			if (last_top < view_height) {
				return true;
			} else {
				return false;
			}
		}

		// container is scroll div
		{
			const scrollHeight = container.scrollHeight; // 滚动内容高度
			const scrollTop = container.scrollTop; // 滚动条位置
			const clientHeight = container.clientHeight; // 滚动区域高度

			// 如果滚动条滚动到元素的顶部时，则加载更多内容
			if (scrollTop + clientHeight >= scrollHeight - element.clientHeight) {
				return true;
			}

			return false;
		}
	}

	async function loadNextPage(event?: any) {
		const _inView = isElementInViewport(DOM, scrollDOM);

		if (_inView) {
			inView = true;

			inViewCount = inViewCount + 1;
		} else {
			inView = false;
			inViewCount = 0;
		}

		// 元素首次进入视野时
		if (inView === true && inViewCount === 1) {
			dispatch('loadNextPage', {
				beforeLoad: async () => {
					loading = true;
				},
				afterLoad: async () => {
					loading = false;
				},
			});
		}
	}

	onMount(async () => {
		if (!scrollDOM) {
			scrollDOM = window;
		}

		scrollDOM.addEventListener('scroll', loadNextPage);

		// 修复页面初始化时刚好到末尾
		{
			await loadNextPage(); // 加载一次
			if (inView === true) {
				for (let i = 0; i < 10; i = i + 1) {
					// 已经加载完
					if (inView === false) {
						break;
					}
					await loadNextPage();
				}
			}
		}
	});
	onDestroy(async () => {
		if (!scrollDOM) {
			return;
		}

		scrollDOM.removeEventListener('scroll', loadNextPage);
	});
</script>

<div
	class="text-gray-500 d-flex align-items-center justify-content-center text-center"
	style={`font-size: 12px; height: 48px; line-height: 48px;`}
	bind:this={DOM}>
	{#if loading}
		<span
			class="spinner-border"
			role="status">
		</span>
	{:else}
		<span class="">没有更多了</span>
	{/if}
</div>
