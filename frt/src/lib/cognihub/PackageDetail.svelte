<script lang="ts">
	import PackageDetailServices from '$lib/cognihub/PackageDetailServices.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import { marked } from 'marked';
	import PackageDetailMeta from './PackageDetailMeta.svelte';

	export let packageItem: any;

	export let url;
	export let user;

	let packageMeta = {
		formItems: [
			{
				value: 'status',
				label: '套餐状态',
			},
			{
				value: 'type',
				label: '套餐类型',
			},
			{
				value: 'price.discount',
				label: '优惠价',

				input: 'price',

				withoutClass: true,

				layout: 'yen',
			},
			{
				value: 'price.original',
				label: '原价',

				input: 'price',

				withoutClass: true,

				layout: 'yen',
			},
			{
				value: 'createdAt',
				label: '创建时间',

				input: 'datetime',
			},
			{
				value: 'updatedAt',
				label: '更新时间',

				input: 'datetime',
			},
		],
	};
</script>

<section>
	<SectionHeader title={'套餐详情 - ' + packageItem.name}>
		<a
			class="text-primary text-decoration-none"
			href={`/cognihub/pricing`}>
			返回套餐列表
		</a>

		<a
			class="btn btn-primary"
			href={`/cognihub/sale/buy?packageID=${packageItem._id}`}>
			立即购买
		</a>
	</SectionHeader>

	<section>
		<PackageDetailMeta data={packageItem}></PackageDetailMeta>
	</section>

	<section>
		<div class="card p-2">{@html marked(packageItem.memo)}</div>
	</section>

	<section>
		<div class="text-center fs-5 mb-3">{`所有服务(${packageItem.services.length})`}</div>
		<hr />

		<section>
			<PackageDetailServices
				{url}
				{user}
				formData={packageItem.services}>
			</PackageDetailServices>
		</section>
	</section>
</section>
