<script lang="ts">
	import SelectOrSearch from '$lib/aireq/SelectOrSearch.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';

	export let url;
	export let user;
	export let value = {};
	export let appID = '';

	export let onSelect = async (value) => {};

	let validation = {
		schema: ValidationSchemas.TEXT.required(),
	};

	async function searchApp(value) {
		return await api.post(
			'/cognihub/console/app/search',
			{
				...(value && value.name ? { q: value.name } : {}),
				limit: 20,
			},
			user?.sessionToken
		);
	}

	let formItemComponent;

	export function is_valid() {
		return formItemComponent.is_valid();
	}

	onMount(async () => {
		// 获取所选择的应用
		{
			let _id = appID;
			if (_id) {
				const app = await api.post('/cognihub/console/app/detail', { _id }, user?.sessionToken);
				if (app?._id) {
					value = app;
				}
			}
		}
	});
</script>

<SelectOrSearch
	{url}
	{user}
	bind:value
	placeholder="请选择或搜索应用"
	search={searchApp}
	{validation}
	createURL={'/cognihub/console/app/create?redirect=' + encodeURIComponent(url.href)}
	bind:formItemComponent
	{onSelect}>
</SelectOrSearch>
