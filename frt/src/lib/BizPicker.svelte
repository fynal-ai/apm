<script lang="ts">
	import { _ } from '$lib/i18n';
	import { TabContent, TabPane } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as api from '$lib/api';
	import { currentTplid } from '$lib/Stores';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let allTags: any = {
		org: ['TO_BE_RELOADED'],
		mine: ['TO_BE_RELOADED'],
	};
	let tagsArr: string[] = ['all'];

	const tagTpls = {};

	const reloadTags = async () => {
		if (
			allTags &&
			allTags.org &&
			Array.isArray(allTags.org) &&
			allTags.org[0] !== 'TO_BE_RELOADED'
		) {
			console.log('tags use cached', allTags);
		} else {
			allTags.org = await api.post('tag/org', {}, $page.data.token);
			allTags.mine = await api.post('tag/list', { objtype: 'template' }, $page.data.token);
			tagsArr = [...new Set(tagsArr.concat(allTags.org))];
			tagsArr = [...new Set(tagsArr.concat(allTags.mine))];
		}
	};

	const refreshTplIds = async (tag: string) => {
		const payload = {
			tagsForFilter: [tag],
		};
		if (tag === 'all') {
			payload.tagsForFilter = [];
		}
		const ret = await api.post('template/search', payload, $page.data.token);
		console.log(ret);
		tagTpls[tag] = ret.objs;
	};

	onMount(async () => {
		await reloadTags();
	});
</script>

<TabContent
	vertical
	on:tab={(e) => {
		refreshTplIds(e.detail.toString());
	}}
	pills>
	{#each tagsArr as tag}
		<TabPane
			tabId={tag}
			tab={tag === 'all' ? $_('tag.all') : tag}>
			{#if tagTpls[tag]}
				<div class="container p-3">
					{#each tagTpls[tag] as tpl}
						<div class="row">
							<div
								class="col kfk-link clickable"
								on:keydown={null}
								on:click={() => {
									dispatch('biz', tpl.tplid);
								}}>
								{tpl.tplid}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</TabPane>
	{/each}
</TabContent>
