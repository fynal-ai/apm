<script lang="ts">
	import type { ValidationObject } from '$lib/Joi';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import { _ } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';

	export let data: any = [
		{
			app: {},
			package: {},
		},
	];

	export let formData: any = [
		{
			appName: '',
			packageName: '',
			totalPrice: '',
			amount: '',
			discountAmount: '',
			amountPayable: '',
		},
	];

	let formItems = [
		{
			value: 'appName',
			label: '应用名称',
		},
		{
			value: 'packageName',
			label: '购买商品/套餐',
		},
		{
			value: 'totalPrice',
			label: '商品总额',
		},
		{
			value: 'amount',
			label: '数量',

			input: 'number',

			min: 1,
		},
		{
			value: 'discountAmount',
			label: '优惠金额',
		},
		{
			value: 'amountPayable',
			label: '应付金额',
		},
	];

	let validation: ValidationObject = {
		amount: {
			schema: ValidationSchemas.NUMBER.min(1).required(),
		},
	};

	let formItemComponents = {};

	const dispatch = createEventDispatcher();

	$: {
		if (data) {
			dataToFormData();
		}
	}

	async function dataToFormData() {
		formData = data.map((item, index) => {
			const amount = 1;

			return {
				appName: item?.app?.name,
				packageName: item?.package?.name,

				amount,

				...computePrice(item, amount),
			};
		});
	}

	function computePrice(item, amount) {
		return {
			totalPrice: item?.package?.price?.original ? item?.package?.price?.original * amount : 0,
			discountAmount:
				item?.package?.price?.original && typeof item?.package?.price?.discount === 'number'
					? (item?.package?.price?.original - item?.package?.price?.discount) * amount
					: 0,
			amountPayable:
				typeof item?.package?.price?.discount === 'number'
					? item?.package?.price?.discount * amount
					: 0,
		};
	}

	function canDisableAmountChange(item) {
		return ['trial', 'gift'].includes(item?.package?.type);
	}

	export function is_valid() {
		let valid = true;

		{
			Object.keys(formItemComponents).forEach((key) => {
				const component = formItemComponents[key];

				if (component && !component.is_valid()) {
					valid = false;
				}
			});
		}

		return valid;
	}
</script>

<form>
	<div
		class="text-center bg-white"
		style="overflow: auto; max-width: 100%; max-height: 64vh">
		<table class="w-100">
			<thead>
				<tr class="border-bottom position-sticky top-0 bg-light">
					{#each formItems as item}
						<th
							style="min-width: 148px;"
							class="p-1 px-sm-4 py-sm-3">
							{$_(item.label)}
						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#if formData && formData.length > 0}
					{#each formData as formItemData, index}
						<tr class="border-bottom">
							{#each formItems as item}
								<td class="p-1 px-sm-4 py-sm-3">
									{#if item.input === 'number' && canDisableAmountChange(data[index]) === false}
										<FormItem
											bind:this={formItemComponents[item.value]}
											item={{
												...item,

												onChange: async (value) => {
													formData[index] = {
														...formData[index],

														...computePrice(data[index], value),
													};
												},
											}}
											bind:value={formItemData[item.value]}
											validation={validation[item.value]}
											showLabel={false}>
										</FormItem>
									{:else if ['totalPrice', 'discountAmount', 'amountPayable'].includes(item.value)}
										<i class="bi bi-currency-yen"></i>
										{formItemData[item.value].toFixed(2)}
									{:else}
										{formItemData[item.value] || ''}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</form>
