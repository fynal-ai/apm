<script lang="ts">
	import { filterItemsByLayout } from '.';
	import Nav from './Nav.svelte';
	import type { ConsoleLayoutType, NavItemsType } from './types';
	export let layout: ConsoleLayoutType = 'user';

	export let navs: NavItemsType = [
		{
			label: '仪表盘',
			url: '/cognihub/console/dashboard',

			layout: 'user',
		},
		{
			label: '我的应用',
			url: '/cognihub/console/app/my',
			baseURL: '/cognihub/console/app',

			layout: 'user',
		},
		{
			label: '财务',
			url: '/cognihub/console/financial/order',
			baseURL: '/cognihub/console/financial',

			layout: 'user',
		},
		{
			label: '统计',
			url: '/cognihub/console/statistics',

			layout: 'user',
		},
		{
			label: '工单',
			url: '/cognihub/console/workorder',

			layout: 'user',
		},
	];
</script>

<section class="row">
	<section class="col col-12 col-sm-2 col-xxl-1">
		<!-- sm vertical -->
		<div class="d-none d-sm-block">
			<Nav
				navs={filterItemsByLayout(navs, layout)}
				layout="vertical">
			</Nav>
		</div>

		<!-- <=sm horizontal -->
		<div class="d-block d-sm-none">
			<Nav
				navs={filterItemsByLayout(navs, layout)}
				layout="horizontal">
			</Nav>
		</div>
	</section>

	<section class="col col-12 col-sm-10 col-xxl-11">
		<slot />
	</section>
</section>
