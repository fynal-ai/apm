<script lang="ts">
	import InfinitePaging from '$lib/cognihub/InfinitePaging.svelte';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import TableOperation from './TableOperation.svelte';
	import TaskProperty from './TaskProperty.svelte';
	import type { OperationItemsType, OperationLayout, TaskListItems, TaskListLayout } from './types';

	export let data;
	export let layout: TaskListLayout = 'airender';

	export let formItems: TaskListItems = [
		{
			value: 'task_id',
			label: '作业号',
		},
		{
			value: 'scene_name',
			label: '场景名称',
		},
		{
			value: 'start_time',
			label: '开始时间',
		},
		{
			value: 'end_time',
			label: '结束时间',
		},
		{
			value: 'status',
			label: '状态',
		},
		{
			value: 'fee',
			label: '价格',
		},
	];

	export let showOperations: boolean = false;
	export let operations: OperationItemsType = [];
	export let operationsLayout: OperationLayout = 'row';

	export let enableContextMenu: boolean = true;

	const dispatch = createEventDispatcher();

	export let enableSelect: boolean = true;
	export let selected = data.filter((item) => item.selected);

	export let onClickRow: any = undefined;

	let scrollDOM;

	export let sortable: boolean = false;
	export let sortBy = {
		field: '',
		order: 0,
	};

	export let showRefreshInterval: boolean = false; // 是否显示循环刷新
	export let refreshInterval: boolean = true; // 循环刷新
	export let refreshIntervalTime: number = 5 * 1000; // 循环刷新时间
	let refreshID = Math.random().toString(36).substr(2, 9);
	let interval;
	let refreshTimestamp = new Date().getTime();
	function startInterval() {
		refreshInterval = true;

		function animation() {
			interval = requestAnimationFrame(animation);

			const now = new Date().getTime();

			if (now - refreshTimestamp < refreshIntervalTime) {
				return;
			}

			refreshTimestamp = now;

			dispatch('refresh', {
				stopInterval,
			});
		}

		animation();
	}
	function stopInterval() {
		if (!interval) {
			return;
		}
		cancelAnimationFrame(interval);
		interval = undefined;
	}

	onMount(async () => {
		if (showRefreshInterval === false || refreshInterval === false) {
			return;
		}
		startInterval();
	});
	onDestroy(async () => {
		if (showRefreshInterval === false || refreshInterval === false) {
			return;
		}
		stopInterval();
	});
</script>

