<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';
	import { getServiceEndpoint } from '.';

	let layout: TaskListLayout = 'cognihub.app.service';

	export let appID = '';

	export let formData = {
		_id: '',
		type: '',
		version: '',
	};

	export let showDocUrl: boolean = true;

	let formItems: TaskListItems = [
		{
			value: 'status',
			label: '接口状态',

			layout: 'cognihub.service',
		},
		{
			value: 'type',
			label: '接口类型',
		},
		{
			value: 'version',
			label: '版本',
		},
		{
			value: 'updatedAt',
			label: '更新于',

			input: 'datetime',
		},
		{
			value: 'baseURL',
			label: '接口地址',

			valueRender: getServiceEndpoint,

			showCopy: true,
		},
		...(showDocUrl
			? [
					{
						value: 'docUrl',
						label: '文档',
					},
			  ]
			: []),
	];
</script>

<div
	class="d-flex flex-wrap justify-content-between text-secondary gap-1"
	style="word-break: break-all;">
	{#each formItems as item}
		<span>
			{#if item.value === 'docUrl'}
				<a
					class="btn btn-primary btn-sm"
					href={formData[item.value]
						? formData[item.value]
						: `/cognihub/doc/service/${formData._id}?appID=${appID}`}>
					文档
				</a>
			{:else}
				<span>{item.label}</span>
				<span>:</span>
				<span>
					<TaskProperty
						task={formData}
						formItem={item}
						layout={item.layout || layout}>
					</TaskProperty>
				</span>
			{/if}
		</span>
	{/each}
</div>
