<script lang="ts">
	export let data;
	import { _ } from '$lib/i18n';
</script>

<div class="d-flex gap-3 flex-wrap">
	{#each data as item}
		<a
			class="text-decoration-none text-center border rounded bg-light p-2"
			href={item.url}>
			<div class="fs-6 text-secondary">
				{$_(item.label)}
			</div>
			<div class={['fs-1', ...(item.color ? [`text-${item.color}`] : [])].join(' ')}>
				{item.amount}
			</div>
		</a>
	{/each}
</div>
