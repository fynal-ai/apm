<script lang="ts">
	import {
		APP_SERVICE_STATUS_COLOR as COGNIHUB_APP_SERVICE_STATUS_COLOR,
		BALANCE_STATUS_COLOR as COGNIHUB_BALANCE_STATUS_COLOR,
		PACKAGE_STATUS_COLOR as COGNIHUB_PACKAGE_STATUS_COLOR,
		SERVICE_STATUS_COLOR as COGNIHUB_SERVICE_STATUS_COLOR,
		TRADE_STATUS_COLOR as COGNIHUB_TRADE_STATUS_COLOR,
	} from '$lib/cognihub';
	import Modal from '$lib/dit/Modal.svelte';
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let status;

	export let layout: TaskListLayout = 'airender';

	export let task: any = {};

	let visible: boolean = false;
</script>

{#if layout === 'airender'}
	<span
		class:text-primary={['underway'].includes(status)}
		class:text-success={['finished'].includes(status)}
		class:text-danger={['failure'].includes(status)}>
		{$_('airender.task.status.' + status)}
	</span>
	{#if task.node_tips}
		<i
			class="bi bi-question-circle clickable"
			on:click={async () => {
				visible = true;
			}}
			on:keydown={() => {}}>
		</i>
		<Modal bind:visible>
			<div slot="title">详情</div>
			<div slot="body">
				{task.node_tips.message}
			</div>
		</Modal>
	{/if}
{:else if layout === 'aiops'}
	<span
		class="badge"
		class:bg-primary={['standby'].includes(status)}
		class:bg-success={['online'].includes(status)}
		class:bg-warning={['maintain'].includes(status)}
		class:bg-danger={['offline'].includes(status)}>
		{$_('aiops.status.' + status)}
	</span>
{:else if layout === 'cognihub.app'}
	<span
		class="badge"
		class:bg-primary={['developing', 'testing'].includes(status)}
		class:bg-success={['deployed'].includes(status)}
		class:bg-warning={['maintenance'].includes(status)}
		class:bg-danger={['offline', 'faulty', 'overdue'].includes(status)}
		class:bg-info={[''].includes(status)}
		class:bg-light={[''].includes(status)}
		class:bg-dark={[''].includes(status)}
		class:bg-secondary={['paused'].includes(status)}>
		{$_('cognihub.app.status.' + status)}
	</span>
{:else if ['cognihub.service'].includes(layout)}
	<span class={`badge bg-${COGNIHUB_SERVICE_STATUS_COLOR[status] || 'secondary'}`}>
		{$_('cognihub.service.status.' + status)}
	</span>
{:else if ['cognihub.package'].includes(layout)}
	<span class={`badge bg-${COGNIHUB_PACKAGE_STATUS_COLOR[status] || 'secondary'}`}>
		{$_('cognihub.package.status.' + status)}
	</span>
{:else if ['cognihub.trade', 'cognihub.trade.admin'].includes(layout)}
	<span class={`badge bg-${COGNIHUB_TRADE_STATUS_COLOR[status] || 'secondary'}`}>
		{$_('cognihub.trade.status.' + status)}
	</span>
{:else if ['cognihub.balance.admin'].includes(layout)}
	<span class={`badge bg-${COGNIHUB_BALANCE_STATUS_COLOR[status] || 'secondary'}`}>
		{$_('cognihub.balance.status.' + status)}
	</span>
{:else if ['cognihub.app.service'].includes(layout)}
	<span class={`badge bg-${COGNIHUB_APP_SERVICE_STATUS_COLOR[status] || 'secondary'}`}>
		{$_('cognihub.app.service.status.' + status)}
	</span>
{:else}
	<span>{status}</span>
{/if}
