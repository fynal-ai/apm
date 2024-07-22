<script lang="ts">
	import ListLoadingHandler from '$lib/cognihub/ListLoadingHandler.svelte';
	import PackageDetailService from '$lib/cognihub/PackageDetailService.svelte';

	export let url;
	export let user;

	export let formData: any = [
		{
			service: {},
			qps: '',
			costType: '',
			dataSizeUnit: '',
			total: '',
		},
	];
</script>

<ListLoadingHandler list={formData}>
	{#each formData as data, index}
		<div class="mb-4 card p-2">
			<div class="d-flex flex-wrap gap-2 justify-content-end">
				<a
					class="text-decoration-none"
					href={`/cognihub/pricing?serviceID=${data.service._id}`}>
					查找包含本服务的套餐
				</a>
				<a
					class="text-decoration-none"
					href={data.service.docUrl
						? data.service.docUrl
						: `/cognihub/doc/service/${data.service._id}`}>
					查看文档
				</a>
			</div>
			<PackageDetailService
				{url}
				{user}
				formData={data}>
			</PackageDetailService>
		</div>
	{/each}
</ListLoadingHandler>
