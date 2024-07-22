<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let costType: string = '';

	export let layout: TaskListLayout = 'cognihub.app.service';

	export let task: any = {};

	let visible: boolean = false;
</script>

{#if ['cognihub.app.service'].includes(layout)}
	<span>
		{$_('cognihub.package.service.costType.' + costType)}
	</span>
{:else}
	<span>{costType}</span>
{/if}
