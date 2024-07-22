<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let dataSizeUnit: string = '';

	export let layout: TaskListLayout = 'cognihub.app.service';

	export let task: any = {};

	let visible: boolean = false;
</script>

{#if ['cognihub.app.service'].includes(layout)}
	<span>
		{$_('cognihub.package.service.dataSizeUnit.' + dataSizeUnit)}
	</span>
{:else}
	<span>{dataSizeUnit}</span>
{/if}
