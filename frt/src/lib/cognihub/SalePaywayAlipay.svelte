<script lang="ts">
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import PayByAlipay from '$lib/cognihub/PayByAlipay.svelte';
	import { tick } from 'svelte';

	export let url;
	export let user;
	export let tradeID: string = '';

	let alipayComponent;
	let trade: any = {};

	let formData = {
		tradeID,
	};

	async function submit(event) {
		const postData = {
			...formData,
		};

		{
			const response = await api.post(
				'/cognihub/sale/payway/alipay/pay',
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
</script>

<section>
	<div class="d-flex justify-content-end gap-2 align-items-center flex-wrap">
		<button
			class="btn btn-primary"
			on:click={submit}>
			确认支付
		</button>

		<section>
			{#if trade.payway === 'alipay' && trade?.snapshot?.alipay}
				<PayByAlipay
					bind:this={alipayComponent}
					alipay={trade?.snapshot?.alipay}
					on:cancel={async () => {
						await goto(`/cognihub/console/financial/trade/detail/${trade._id}`);
					}}
					on:paid={async () => {
						await goto(`/cognihub/console/financial/trade/detail/${trade._id}`);
					}}>
				</PayByAlipay>
			{/if}
		</section>
	</div>
</section>
