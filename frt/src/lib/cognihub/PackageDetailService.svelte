<script lang="ts">
	import DispatchTaskMetaHeader from '$lib/airender/DispatchTaskMetaHeader.svelte';
	import { marked } from 'marked';

	export let url;
	export let user;

	export let formData: any = {
		service: {},
		qps: 1,
		costType: '',
		dataSizeUnit: undefined,
		total: undefined,
	};

	let headerFormItems: any = [
		{
			value: 'qps',
			label: 'QPS(每秒查询数)',
		},
		{
			value: 'costType',
			label: '计费类型',
		},
		...(formData.costType === 'data'
			? [
					{
						value: 'dataSizeUnit',
						label: '数据大小单位',
					},
			  ]
			: []),
		...(['time', 'data'].includes(formData.costType)
			? [
					{
						value: 'total',
						label: '总量',
					},
			  ]
			: []),
	];

	let bodyFormItems: any = [
		{
			value: 'status',
			label: '服务状态',
		},
		{
			value: 'type',
			label: '服务类型',
		},
		{
			value: 'version',
			label: '版本',
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

<section>
	<DispatchTaskMetaHeader
		data={formData}
		{headerFormItems}>
	</DispatchTaskMetaHeader>

	<DispatchTaskMetaHeader
		data={formData.service}
		headerFormItems={bodyFormItems}
		layout="cognihub.service">
	</DispatchTaskMetaHeader>

	<section>
		<header>
			<h3 class="fs-5">{formData.service.name}</h3>
		</header>

		<section>
			<div>{@html marked(formData.service.memo)}</div>
		</section>
	</section>
</section>
