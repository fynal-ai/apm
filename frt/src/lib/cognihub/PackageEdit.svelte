<script lang="ts">
	import { goto } from '$app/navigation';
	import { replaceURLSearch } from '$lib/airender';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import * as api from '$lib/api';
	import PackageServicesEdit from '$lib/cognihub/PackageServicesEdit.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import { handlePostResponse } from '$lib/dit';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';
	import { createEventDispatcher } from 'svelte';

	export let title = '创建套餐';
	export let _id = '';
	export let edit = false;
	export let user;
	export let url;
	export let formData: any = {
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

		purchaseLimit: '',

		services: [],
	};

	let baseItems: any = [
		{
			value: 'name',
			label: '套餐名称',

			input: 'text',
		},
		{
			value: 'memo',
			label: '套餐描述',

			input: 'textarea',
		},
		{
			value: 'type',
			label: '套餐类型',

			input: 'select',

			options: 'cognihub.package.type',

			col: 6,

			onSelect: async (value) => {
				if (['trial', 'gift'].includes(value)) {
					formData.price.discount = 0.1;
					formData.purchaseLimit = 1;
					return;
				}

				formData.price.discount = '';
				formData.purchaseLimit = '';
			},
		},
		{
			value: 'status',
			label: '套餐状态',

			input: 'select',

			options: 'cognihub.package.status',

			col: 6,
		},
		{
			value: 'purchaseLimit',
			label: '限购数量',

			input: 'number',

			min: 1,
		},
	];
	let priceItems: any = [
		{
			value: 'original',
			label: '原价(元)',
			input: 'number',

			col: 6,
		},
		{
			value: 'discount',
			label: '折扣价(元)',
			input: 'number',

			col: 6,
		},
	];
	let validityItems: any = getValidityItems();
	function getValidityItems() {
		return [
			{
				value: 'validityType',
				label: '有效期类型',

				input: 'select',

				options: 'cognihub.package.validity.validityType',

				col: 4,

				onSelect: async (value) => {
					validityItems = getValidityItems();
					validityValidation = getValidityValidation();
				},
			},
			...(formData.validity.validityType === 'limited'
				? [
						{
							value: 'quantity',
							label: '期限',

							input: 'number',

							col: 4,
						},
						{
							value: 'unit',
							label: '期限类型',

							input: 'select',

							options: 'cognihub.package.validity.unit',

							col: 4,
						},
				  ]
				: []),
		];
	}
	export let redirect = '';

	let baseValidation: ValidationObject = {
		name: {
			schema: ValidationSchemas.TEXT.min(2).max(256).required(),
		},
		memo: {
			schema: ValidationSchemas.TEXT_AREA.min(2).max(1000).required(),
		},
		type: {
			schema: ValidationSchemas.TEXT.min(2).required(),
		},
		status: {
			schema: ValidationSchemas.TEXT.min(2).required(),
		},
	};
	let priceValidation: ValidationObject = {
		original: {
			schema: ValidationSchemas.NUMBER.required(),
		},
	};
	let validityValidation: ValidationObject = getValidityValidation();
	function getValidityValidation() {
		return {
			validityType: {
				schema: ValidationSchemas.TEXT.required(),
			},
			...(formData.validity.validityType === 'limited'
				? {
						quantity: {
							schema: ValidationSchemas.NUMBER.required(),
						},
						unit: {
							schema: ValidationSchemas.TEXT.required(),
						},
				  }
				: {}),
		};
	}

	let servicesComponent;

	const dispatch = createEventDispatcher();

	async function submit(event) {
		let valid = true;

		const postData = {
			...(edit ? { _id: _id } : {}),

			name: formData.name,
			memo: formData.memo,

			type: formData.type,
			status: formData.status,

			price: formData.price,
			validity: formData.validity,

			purchaseLimit: formData.purchaseLimit,

			services: formData.services,
		};

		// console.log('postData', postData);

		{
			baseValidation = validate(baseValidation, postData);
			if (!isValid(baseValidation)) {
				valid = false;
			}
		}
		{
			priceValidation = validate(priceValidation, postData['price']);
			if (!isValid(baseValidation)) {
				valid = false;
			}
		}
		{
			validityValidation = validate(validityValidation, postData['validity']);
			if (!isValid(validityValidation)) {
				valid = false;
			}
		}
		{
			if (!servicesComponent.is_valid()) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await api.post(
				edit ? '/ai2nv/cognihub/console/package/edit' : '/ai2nv/cognihub/console/package/create',
				postData,
				user?.sessionToken
			);

			await handlePostResponse(response, edit ? '编辑成功' : '创建成功');
			if (response._id) {
				await goto(
					redirect
						? replaceURLSearch(redirect, 'packageID', response._id)
						: '/ai2nv/cognihub/console/package'
				);
			}
		}
	}

	async function createService() {
		formData.services = [
			...formData.services,
			{
				service: {
					_id: '',
					name: '',
				},
				qps: '',
				costType: '',
				dataSizeUnit: undefined,
				total: undefined,
			},
		];
	}
</script>

<section>
	<SectionHeader {title}>
		<a
			class="text-primary text-decoration-none"
			href="/ai2nv/cognihub/console/package">
			返回套餐
		</a>
		<button
			class="btn btn-primary"
			on:click={createService}>
			添加服务
		</button>
		<button
			class="btn btn-primary"
			on:click={submit}>
			提交
		</button>
	</SectionHeader>

	<section>
		<div class="row row-cols-1 row-cols-sm-2">
			{#each baseItems as item}
				<div
					class={['col my-1', item.col ? `col-sm-${item.col}` : `col-sm-12`]
						.filter((item) => {
							return item;
						})
						.join(' ')}>
					<div class="form-floating">
						<FormItem
							bind:value={formData[item.value]}
							{item}
							validation={baseValidation[item.value]}>
						</FormItem>
					</div>
				</div>
			{/each}
			{#each priceItems as item}
				<div
					class={['col my-1', item.col ? `col-sm-${item.col}` : `col-sm-12`]
						.filter((item) => {
							return item;
						})
						.join(' ')}>
					<div class="form-floating">
						<FormItem
							bind:value={formData['price'][item.value]}
							{item}
							validation={priceValidation[item.value]}>
						</FormItem>
					</div>
				</div>
			{/each}
			{#each validityItems as item}
				<div
					class={['col my-1', item.col ? `col-sm-${item.col}` : `col-sm-12`]
						.filter((item) => {
							return item;
						})
						.join(' ')}>
					<div class="form-floating">
						<FormItem
							bind:value={formData['validity'][item.value]}
							{item}
							validation={validityValidation[item.value]}>
						</FormItem>
					</div>
				</div>
			{/each}
		</div>

		<section>
			<div class="text-center fs-5 mb-3">{'所有服务'}</div>
			<hr />

			<section>
				<PackageServicesEdit
					{url}
					{user}
					bind:this={servicesComponent}
					formData={formData.services}>
				</PackageServicesEdit>
			</section>
		</section>
	</section>
</section>
