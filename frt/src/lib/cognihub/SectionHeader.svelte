<script lang="ts">
	import type { Size, TextPosition } from '$lib/dit/types';

	export let title = '余额充值';

	export let size: Size = 'md';
	export let position: TextPosition = 'start';
	export let border: boolean = false;
</script>

<header>
	<h1
		class={[border ? `border-bottom border-2 pb-3` : '', `text-${position}`].join(' ')}
		class:fs-1={size === 'lg'}
		class:fs-2={size === 'md'}
		class:fs-5={size === 'sm'}
		style="word-break: break-all;">
		{title}
	</h1>

	<div class="d-flex gap-2 flex-wrap align-items-center justify-content-end">
		<slot />
	</div>
</header>
