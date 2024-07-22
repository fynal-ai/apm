<script lang="ts">
	import { goto } from '$app/navigation';
	import GpuBookItem from './GPUBookItem.svelte';
	import ListFilter from './ListFilter.svelte';
	import ListLoadingHandler from './ListLoadingHandler.svelte';
	import PackageSelectItem from './PackageSelectItem.svelte';

	export let listData: any = [
		{
			name: '免费试用包',
			memo: `包含100元额度的体验包`,

			type: '',
			status: '',

			price: {
				original: '',
				discount: '',
			},

			validity: {
				validityType: 'limited',

				quantity: 1,
				unit: 'year',
			},

			services: [],
		},
	];

	export let filterFormData = {
		type: '',
		status: '',
		q: '',
	};
	export let filterFormItems = [
		{
			value: 'type',
			label: '类型',
			input: 'select',

			options: 'cognihub.package.type',

			onSelect: async (value) => {},
		},
		{
			value: 'q',
			label: '查询套餐名称',
			input: 'searchQ',

			onChange: async (value) => {},
		},
	];
	export let loading: boolean = false;
	export let fetchNextPage = async ({ filterFormData, listData }) => {
		return [];
	};

	let loadingMore: boolean = false;
</script>

<section class="card p-2">
	<header>
		<h2 class="fs-5 card-title">所有套餐</h2>
	</header>
	<p class="m-0">筛选您所需要的套餐，点击即可前往购买。</p>

	<ListFilter
		formData={filterFormData}
		formItems={filterFormItems}>
	</ListFilter>

	<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 my-2 py-2">
		<div
			class="col"
			style="cursor: pointer;">
			<div style="margin: 12px 0px; height: calc(100% - 24px);">
				<GpuBookItem />
			</div>
		</div>

		<ListLoadingHandler
			{loading}
			list={listData}>
			{#each listData as option, index}
				<div
					class="col"
					style="cursor: pointer;">
					<div style="margin: 12px 0px; height: calc(100% - 24px);">
						<PackageSelectItem
							data={option}
							on:select={async (event) => {
								await goto(`/cognihub/sale/buy?packageID=${option._id}`);
							}}>
						</PackageSelectItem>
					</div>
				</div>
			{/each}
		</ListLoadingHandler>
	</div>

	<div class="text-center">
		{#if loadingMore}
			<div>
				<span
					class="spinner-border"
					role="status">
				</span>
			</div>
		{/if}
		<button
			class="btn btn-link text-decoration-none"
			on:click={async () => {
				loadingMore = true;

				let new_list_data = await fetchNextPage({ filterFormData, listData });

				listData = [...listData, ...new_list_data];

				loadingMore = false;
			}}>
			加载更多
		</button>
	</div>
</section>
