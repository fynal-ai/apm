<script lang="ts">
	import { formatBalance, formatFee } from '$lib/airender';
	import { formatSeconds, formatSize, formatTime, handlePostResponse } from '$lib/dit';

	import FeeStatus from './FeeStatus.svelte';
	import GPUStatus from './GPUStatus.svelte';
	import TaskName from './TaskName.svelte';
	import TaskStatus from './TaskStatus.svelte';
	import type { TaskListItem, TaskListLayout } from './types';

	import { copyToClipboard } from '$lib/cognihub';
	import TaskBlank from './TaskBlank.svelte';
	import TaskCostType from './TaskCostType.svelte';
	import TaskDataSizeUnit from './TaskDataSizeUnit.svelte';
	import TaskOrderDetail from './TaskOrderDetail.svelte';
	import TaskPayway from './TaskPayway.svelte';
	import TaskProperty from './TaskProperty.svelte';
	import TaskRole from './TaskRole.svelte';
	import TaskType from './TaskType.svelte';
	import TaskValidity from './TaskValidity.svelte';

	export let formItem: TaskListItem;
	export let task;
	export let layout: TaskListLayout = 'airender';
</script>

{#if formItem.value.lastIndexOf('.') > -1}
	<TaskProperty
		formItem={{
			...formItem,

			value: formItem.value.replace(/\./g, '_'), // config.software_config.cg_name => config_software_config_cg_name
		}}
		task={{
			...task,

			// 添加临时值
			[formItem.value.replace(/\./g, '_')]: formItem.value
				.split('.')
				.reduce((previousValue, currentValue) => {
					previousValue = previousValue[currentValue];

					// 处理数字: 0 => "0"
					if (typeof previousValue === 'number') {
						return previousValue.toString();
					}
					return previousValue;
				}, task),
		}}>
	</TaskProperty>
{:else if typeof formItem.valueRender === 'function'}
	{#await formItem.valueRender(task) then itemValue}
		<TaskProperty
			formItem={{
				...formItem,

				valueRender: undefined,
			}}
			task={{
				...task,

				[formItem.value]: itemValue,
			}}
			{layout}>
		</TaskProperty>
	{/await}
	<!-- config.software_config.cg_name -->
	<!-- 不展示空值 -->
{:else if ['memory_usage', 'cpu_usage', 'gpu_memory_usage', 'balance', 'orderDetail', 'amountPayable', 'payway'].includes(formItem.value) === false && !task[formItem.value]}
	<TaskBlank></TaskBlank>
{:else if ['name', 'account'].includes(formItem.value)}
	<TaskName
		name={task[formItem.value]}
		{task}
		{layout}>
	</TaskName>
{:else if ['balance'].includes(formItem.value)}
	<span class="text-danger fs-4">
		<i class="bi bi-currency-yen"></i>
		{formatBalance(task[formItem.value])}
	</span>
{:else if ['amountPayable'].includes(formItem.value) || ['price'].includes(formItem.input)}
	<span class={formItem.withoutClass === true ? '' : formItem.class || 'text-danger fs-4'}>
		{#if formItem.layout === 'yen'}
			<i class="bi bi-currency-yen"></i>
			{formatBalance(task[formItem.value])}
		{:else}
			{formatBalance(task[formItem.value])}
			元
		{/if}
	</span>
{:else if formItem.value === 'orderDetail'}
	<TaskOrderDetail
		{task}
		{layout}>
	</TaskOrderDetail>
{:else if formItem.value === 'payway'}
	<TaskPayway
		{task}
		payway={task[formItem.value]}>
	</TaskPayway>
{:else if formItem.value === 'costType'}
	<TaskCostType
		{task}
		costType={task[formItem.value]}>
	</TaskCostType>
{:else if formItem.value === 'dataSizeUnit'}
	<TaskDataSizeUnit
		{task}
		dataSizeUnit={task[formItem.value]}>
	</TaskDataSizeUnit>
{:else if formItem.value === 'fee'}
	<i class="bi bi-currency-yen"></i>
	{formatFee(task[formItem.value])}
{:else if formItem.value === 'progress'}
	{task[formItem.value]}%
{:else if formItem.value === 'size'}
	{formatSize(task[formItem.value])}
{:else if formItem.value === 'status'}
	<TaskStatus
		status={task.status}
		{layout}>
	</TaskStatus>
{:else if formItem.value === 'type'}
	<TaskType
		type={task.type}
		{layout}>
	</TaskType>
{:else if formItem.value === 'fee_status'}
	<FeeStatus
		status={task.fee_status}
		{layout}>
	</FeeStatus>
{:else if formItem.value === 'rent_user'}
	{task[formItem.value]?.[0]?.nickname || ''}
{:else if formItem.value === 'client_uptime'}
	{formatSeconds(task[formItem.value])}
{:else if ['memory_usage', 'cpu_usage', 'gpu_memory_usage'].includes(formItem.value)}
	{task[formItem.value] || 0}%
{:else if ['datetime'].includes(formItem.input) || ['start_time', 'end_time'].includes(formItem.value)}
	{formatTime(task[formItem.value])}
{:else if ['gpu_status'].includes(formItem.value)}
	<GPUStatus
		status={task[formItem.value]}
		{layout}>
	</GPUStatus>
{:else if ['role'].includes(formItem.value)}
	<TaskRole
		role={task.role}
		{layout}
		{task}>
	</TaskRole>
{:else if ['validity'].includes(formItem.value)}
	<TaskValidity
		validity={task[formItem.value]}
		{layout}
		{task}>
	</TaskValidity>
{:else}
	<span
		style={[`word-break: break-all;`, formItem.style ? formItem.style : ''].join(' ')}
		class={[formItem.class ? formItem.class : ''].join(' ')}>
		{task[formItem.value]}
	</span>
{/if}

<!-- 复制 -->
{#if typeof formItem.valueRender !== 'function' && formItem.showCopy}
	<i
		class="bi bi-copy px-1 clickable"
		title="复制"
		on:keydown={() => {}}
		on:click={async (event) => {
			event.preventDefault();
			event.stopPropagation();

			const text = task[formItem.value];
			await copyToClipboard(text);

			await handlePostResponse({ _id: '1' }, '已复制: ' + text);
		}}>
	</i>
{/if}
