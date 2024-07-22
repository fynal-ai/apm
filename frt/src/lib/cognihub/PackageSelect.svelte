<script lang="ts">
	import { replaceURLSearch } from '$lib/airender';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import GpuBookItem from './GPUBookItem.svelte';
	import ListLoadingHandler from './ListLoadingHandler.svelte';
	import PackageSelectItem from './PackageSelectItem.svelte';

	export let url;
	export let user;
	export let value = {};
	export let packageID = '';
	export let serviceID = '';

	let loading: boolean = true;

	let options: any = [];
	let selectedIndex = 0;

	onMount(async () => {
		options = await api.post(
			'/cognihub/sale/buy/package/search',
			{
				...(packageID ? { currentID: packageID } : {}),
				...(serviceID ? { serviceID: serviceID } : {}),
			},
			user?.sessionToken
		);

		loading = false;

		value = options[selectedIndex]; // default option
	});
</script>

<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 my-2 py-2">
	<div
		class="col"
		style="cursor: pointer;">
		<div style="margin: 12px 0px; height: calc(100% - 24px);">
			<GpuBookItem />
		</div>
	</div>

	<ListLoadingHandler
		{loading}
		list={options}>
		{#each options as option, index}
			<div
				class="col"
				style="cursor: pointer;">
				<div style="margin: 12px 0px; height: calc(100% - 24px);">
					<PackageSelectItem
						data={option}
						selected={index === selectedIndex}
						on:select={async (event) => {
							selectedIndex = index;

							value = option;
						}}>
					</PackageSelectItem>
				</div>
			</div>
		{/each}
	</ListLoadingHandler>
</div>

<div class="text-center">
	<a
		href={replaceURLSearch(new URL(`/cognihub/pricing`, url), 'serviceID', serviceID)}
		class="text-decoration-none">
		前往查找套餐
	</a>
</div>
