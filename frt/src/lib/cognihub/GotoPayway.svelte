<script lang="ts">
	import { goto } from '$app/navigation';
	import { handlePostResponse } from '$lib/dit';
	import { refreshPage } from '.';
	import PayByAlipay from './PayByAlipay.svelte';

	export let url;
	export let user;
	export let trade: any;

	let alipayComponent;
</script>

<section>
	<button
		class="btn btn-primary bi bi-cart"
		on:click={async () => {
			if (['recharge'].includes(trade.type)) {
				if (trade.payway === 'alipay') {
					alipayComponent?.pay();
				}

				return;
			}

			await goto(`/cognihub/sale/payway?tradeID=${trade._id}`);
		}}>
		去付款
	</button>

	<button
		class="btn btn-secondary"
		on:click={async () => {
			await refreshPage(url);

			await handlePostResponse({ _id: 1 }, '已刷新订单');
		}}>
		刷新订单
	</button>

	{#if trade.payway === 'alipay' && trade?.snapshot?.alipay}
		<PayByAlipay
			bind:this={alipayComponent}
			alipay={trade?.snapshot?.alipay}
			on:paid={async () => {
				await refreshPage(url);
			}}>
		</PayByAlipay>
	{/if}
</section>
