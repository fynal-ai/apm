<script lang="ts">
	import { PACKAGE_TYPE_COLOR as COGNIHUB_PACKAGE_TYPE_COLOR } from '$lib/cognihub';
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let type;

	export let layout: TaskListLayout = 'airender';

	export let task: any = {};

	let visible: boolean = false;
</script>

{#if layout === 'cognihub.package'}
	<span class={`badge bg-${COGNIHUB_PACKAGE_TYPE_COLOR[type] || 'secondary'}`}>
		{$_('cognihub.package.type.' + type)}
	</span>
{:else if ['cognihub.trade', 'cognihub.trade.admin'].includes(layout)}
	{$_('cognihub.trade.type.' + type)}
{:else if ['cognihub.service', 'cognihub.app.service'].includes(layout)}
	{$_('cognihub.service.type.' + type)}
{:else}
	<span>{type}</span>
{/if}
