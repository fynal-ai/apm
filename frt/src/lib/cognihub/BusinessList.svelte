<script lang="ts">
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';
	import AppList from '$lib/cognihub/AppList.svelte';
	import AppServiceList from '$lib/cognihub/AppServiceList.svelte';
	import BalanceList from '$lib/cognihub/BalanceList.svelte';
	import BillList from '$lib/cognihub/BillList.svelte';
	import DefaultList from '$lib/cognihub/DefaultList.svelte';
	import PackageList from '$lib/cognihub/PackageList.svelte';
	import ServiceList from '$lib/cognihub/ServiceList.svelte';
	import TradeList from '$lib/cognihub/TradeList.svelte';
	import UserList from '$lib/cognihub/UserList.svelte';

	export let url;
	export let user;

	export let data;

	export let layout: TaskListLayout = 'cognihub.service';

	export let formItems: TaskListItems = [];
</script>

{#if layout === 'cognihub.app'}
	<AppList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</AppList>
{:else if layout === 'cognihub.service'}
	<ServiceList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</ServiceList>
{:else if layout === 'cognihub.package'}
	<PackageList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</PackageList>
{:else if layout === 'cognihub.user'}
	<UserList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</UserList>
{:else if ['cognihub.trade', 'cognihub.trade.admin'].includes(layout)}
	<TradeList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</TradeList>
{:else if ['cognihub.balance.admin'].includes(layout)}
	<BalanceList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</BalanceList>
{:else if ['cognihub.bill', 'cognihub.bill.admin'].includes(layout)}
	<BillList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</BillList>
{:else if layout === 'cognihub.app.service'}
	<AppServiceList
		{url}
		{user}
		{layout}
		{data}
		on:loadNextPage>
	</AppServiceList>
{:else}
	<DefaultList
		{url}
		{user}
		{layout}
		{data}
		{formItems}
		on:loadNextPage>
	</DefaultList>
{/if}
