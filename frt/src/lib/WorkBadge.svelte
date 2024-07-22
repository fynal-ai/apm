<script lang="ts">
	import { Badge } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import { StatusClass } from '$lib/status';
	export let workid: string;
	export let entry;
</script>

<span>
	{#if workid === entry.workid}
		{#if entry.nodeid === 'ADHOC'}
			<Badge
				pill
				color={'light'}>
				<span class="text-primary">Adhoc</span>
			</Badge>
		{/if}
		<i class="bi bi-star-fill" />
		<Badge
			pill
			color={'light'}>
			<span class="text-primary">{$_('status.' + entry.status)}</span>
		</Badge>
	{:else}
		{#if entry.nodeid === 'ADHOC'}
			<Badge
				pill
				class="bg-white border border-primary">
				<span class={StatusClass(entry.status)}>ADHOC</span>
			</Badge>
		{/if}
		<Badge
			pill
			class="bg-white border border-primary">
			<span class={StatusClass(entry.status)}>
				{$_('status.' + entry.status)}
			</span>
		</Badge>
	{/if}
</span>
