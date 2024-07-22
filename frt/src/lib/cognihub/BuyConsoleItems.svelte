<script lang="ts">
	import { goto } from '$app/navigation';

	let navs = [
		{
			label: '仪表盘',
			url: '/cognihub/console/dashboard',
		},
		{
			label: '我的应用',
			url: '/cognihub/console/app/my',
			baseURL: '/cognihub/console/app',
		},
		{
			label: '财务',
			url: '/cognihub/console/financial/trade',
			baseURL: '/cognihub/console/financial',
		},
		// {
		// 	label: '统计',
		// 	url: '/cognihub/console/statistics',
		// },
		// {
		// 	label: '工单',
		// 	url: '/cognihub/console/workorder',
		// },
	];
</script>

<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 my-2 py-2">
	{#each navs as nav}
		<div
			class="col"
			style="cursor: pointer;">
			<div style="margin: 12px 0px; height: calc(100% - 24px);">
				<div
					class="border border-2 shadow p-2 rounded rounded-4 position-relative item h-100"
					on:click={async () => {
						await goto(nav.url);
					}}
					on:keydown={() => {}}>
					<div class="text-center">
						<div class="fs-4 py-3">{nav.label}</div>
					</div>
					<div
						class="d-flex justify-content-center py-2"
						style="font-size: 0.8em;">
						<a href={nav.url}>查看详情</a>
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.item:hover {
		--bs-border-opacity: 1;
		border-color: rgba(var(--bs-primary-rgb), var(--bs-border-opacity)) !important;
	}
</style>
