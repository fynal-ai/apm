<script lang="ts">
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import type { Size, TextPosition } from '$lib/dit/types';

	// header
	export let title = '服务';
	export let operations: any = [
		{
			label: '创建新服务',
			href: '/ai2nv/cognihub/console/service/create',
		},
	];
	export let size: Size = 'md';
	export let position: TextPosition = 'start';
	export let border: boolean = false;
</script>

<SectionHeader
	{title}
	{position}
	{border}
	{size}>
	{#if operations && operations.length > 0}
		{#each operations as operation}
			<a
				class={operation.class || 'btn btn-primary'}
				href={operation.href}>
				{operation.label}
			</a>
		{/each}
	{/if}
</SectionHeader>
