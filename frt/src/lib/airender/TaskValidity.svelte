<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { TaskListLayout } from './types';

	export let validity: any = {
		validityType: 'limited', // forever, limited

		quantity: 1,
		unit: 'year',
	};

	export let layout: TaskListLayout = 'cognihub.package';

	export let task: any = {};

	let visible: boolean = false;
</script>

{#if ['cognihub.package'].includes(layout)}
	<span>
		{#if validity.validityType === 'forever'}
			{$_('cognihub.package.validity.validityType.' + validity.validityType)}
		{:else}
			{validity.quantity} {$_('cognihub.package.validity.unit.' + validity.unit)}
		{/if}
	</span>
{:else}
	<span>{validity}</span>
{/if}
