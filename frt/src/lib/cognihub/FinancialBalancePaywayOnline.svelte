<script lang="ts">
	import { goto } from '$app/navigation';
	import TaskPayway from '$lib/airender/TaskPayway.svelte';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import * as api from '$lib/api';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';
	import { tick } from 'svelte';
	import PayByAlipay from './PayByAlipay.svelte';

	export let url;
	export let user;
	export let redirect: string = '';
	export let tradeID: string = '';

	export let formData = {
		amount: 1, // 应付金额

		payway: 'alipay',
	};

	let formItems: any = [
		{
			value: 'amount',
			label: '充值金额',

			input: 'number',
			min: 0.01,
			max: 10000,
		},
		{
			value: 'payway',
			label: '充值方式',

			options: [
				'alipay',
				// 'union_pay'
			],
		},
	];

	let validation: ValidationObject = {
		amount: {
			schema: ValidationSchemas.NUMBER.min(0.01).required(),
		},
	};

	let trade: any = {};
	let alipayComponent;

	async function submit() {
		let valid = true;

		const postData = {
			...formData,
		};

		// console.log(postData);

		{
			validation = validate(validation, postData);
			if (!isValid(validation)) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await api.post(
				'/cognihub/console/financial/balance/pay',
				postData,
				user?.sessionToken
			);

			if (response._id) {
				// 弹出对话框
				// 跳转到支付页面
				trade = response;

				{
					await tick();
					if (alipayComponent?.pay) {
						alipayComponent.pay();
					}
				}
			}
		}
	}

	async function onCancelPaid() {
		await goto(redirect ? redirect : `/cognihub/console/financial/trade/detail/${trade._id}`);
	}
	async function onPaid() {
		await goto(redirect ? redirect : `/cognihub/console/financial/trade/detail/${trade._id}`);
	}
</script>

<section>
	{#each formItems as item, index}
		<div class="my-1 d-flex flex-wrap align-items-center">
			<span class="mr-2">
				{item.label}
				<span class="text-danger">*</span>
				：
			</span>
			{#if item.value === 'amount'}
				<div>
					<FormItem
						{item}
						bind:value={formData[item.value]}
						showLabel={false}
						validation={validation[item.value]}>
					</FormItem>
				</div>
				<span class="px-2">元 （注：充值金额最小单位为元）</span>
			{:else if item.value === 'payway'}
				{#each item.options as option}
					<div class="px-2">
						<input
							type="radio"
							id={item.value + option}
							name={item.value}
							value={option}
							checked={formData[item.value] === option}
							on:change={async (event) => {
								formData[item.value] = event.target.value;
							}} />
						<label for={item.value + option}>
							<TaskPayway
								task={formData}
								payway={option}>
							</TaskPayway>
						</label>
					</div>
				{/each}
			{/if}
		</div>
	{/each}

	<section>
		<button
			class="btn btn-primary"
			on:click={submit}>
			充值
		</button>
	</section>

	<section>
		{#if trade.payway === 'alipay' && trade?.snapshot?.alipay}
			<PayByAlipay
				bind:this={alipayComponent}
				alipay={trade?.snapshot?.alipay}
				on:cancel={onCancelPaid}
				on:paid={onPaid}>
			</PayByAlipay>
		{/if}
	</section>
</section>
