<script lang="ts">
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import 'highlight.js/styles/paraiso-dark.min.css';
	import AppServiceDoc from './AppServiceDoc.svelte';
	import ListLoadingHandler from './ListLoadingHandler.svelte';

	export let services: any = [];

	export let url;
	export let user;
</script>

<section>
	<SectionHeader title={'文档中心'}></SectionHeader>

	<section>
		<!-- 接口文档 -->
		<ListLoadingHandler list={services}>
			<section class="card p-2">
				<header><h2 class="fs-4">服务</h2></header>
				<section class="row row-cols-1 row-cols-sm-1 row-cols-md-2">
					{#each services as service}
						<div class="col">
							<a
								class="card clickable text-decoration-none"
								style="margin: 12px 0px; height: calc(100% - 24px);"
								title="查看详情"
								href={`/cognihub/doc/service/${service._id}`}>
								<div class="card-header">
									{service.name}
								</div>
								<div class="card-body">
									<div style="font-size: 12px;">
										<AppServiceDoc
											formData={service}
											showDocUrl={false}>
										</AppServiceDoc>
									</div>
									{service.memo}
								</div>
							</a>
						</div>
					{/each}
				</section>
			</section>
		</ListLoadingHandler>
	</section>
</section>
