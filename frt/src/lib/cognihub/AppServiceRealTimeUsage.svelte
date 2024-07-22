<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';

	export let formData = {
		used: 0,
		remaining: 0,
		total: 0,
		costType: '',
		dataSizeUnit: '',
		qps: 1,
		endTime: '',

		app: {
			_id: '',
		},
		package: '',
		service: {
			_id: '',
		},
	};

	let formItems = [
		{
			value: 'used',
			label: '当前使用量',
		},
		...(['time', 'data'].includes(formData.costType)
			? [
					{
						value: 'remaining',
						label: '剩余量',
					},
					{
						value: 'total',
						label: '总量',
					},
				]
			: []),
		{
			value: 'costType',
			label: '计费类型',
		},
		...(['data', 'subscription'].includes(formData.costType)
			? [
					{
						value: 'dataSizeUnit',
						label: '数据大小单位',
					},
				]
			: []),
		{
			value: 'qps',
			label: 'QPS',
		},
		{
			value: 'endTime',
			label: '到期时间',

			input: 'datetime',
		},
	];
</script>

<div class="d-flex gap-3 flex-wrap">
	{#each formItems as item}
		<div>
			<div class="fs-6 text-secondary">{item.label}</div>
			<div class="fs-5">
				<TaskProperty
					task={formData}
					formItem={item}
					layout="cognihub.app.service">
				</TaskProperty>
			</div>
		</div>
	{/each}
	<div>
		<a
			class="btn btn-primary btn-sm"
			href={`/cognihub/sale/buy?appID=${formData.app._id}&packageID=${formData.package}&serviceID=${formData.service._id}`}>
			立即购买
		</a>
	</div>
</div>
