<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let role;

	export let layout: TaskListLayout = 'cognihub.user';

	export let task: any = {};

	let visible: boolean = false;
</script>

{#if layout === 'cognihub.user'}
	<span
		class="badge"
		class:bg-primary={['admin'].includes(role)}
		class:bg-success={['user'].includes(role)}>
		{$_('cognihub.user.role.' + role)}
	</span>
{/if}
