<script lang="ts">
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas';
	import * as api from '$lib/api';
	import { APP_NAME, getSaleContactEndpoint } from '$lib/cognihub';
	import { handlePostResponse } from '$lib/dit';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';

	export let user;
	export let contact = {
		name: '',
		jobTitle: '',
		email: '',
		phone: '',
		company: '',
		companyScale: '',
		otherMemo: '',
	};

	let formItems = [
		{
			value: 'name',
			label: 'baystone.cognihub.name',
			input: 'text',

			col: 4,
		},
		{
			value: 'phone',
			label: 'baystone.cognihub.phone',
			input: 'text',

			col: 4,
		},
		{
			value: 'email',
			label: 'baystone.cognihub.email',
			input: 'text',

			col: 4,
		},
		{
			value: 'company',
			label: 'baystone.cognihub.company',
			input: 'text',

			col: 4,
		},
		{
			value: 'jobTitle',
			label: 'baystone.cognihub.jobTitle',
			input: 'text',

			col: 4,
		},
		{
			value: 'companyScale',
			label: 'baystone.cognihub.companyScale',
			input: 'text',

			col: 4,
		},
		{
			value: 'otherMemo',
			label: 'baystone.cognihub.otherMemo',
			input: 'textarea',
		},
		// {
		// 	value: 'agreeAgreement',
		// 	label: 'baystone.order.agreeAgreement',
		// 	input: 'checkbox',
		// },
	];

	let validation: ValidationObject = {
		name: {
			schema: ValidationSchemas.TEXT.required(),
		},
		jobTitle: {
			schema: ValidationSchemas.TEXT.required(),
		},
		email: {
			schema: ValidationSchemas.EMAIL.required(),
		},
		phone: {
			schema: ValidationSchemas.MOBILE_PHONE.required(),
		},
		company: {
			schema: ValidationSchemas.TEXT.required(),
		},
		otherMemo: {
			schema: ValidationSchemas.TEXT_AREA.required(),
		},
	};

	async function handleSubmit() {
		console.log(contact);
		validation = validate(validation, contact);
		if (!isValid(validation)) {
			return;
		}

		{
			const response = await api.post(getSaleContactEndpoint(user), contact, user?.sessionToken);

			await handlePostResponse(response, '您的需求已提交 我们会尽快与与您取得联系！');
		}
	}
</script>

<div>
	<section class="text-center">
		<header class="fs-1 mb-2">联系我们</header>
		<p class="mb-5">
			我们很乐意回答您的问题，并让您熟悉{APP_NAME}，包括给您提供有用的资源，为您的团队探索使用案例，及定制付费套餐。
		</p>
	</section>

	<section class="text-center fs-3 mb-5">
		<div>您的联系方式</div>
	</section>

	<section>
		{#if formItems}
			<div class="row row-cols-1">
				{#each formItems as item}
					<div
						class={['col', item.col ? `col-sm-${item.col}` : undefined]
							.filter((item) => {
								return item;
							})
							.join(' ')}>
						<div class="form-floating mb-3">
							<div
								class:form-floating={['checkbox'].includes(item.input) === false}
								class:form-check={['checkbox'].includes(item.input)}>
								<FormItem
									{item}
									bind:value={contact[item.value]}
									validation={validation[item.value]}
									on:clickLabel={(event) => {}}>
								</FormItem>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<div class="d-flex justify-content-end">
		<button
			class="btn btn-primary"
			on:click={handleSubmit}>
			提交
		</button>
	</div>
</div>
