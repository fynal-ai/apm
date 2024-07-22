<script lang="ts">
	import { _ } from '$lib/i18n';
	import { Button, Row, Col } from 'sveltestrap';
	import { filterStorage } from '$lib/mtcLocalStores';
	import { TagStorage } from '$lib/Stores';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as api from '$lib/api';

	export let currentTags: string[] = [];
	export let BIZ: string;
	export let useThisTag: (tag: string, appendMode: boolean) => void;
	export let clearTag: (preDelete?: boolean) => {};
	let allTags: any = {
		org: ['TO_BE_RELOADED'],
		mine: ['TO_BE_RELOADED'],
	};

	async function reloadTags() {
		allTags = $TagStorage;
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
			console.log('allTags', allTags);
			if (allTags && allTags.org && Array.isArray(allTags.org)) {
				$TagStorage = allTags;
			} else {
				// setTimeout(async () => {
				// 	await reloadTags();
				// }, 1 * 60 * 1000);
			}
			console.log('tags reloaded');
		}
	}

	$: if ($TagStorage) {
		allTags = $TagStorage;
	}

	$: currentTags = $filterStorage[BIZ].tplTag.split(';');
	onMount(async () => {
		await reloadTags();
		// setTimeout(async () => {
		// 	await reloadTags();
		// }, 5 * 60 * 1000);
	});
</script>

<div class="container mt-2">
	<div class="row mb-2">
		<div class="col-auto">
			<Button
				color={currentTags.length === 0 || currentTags[0].length === 0 ? 'primary' : 'light'}
				class={`mx-1 badge  border border-primary  ${
					currentTags.length === 0 || currentTags[0].length === 0 ? 'text-white' : 'text-primary'
				}`}
				on:click={(e) => {
					e.preventDefault();
					clearTag();
				}}>
				{$_('tag.all')}
			</Button>
			{#if allTags && allTags.org && Array.isArray(allTags.org)}
				{#each allTags.org as tag}
					<Button
						color={currentTags.includes(tag) ? 'primary' : 'light'}
						class={`mx-1 badge  border border-primary ${
							currentTags.includes(tag) ? 'text-white' : 'text-primary'
						}`}
						on:click={(e) => {
							e.preventDefault();
							useThisTag(tag, e.shiftKey);
						}}>
						{tag}
					</Button>
				{/each}
			{/if}
			{#if allTags && allTags.mine && Array.isArray(allTags.mine)}
				{#each allTags.mine as tag}
					<Button
						size="sm"
						color={currentTags.includes(tag) ? 'primary' : 'light'}
						class={`mx-1 badge kfk-round border border-primary ${
							currentTags.includes(tag) ? 'text-white' : 'text-primary'
						}`}
						on:click={(e) => {
							e.preventDefault();
							useThisTag(tag, e.shiftKey);
						}}>
						{tag}
					</Button>
				{/each}
			{/if}
		</div>
	</div>
</div>
