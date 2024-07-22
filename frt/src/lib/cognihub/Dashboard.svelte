<script lang="ts">
	import { filterItemsByLayout } from '.';
	import StatusStatistics from '../../routes/(authed)/dit/StatusStatistics.svelte';
	import DashboardApp from './DashboardApp.svelte';
	import DashboardFinancial from './DashboardFinancial.svelte';
	import DashboardPackage from './DashboardPackage.svelte';
	import DashboardUser from './DashboardUser.svelte';
	import type { DashboardLayoutType } from './types';

	export let url;
	export let user;
	export let dashboard = {
		user: {},
		financial: {
			balance: 0,
			coupon: 0,
			invoice: 0,
		},
		app: {},
		service: {
			status: [],
			type: [],
		},
		package: {},
	};
	export let layout: DashboardLayoutType = 'user';

	export let items = [
		{
			value: 'user',
			label: '用户概览',
		},
		{
			value: 'financial',
			label: '财务概览',

			layout: 'user',
		},
		{
			value: 'app',
			label: '应用概览',

			layout: 'user',
		},
		{
			value: 'service',
			label: '服务概览',

			layout: 'admin',
		},
		{
			value: 'package',
			label: '套餐概览',

			layout: 'admin',
		},
	];
</script>

<section>
	<header>
		<h1>仪表盘</h1>
	</header>

	<section>
		<div class="row row-cols-1 row-cols-sm-1 row-cols-md-2">
			{#each filterItemsByLayout(items, layout) as item}
				<div class="col">
					<section
						class="card"
						style="margin: 12px 0; height: calc(100% - 24px);">
						<h2 class="card-header">{item.label}</h2>

						<section class="card-body">
							{#if item.value === 'user'}
								<DashboardUser
									{layout}
									{user}
									data={dashboard.user}>
								</DashboardUser>
							{:else if item.value === 'financial'}
								<DashboardFinancial
									{user}
									data={dashboard.financial}>
								</DashboardFinancial>
							{:else if item.value === 'app'}
								<DashboardApp
									{user}
									app={dashboard.app}>
								</DashboardApp>
							{:else if item.value === 'service'}
								<StatusStatistics data={dashboard.service.status}></StatusStatistics>
							{:else if item.value === 'package'}
								<DashboardPackage
									{layout}
									{user}
									data={dashboard.package}>
								</DashboardPackage>
							{/if}
						</section>
					</section>
				</div>
			{/each}
		</div>
	</section>
</section>
