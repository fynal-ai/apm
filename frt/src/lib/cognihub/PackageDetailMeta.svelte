<script lang="ts">
	import DispatchTaskMetaHeader from '$lib/airender/DispatchTaskMetaHeader.svelte';

	export let data: any;

	export let formItems = [
		{
			value: 'status',
			label: '套餐状态',
		},
		{
			value: 'type',
			label: '套餐类型',
		},
		{
			value: 'validity',
			label: '有效期',
		},
		...(data.purchaseLimit
			? [
					{
						value: 'purchaseLimit',
						label: '限购数量',
					},
			  ]
			: []),
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
	];
</script>

<DispatchTaskMetaHeader
	{data}
	headerFormItems={formItems}
	layout="cognihub.package"
	hiddenBlank={false}>
</DispatchTaskMetaHeader>
