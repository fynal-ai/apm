<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let status;

	export let layout: TaskListLayout = 'aiops';
</script>

{#if layout === 'aiops'}
	<span
		class="badge"
		class:bg-success={['inuse'].includes(status)}
		class:bg-secondary={['notinuse'].includes(status)}>
		{$_('aiops.gpu_status.' + status)}
	</span>
{/if}
