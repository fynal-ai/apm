<script lang="ts">
	import TaskAppService from '$lib/airender/TaskAppService.svelte';
	import TaskType from '$lib/airender/TaskType.svelte';
	import TaskValidity from '$lib/airender/TaskValidity.svelte';
	import type { TaskListLayout } from '$lib/airender/types';
	import { createEventDispatcher } from 'svelte';
	import { formatNumber } from '.';

	export let data;
	export let selected: boolean = false;

	let layout: TaskListLayout = 'cognihub.package';

	const dispatch = createEventDispatcher();
</script>

<div
	class="border border-2 shadow p-2 rounded rounded-4 position-relative item h-100"
	class:border-primary={selected}
	on:click={async () => {
		if (selected === true) {
			return;
		}

		dispatch('select', data);
	}}
	on:keydown={() => {}}>
	<div
		class="d-flex justify-content-end"
		style="font-size: 0.8em;">
		<div class="text-secondary">
			<TaskType
				type={data.type}
				{layout}>
			</TaskType>
		</div>
	</div>
	<div class="text-center">
		<div class="fs-4 py-3">{data.name}</div>
		<div class="py-2">
			<span class="text-danger fs-4">{data.price.discount.toFixed(2)}</span>
			<span
				class="text-danger fs-6"
				style="text-decoration: line-through;">
				{data.price.original.toFixed(2)}
			</span>
			<span>元</span>
		</div>
		<div style="border-top: 1px dashed grey"></div>
		<div class="py-2">
			{#each data.services as appService}
				<div>
					<TaskAppService
						{appService}
						{layout}>
					</TaskAppService>
				</div>
			{/each}
		</div>
		<div style="border-top: 1px dashed grey"></div>
		<div
			class="py-2"
			style="font-size: 0.8em;">
			<span>
				有效期: <span class="text-danger fs-6">
					<TaskValidity
						validity={data.validity}
						{layout}>
					</TaskValidity>
				</span>
			</span>

			{#if data.purchaseLimit}
				<span>
					限购数量: <span class="text-danger fs-6">{data.purchaseLimit}</span>
				</span>
			{/if}
		</div>

		<div style="border-top: 1px dashed grey"></div>

		<div
			class="d-flex justify-content-center py-2"
			style="font-size: 0.8em;">
			<a href={`/cognihub/package/detail/${data._id}`}>查看详情</a>
		</div>
	</div>

	{#if selected}
		<div
			class="fs-1 position-absolute text-primary"
			style="right: 0px; bottom: -12px;">
			<i class="bi bi-check"></i>
		</div>
	{/if}
</div>

<style>
	.item:hover {
		--bs-border-opacity: 1;
		border-color: rgba(var(--bs-primary-rgb), var(--bs-border-opacity)) !important;
	}
</style>
