<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let data: any = [
		{
			totalPrice: '',

			discountAmount: '',
			amountPayable: '',
		},
	];

	export let formData = {
		totalPrice: 0,
		discountAmount: 0,
		amountPayable: 0,
	};

	let formItems = [
		{
			value: 'totalPrice',
			label: '商品总额',
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

	const dispatch = createEventDispatcher();

	$: {
		if (data) {
			dataToFormData();
		}
	}

	async function dataToFormData() {
		if (data.length === 0) {
			return;
		}

		// 累计data里的价格到formData里
		const keys = Object.keys(formData);

		formData = data.reduce((previousValue, currentValue) => {
			keys.forEach((key) => {
				previousValue[key] += Number(currentValue[key]);
			});
			return previousValue;
		});
	}
</script>

<section>
	<div class="d-flex justify-content-end">
		<table>
			<thead>
				<tr>
					<th style="min-width: 124px;"></th>
					<th style="min-width: 64px;"></th>
				</tr>
			</thead>
			<tbody class="text-end">
				{#each formItems as item}
					<tr>
						<td class="p-1">{item.label}:</td>
						<td class="p-1">
							{#if item.value === 'amountPayable'}
								<!-- 红色加大 -->
								<span class="fs-4 text-danger">{formData[item.value].toFixed(2)}元</span>
							{:else}
								{formData[item.value].toFixed(2)}元
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
