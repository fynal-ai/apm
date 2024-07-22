<script lang="ts">
	import Nav from './Nav.svelte';
	import type { NavItemsType } from './types';

	export let navs: NavItemsType = [
		{
			label: '仪表盘',
			url: '/apm/console/dashboard',
		},
	];
</script>

<section class="row">
	<section class="col col-12 col-sm-2 col-xxl-1">
		<!-- sm vertical -->
		<div class="d-none d-sm-block">
			<Nav
				{navs}
				layout="vertical">
			</Nav>
		</div>

		<!-- <=sm horizontal -->
		<div class="d-block d-sm-none">
			<Nav
				{navs}
				layout="horizontal">
			</Nav>
		</div>
	</section>

	<section class="col col-12 col-sm-10 col-xxl-11">
		<slot />
	</section>
</section>
