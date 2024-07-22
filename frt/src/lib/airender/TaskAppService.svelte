<script lang="ts">
	import { SERVICE_STATUS_CAN_BUY, formatNumber } from '$lib/cognihub';
	import TaskStatus from './TaskStatus.svelte';
	import type { TaskListLayout } from './types';

	export let appService: any;

	export let layout: TaskListLayout = 'cognihub.package';

	let visible: boolean = false;
</script>

<span class="text-secondary">{appService.service?.name}</span>
<span
	class="badge bg-secondary"
	style="font-size: 0.6rem;">
	{appService.service?.version}
</span>
<span>:</span>
<span>
	{#if ['data'].includes(appService?.costType)}
		<span class="text-danger">{formatNumber(appService?.total, 0)}</span>
		<span class="text-secondary">{appService?.dataSizeUnit}</span>
	{:else if ['time'].includes(appService?.costType)}
		<span class="text-danger">{formatNumber(appService?.total, 0)}</span>
		<span class="text-secondary">次调用量</span>
	{:else if ['subscription'].includes(appService?.costType)}
		<span class="text-danger">不限量</span>
	{/if}
</span>
<span>|</span>
<span style="font-size: 0.8rem;">
	<span class="text-danger">{appService?.qps}</span>
	QPS
</span>

<!-- 服务状态，当服务不可用时提示 -->
{#if SERVICE_STATUS_CAN_BUY.includes(appService.service.status) === false}
	<span>|</span>
	<TaskStatus
		status={appService.service.status}
		layout="cognihub.service">
	</TaskStatus>
{/if}
