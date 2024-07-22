<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';
	import type { TaskListLayout } from './types';

	export let layout: TaskListLayout = 'airender';
	export let hiddenBlank: boolean = true; // 对于data里值为空的字段，是否隐藏

	export let data;

	export let headerFormItems = [
		{
			value: 'task_id',
			label: '作业号',
		},
		{
			value: 'start_frame',
			label: '帧任务',
		},
		{
			value: 'status',
			label: '状态',
		},
		{
			value: 'frame_duration_seconds',
			label: '帧耗时',
		},
		{
			value: 'fee',
			label: '渲染费用',
		},
		{
			value: 'progress',
			label: '渲染进度',
		},
		{
			value: 'frame_duration',
			label: '运行时间',
		},
		{
			value: 'frame_start_time',
			label: '开始时间',
		},
		{
			value: 'frame_end_time',
			label: '结束时间',
		},
		{
			value: 'start_time',
			label: '任务开始时间',
		},
		{
			value: 'end_time',
			label: '任务结束时间',
		},
	];
</script>

<header
	class="mb-4"
	style="word-break: break-all;">
	<h1
		class="d-flex flex-wrap justify-content-between text-secondary fw-bold"
		style="font-size: 12px;">
		{#each headerFormItems as item}
			{#if hiddenBlank && !data[item.value]}
				{''}
			{:else}
				<span>
					{item.label}: <TaskProperty
						formItem={item}
						task={data}
						{layout}></TaskProperty>
				</span>
			{/if}
		{/each}
	</h1>
</header>
