<script lang="ts">
	import type ValidationObject from '$lib/Joi';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import { searchService } from '$lib/cognihub';
	import { createEventDispatcher, tick } from 'svelte';

	export let url;
	export let user;

	export let formData: any = {
		service: {},
		qps: 1,
		costType: '',
		dataSizeUnit: undefined,
		total: undefined,
	};

	let formItems: any = getFormItems();
	function getFormItems() {
		return [
			{
				value: 'service',
				label: '服务(请选择或搜索服务)',

				col: 6,

				input: 'search',
				options: async (value) => {
					const services = await searchService(
						{
							filter: {
								...(value && value.name ? { q: value.name } : {}),
								limit: 20,
								statuses: ['online', 'running', 'enabled'],
							},
							list: [],
						},
						user?.sessionToken
					);

					if (!services) {
						return [];
					}

					return services.map((s) => {
						return { name: s.name, _id: s._id };
					});
				},
				onSelect: async (_value) => {
					// value = _value;
				},

				labelInValue: true,

				labelKey: 'name',
				valueKey: '_id',

				keepValueSearch: false, // 总是使用空值搜索
			},
			{
				value: 'qps',
				label: 'QPS(每秒查询数)',

				input: 'number',

				min: 1,

				col: 6,
			},
			{
				value: 'costType',
				label: '计费类型',

				input: 'select',

				options: 'cognihub.package.service.costType',

				col: 6,

				onSelect: async (value) => {

					validation = getValidation();					
					formItems = getFormItems();

					// 更新选项
					{
						formData['dataSizeUnit'] = undefined;
						formData['total'] = undefined;
						await tick();
						formItemComponents['dataSizeUnit']?.updateOptions();
					}
				},
			},
			...(['data', 'subscription'].includes(formData.costType)
				? [
						{
							value: 'dataSizeUnit',
							label: '数据大小单位',

							input: 'select',

							options: 'cognihub.package.service.dataSizeUnit',

							col: 6,
						},
					]
				: []),
			...(['time', 'data'].includes(formData.costType)
				? [
						{
							value: 'total',
							label: '总量',

							input: 'number',

							col: 6,
						},
					]
				: []),
		];
	}

	let validation: ValidationObject = getValidation();
	function getValidation() {
		return {
			service: {
				schema: ValidationSchemas.TEXT.min(2).required(),
			},
			qps: {
				schema: ValidationSchemas.NUMBER.min(1).required(),
			},
			costType: {
				schema: ValidationSchemas.TEXT.min(1).required(),
			},

			...(['data'].includes(formData.costType)
				? {
						dataSizeUnit: {
							schema: ValidationSchemas.TEXT.min(1).required(),
						},
					}
				: {}),

			total: {
				schema: ValidationSchemas.NUMBER.min(1).required(),
			},
		};
	}

	const dispatch = createEventDispatcher();

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
	<div class="row row-cols-1 row-cols-sm-2">
		{#each formItems as item}
			<div
				class={['col my-1', item.col ? `col-sm-${item.col}` : `col-sm-12`]
					.filter((item) => {
						return item;
					})
					.join(' ')}>
				<div class="form-floating">
					<FormItem
						bind:this={formItemComponents[item.value]}
						bind:value={formData[item.value]}
						{item}
						validation={validation[item.value]}>
					</FormItem>
				</div>
			</div>
		{/each}
	</div>
</section>
