<script lang="ts">
	import AppAPIKey from '$lib/cognihub/AppAPIKey.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import type { NavItemsType } from '$lib/cognihub/types';
	import AppServices from './AppServices.svelte';

	export let app: any = {};
	export let services;

	export let url;
	export let user;

	let navs: NavItemsType = [
		{
			label: '所有',
			url: `/cognihub/console/app/detail/${app._id}`,
		},
		{
			label: '已购买',
			url: `/cognihub/console/app/detail/${app._id}`,
		},
		{
			label: '未购买',
			url: `/cognihub/console/app/detail/${app._id}`,
		},
	];
</script>

<section>
	<SectionHeader title={'应用详情 - ' + app.name}>
		<a
			class="text-primary text-decoration-none"
			href="/cognihub/console/app/my">
			返回我的应用
		</a>
	</SectionHeader>

	<section>
		<AppAPIKey
			formData={app}
			{url}
			{user}>
		</AppAPIKey>
	</section>

	<section class="mt-5">
		<AppServices data={services}></AppServices>
	</section>
</section>
