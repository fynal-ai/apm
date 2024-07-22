<script lang="ts">
	import AppServiceAuthentication from '$lib/cognihub/AppServiceAuthentication.svelte';
	import AppServiceRealTimeUsage from '$lib/cognihub/AppServiceRealTimeUsage.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import AppServiceDoc from './AppServiceDoc.svelte';
	import AppServiceHistoryUsage from './AppServiceHistoryUsage.svelte';

	export let appService: any = {
		service: {},
	};
	export let appServiceUsagesFilters = {
		startTime: new Date(new Date().setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000),
		endTime: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000),
	};
	export let appServiceUsages: any = [
		{
			createdAt: '2023-03-01T10:00:00.000Z',
			used: 100,
		},
	];

	export let url;
	export let user;

	let items: any = [
		{
			value: 'realTimeUsage',
			label: '实时用量',
		},
		{
			value: 'historyUsage',
			label: '历史用量',
		},
		{
			value: 'authentication',
			label: '服务接口认证信息',
		},

		{
			value: 'doc',
			label: '接口文档',
		},
	];
</script>

<section>
	<SectionHeader title={'服务详情 - ' + appService?.service?.name}>
		<a
			class="text-primary text-decoration-none"
			href={`/cognihub/console/app/detail/${appService?.app?._id}`}>
			返回应用详情
		</a>
	</SectionHeader>

	<section>
		<div class="row row-cols-1 row-cols-sm-1 row-cols-md-2">
			{#each items as item}
				<div class="col">
					<section
						class="card"
						style="margin: 12px 0; height: calc(100% - 24px);">
						<h2 class="card-header">{item.label}</h2>

						<section class="card-body">
							{#if item.value === 'authentication'}
								<AppServiceAuthentication formData={appService?.app}></AppServiceAuthentication>
							{:else if item.value === 'realTimeUsage'}
								<AppServiceRealTimeUsage formData={appService}></AppServiceRealTimeUsage>
							{:else if item.value === 'doc'}
								<AppServiceDoc
									formData={appService?.service}
									appID={appService?.app?._id}>
								</AppServiceDoc>
							{:else if item.value === 'historyUsage'}
								<AppServiceHistoryUsage
									{url}
									list={appServiceUsages}
									formData={appServiceUsagesFilters}>
								</AppServiceHistoryUsage>
							{/if}
						</section>
					</section>
				</div>
			{/each}
		</div>
	</section>
</section>
