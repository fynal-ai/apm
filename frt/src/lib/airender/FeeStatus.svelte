<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let status;

	export let layout: TaskListLayout = 'aiops';
</script>

{#if layout === 'aiops'}
	<span
		class="badge"
		class:bg-success={['normal'].includes(status)}
		class:bg-danger={['arrear'].includes(status)}>
		{$_('aiops.fee_status.' + status)}
	</span>
{/if}
