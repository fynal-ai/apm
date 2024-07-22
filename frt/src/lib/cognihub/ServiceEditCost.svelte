<script lang="ts">
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import { tick } from 'svelte';

	let title = '服务计费';
	export let cost = {
		costType: '',

		dataSizeUnit: 'byte',
		dataType: '',

		costPrice: 0,
		costPriceUnit: 'yuan',
		suggestPrice: 0,
	};

	function getItems() {
		return [
			{
				value: 'costType',
				label: '计费类型',

				input: 'select',

				options: 'cognihub.service.cost.costType',

				onSelect: async (value) => {
					// 更新表单和验证
					{
						items = getItems();
						validation = getValidation();
						await tick();
					}

					// 展示正确的下拉选项
					for (let key in formItemComponents) {
						formItemComponents[key].updateOptions();
					}
				},
			},

			...(cost.costType === 'data'
				? [
						{
							value: 'dataSizeUnit',
							label: '数据大小单位',

							input: 'select',

							options: 'cognihub.service.cost.dataSizeUnit',
						},
						{
							value: 'dataType',
							label: '数据类型',

							input: 'select',

							options: 'cognihub.service.cost.dataType',
						},
				  ]
				: []),

			{
				value: 'costPrice',
				label: '价格',

				input: 'number',
			},
			{
				value: 'costPriceUnit',
				label: '价格单位',

				input: 'select',

				options: 'cognihub.service.cost.costPriceUnit',
			},
			{
				value: 'suggestPrice',
				label: '建议价格',

				input: 'number',
			},
		];
	}
	function getValidation() {
		return {
			costType: {
				schema: ValidationSchemas.TEXT.required(),
			},

			...(cost.costType === 'data'
				? {
						dataSizeUnit: {
							schema: ValidationSchemas.TEXT.required(),
						},
						dataType: {
							schema: ValidationSchemas.TEXT.required(),
						},
				  }
				: {}),

			costPrice: {
				schema: ValidationSchemas.NUMBER.min(0).required(),
			},
			costPriceUnit: {
				schema: ValidationSchemas.TEXT.min(0).required(),
			},
		};
	}

	let items = getItems();
	let validation = getValidation();

	let formItemComponents = {};
	export function is_valid() {
		let valid = true;

		{
			Object.keys(formItemComponents).forEach((key) => {
				const formItemComponent = formItemComponents[key];

				if (formItemComponent && !formItemComponent.is_valid()) {
					valid = false;
				}
			});
		}

		return valid;
	}
</script>

<section>
	<header class="d-flex justify-content-between align-items-center">
		<h2 class="fs-6">{title}</h2>
	</header>

	<section>
		<div class="d-flex flex-column gap-3">
			{#each items as item, index}
				<div class="form-floating">
					<FormItem
						bind:this={formItemComponents[index]}
						bind:value={cost[item.value]}
						{item}
						validation={validation[item.value]}>
					</FormItem>
				</div>
			{/each}
		</div>
	</section>
</section>
