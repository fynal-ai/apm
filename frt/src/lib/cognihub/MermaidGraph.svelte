<script>
	import mermaid from 'mermaid';
	import { onMount } from 'svelte';

	let container;
	let id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
	export let graphDefinition = 'graph TB\na-->b';

	onMount(async () => {
		const { svg, bindFunctions } = await mermaid.render(id, graphDefinition, container);
		container.innerHTML = svg;
		bindFunctions?.(container);
	});
</script>

<div bind:this={container}></div>