<section class="mb-2">
	<header class="d-flex justify-content-between align-items-center text-secondary">
		<div class="d-flex align-items-center user-select-none">
			{#if enableSelect}
				<span class="p-1">
					{#if selected.length > 0 && selected.length !== data.length}
						<i
							class="bi bi-dash-square-fill text-primary clickable"
							on:keydown={() => {}}
							on:click={async (event) => {
								for (let i = 0; i < data.length; i = i + 1) {
									const task = data[i];

									task.selected = true;

									task.checkbox = true; // 展示单选框
								}

								data = data;
							}}>
						</i>
					{:else}
						<input
							class="form-check-input clickable"
							type="checkbox"
							checked={data.length > 0 && selected.length === data.length}
							on:change={async (event) => {
								const checked = event.target.checked;

								for (let i = 0; i < data.length; i = i + 1) {
									const task = data[i];

									task.selected = checked;

									task.checkbox = task.selected; // 单选框显示或隐藏
								}

								data = data;
							}} />
					{/if}
				</span>
			{/if}
			<span
				class="p-1"
				style="font-size: 12px; line-height: 36px;">
				{selected.length > 0 ? `已选 ${selected.length} 项` : `共 ${data.length} 项`}
			</span>
			{#if showRefreshInterval}
				<span class="p-2 d-flex align-items-center">
					<input
						class="form-check-input m-0 clickable"
						type="checkbox"
						bind:checked={refreshInterval}
						on:change={async (event) => {
							const checked = event.target.checked;

							if (checked) {
								startInterval();
							} else {
								stopInterval();
							}
						}}
						id={refreshID} />
					<label
						for={refreshID}
						class="px-1 clickable"
						style="font-size: 12px; line-height: 36px;">
						自动刷新数据
					</label>
				</span>
			{/if}
		</div>

		<slot name="header" />
	</header>
</section>

<div
	style="overflow: auto; max-width: 100%; max-height: 50vh;"
	bind:this={scrollDOM}>
	<table class="w-100">
		<thead>
			<tr class="border-bottom position-sticky top-0 bg-light">
				{#if enableSelect}
					<th
						class="p-1"
						style="width: 24px">
					</th>
				{/if}
				{#each formItems as formItem}
					<th
						class="p-1"
						class:clickable={sortable}
						style={['start_time', 'end_time'].includes(formItem.value) ||
						formItem.input === 'datetime' ||
						(['name'].includes(formItem.value) && ['cognihub.app'].includes(layout))
							? 'min-width: 164px'
							: 'min-width: 64px;'}
						on:click={async (event) => {
							if (sortable) {
								sortBy.field = formItem.value;
								sortBy.order = sortBy.order === 1 ? -1 : 1;

								dispatch('sort', {
									sortBy,
								});
							}
						}}>
						{formItem.label}

						{#if sortable}
							<i
								class:bi-sort-down={sortBy.field === formItem.value && sortBy.order === -1}
								class:bi-sort-up={sortBy.field === formItem.value && sortBy.order === 1}>
							</i>
						{/if}
					</th>
				{/each}

				{#if showOperations}
					<th class="p-1">操作</th>
				{/if}
			</tr>
		</thead>
		{#if data && Array.isArray(data) && data.length > 0}
			<tbody style="line-height: 36px;">
				{#each data as task, index}
					<tr
						class="border-bottom border-solid task-row"
						class:border-light={task.selected}
						class:task-selected={task.selected}
						class:clickable={formItems.findIndex((formItem) => formItem.clickable === false) === -1}
						on:click={async (event) => {
							event.stopPropagation();

							if (onClickRow) {
								await onClickRow({ detail: { task, index, event } });
							}
						}}>
						{#if enableSelect}
							<td
								class="p-1"
								style="width: 24px; line-height: 0px;">
								<input
									class="form-check-input m-0 clickable"
									type="checkbox"
									checked={task.selected}
									on:click={(event) => {
										event.stopPropagation();

										task.selected = !task.selected;
									}} />
							</td>
						{/if}
						{#each formItems as formItem}
							<td
								class="p-1"
								class:clickable={formItem.clickable === false ? false : true}
								style="font-size: 14px;"
								on:contextmenu={(event) => {
									if (enableContextMenu && (formItem.clickable === false ? false : true)) {
										event.preventDefault();
										dispatch('showContextMenu', { task, index, event });
									}
								}}
								on:click={async (event) => {
									if (formItem.clickable === false) {
										event.stopPropagation();
										return;
									}
									if (formItem.onClick) {
										await formItem.onClick({ detail: { task, index, event } });
									}
								}}
								on:keydown={async () => {}}>
								<TaskProperty
									{layout}
									{formItem}
									{task}>
								</TaskProperty>
							</td>
						{/each}

						{#if showOperations}
							<td class="py-1">
								<TableOperation
									layout={operationsLayout}
									{operations}
									data={{ task, index }}>
								</TableOperation>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>

	{#if data && Array.isArray(data) && data.length > 0}
		{#if scrollDOM}
			<InfinitePaging
				on:loadNextPage
				{scrollDOM}>
			</InfinitePaging>
		{/if}
	{:else}
		<div class="text-center text-muted">
			<i class="bi bi-emoji-frown"></i>
			<span>{data.error ? data.error : '暂无数据'}</span>
		</div>
	{/if}
</div>

<style>
	.task-selected,
	.task-row:hover {
		background-color: #9691913d;
	}
</style>
