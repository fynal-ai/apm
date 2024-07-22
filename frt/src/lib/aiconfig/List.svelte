<script lang="ts">
	import { _ } from '$lib/i18n';
	import moment from 'moment';

	export let configs: any[] = [];
</script>

<div class="list-group">
	{#each configs as item}
		<a
			class="list-group-item list-group-item-action"
			href={'./edit/' + item.key}>
			<div>{item.key}</div>

			<div class="opacity-50 d-flex gap-2">
				{#each [$_('baystone.ai_config.scopes.' + item.scope), item.createdBy, moment(item.updatedAt).format('LL')] as meta}
					<small class="border rounded-1">{meta}</small>
				{/each}
			</div>
		</a>
	{/each}
</div>
