<script lang="ts">
	import { page } from '$app/stores';
	import { _ } from '$lib/i18n';
	import type { NavItemsType, NavLayoutType } from './types';

	export let navs: NavItemsType = [
		{
			label: '所有',
			url: '/ai2nv/cognihub/console/user',
		},
		{
			label: '管理员',
			url: '/ai2nv/cognihub/console/user/list/admin',
		},
		{
			label: '普通用户',
			url: '/ai2nv/cognihub/console/user/list/user',
		},
	];
	export let layout: NavLayoutType = 'horizontal';
	export let transferSearch: boolean = true;
</script>

{#if layout === 'horizontal'}
	<nav class="d-flex flex-wrap gap-2 mb-2">
		{#each navs as nav}
			<a
				class="btn btn-sm"
				class:btn-primary={$page.url.pathname.startsWith(nav.baseURL || nav.url)}
				href={transferSearch ? nav.url + $page.url.search : nav.url}>
				{$_(nav.label)}
			</a>
		{/each}
	</nav>
{:else if layout === 'vertical'}
	<nav>
		{#each navs as nav}
			<a
				class="btn btn-sm w-100 my-2 py-2 fs-6"
				class:btn-primary={$page.url.pathname.startsWith(nav.baseURL || nav.url)}
				href={nav.url}>
				{$_(nav.label)}
			</a>
		{/each}
	</nav>
{/if}
