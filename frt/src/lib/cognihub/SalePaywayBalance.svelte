<script lang="ts">
	import { goto } from '$app/navigation';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import * as api from '$lib/api';
	import { handlePostResponse } from '$lib/dit';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';

	export let url;
	export let user;
	export let redirect: string = '';
	export let tradeID: string = '';

	export let data = {
		amountPayable: 440, // 应付金额

		balance: {
			amount: 100,
			hasPassword: true,
		},
	};

	let formData = {
		tradeID,

		password: '',
	};

	let formItems = [
		{
			value: 'password',

			input: 'payPassword',
			label: '支付密码',
		},
	];

	let validation: ValidationObject = {
		password: {
			schema: ValidationSchemas.PAY_PASSWORD.required(),
		},
	};

	let formItemComponents = {};

	async function submit(event) {
		let valid = true;

		const postData = {
			...formData,
		};

		{
			validation = validate(validation, {
				password: formData.password,
			});

			if (!isValid(validation)) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await api.post(
				'/cognihub/sale/payway/balance/pay',
				postData,
				user?.sessionToken
			);

			await handlePostResponse(response, '支付成功');
			if (response._id) {
				await goto(redirect ? redirect : `/cognihub/console/financial/trade/detail/${tradeID}`);
			}
		}
	}
</script>

<section>
	{#if data.balance.hasPassword === true && data.balance.amount >= data.amountPayable}
		<div
			class="d-flex justify-content-end my-2 w-100 align-items-end gap-2"
			style="width: fit-content;">
			{#each formItems as item}
				<div class="form-floating">
					<FormItem
						bind:this={formItemComponents}
						{item}
						bind:value={formData[item.value]}
						validation={validation[item.value]}>
					</FormItem>
				</div>
				{#if item.value === 'password'}
					<a
						href={'/cognihub/console/financial/balance/password?redirect=' +
							encodeURIComponent(url.href)}>
						忘记密码
					</a>
				{/if}
			{/each}
		</div>
	{/if}

	<div class="d-flex justify-content-end gap-2 align-items-center flex-wrap">
		{#if data.balance.hasPassword === false}
			<div>
				使用余额支付前，请先 <a
					href={'/cognihub/console/financial/balance/password?redirect=' +
						encodeURIComponent(url.href)}>
					设置支付密码
				</a>
			</div>
		{:else if data.balance.amount < data.amountPayable}
			余额不足，请先
			<a href={'/cognihub/console/financial/balance?redirect=' + encodeURIComponent(url.href)}>
				充值
			</a>
		{/if}
		<button
			class="btn btn-primary"
			disabled={data.balance.hasPassword === false || data.balance.amount < data.amountPayable}
			on:click={submit}>
			确认支付
		</button>
	</div>
</section>
