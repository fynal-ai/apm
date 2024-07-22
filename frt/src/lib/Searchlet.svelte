<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import { savedSearches, lastQuery } from '$lib/Stores';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import * as api from '$lib/api';

	export let objtype: string;
	export let aSsPicked: string;
	const dispatch = createEventDispatcher();
	let user = $page.data.user;
	let showSaveSearchForm = false;
	let newSsName = '';

	onMount(async () => {
		$savedSearches[objtype] = await api.post(
			'savedsearch/list',
			{ objtype: objtype },
			user.sessionToken,
			api.CACHE_FLAG.useIfExists,
		);
	});

	const saveSearch = async () => {
		api
			.post(
				'savedsearch/save',
				{ objtype: objtype, name: newSsName, ss: JSON.stringify($lastQuery[objtype]) },
				user.sessionToken,
			)
			.then((res) => {
				$savedSearches[objtype] = $savedSearches[objtype].filter((x) => x !== res);
				$savedSearches[objtype].unshift(res);
				$savedSearches = $savedSearches;
			});
		showSaveSearchForm = false;
		newSsName = '';
	};

	const useSearch = async () => {
		dispatch(
			'searchlet',
			await api.post(
				'savedsearch/getone',
				{ objtype: objtype, name: aSsPicked },
				user.sessionToken,
			),
		);
	};

	const resetSearchlet = async () => {
		$savedSearches[objtype] = await api.post(
			'savedsearch/list',
			{ objtype: objtype },
			user.sessionToken,
			api.CACHE_FLAG.preDelete,
		);
		dispatch('resetSearchlet', '');
	};
</script>

<div class="row">
	<div class="input-group">
		<div class="input-group-text">
			{$_('searchlet.existing')}
		</div>
		{#if $savedSearches[objtype].length > 0}
			<select
				class="form-control"
				bind:value={aSsPicked}
				on:change={(_) => {
					if (aSsPicked !== '---PLS_PICK_ONE---') useSearch();
					else {
						resetSearchlet();
					}
				}}>
				<option value={'---PLS_PICK_ONE---'}>{$_('searchlet.pick')}</option>
				{#each $savedSearches[objtype] as aSS}
					<option value={aSS}>{aSS}</option>
				{/each}
			</select>
		{:else}
			<select class="form-control" />
		{/if}
		<!-- <div -->
		<!-- 	class="btn btn-primary ms-3" -->
		<!-- 	on:keydown={() => {}} -->
		<!-- 	on:keyup={() => {}} -->
		<!-- 	on:keypress={() => {}} -->
		<!-- 	on:click|preventDefault={resetSearchlet} -->
		<!-- 	color="primary"> -->
		<!-- 	<i class="bi bi-bootstrap-reboot" /> -->
		<!-- 	{$_('searchlet.reset')} -->
		<!-- </div> -->
	</div>
</div>
<div class="row">
	<div class="input-group">
		<div class="input-group-text">
			{$_('searchlet.new')}
		</div>
		<input
			class="form-control"
			bind:value={newSsName}
			placeholder={$_('searchlet.nameit')} />
		<div
			class="btn btn-primary"
			on:keydown={null}
			on:click|preventDefault={saveSearch}>
			<i class="bi bi-save" />
		</div>
		<!-- <div -->
		<!-- 	class="btn btn-secondary" -->
		<!-- 	on:keydown={() => {}} -->
		<!-- 	on:keyup={() => {}} -->
		<!-- 	on:keypress={() => {}} -->
		<!-- 	on:click|preventDefault={(_) => { -->
		<!-- 		showSaveSearchForm = false; -->
		<!-- 	}}> -->
		<!-- 	{$_('searchlet.cancel')} -->
		<!-- </div> -->
	</div>
</div>
