<script lang="ts">
	import Modal from '$lib/dit/Modal.svelte';
	import { createEventDispatcher } from 'svelte';

	export let alipay: any = {
		trade: {
			page: {
				pay: {
					result: '',
				},
			},
		},
	};

	let alipayDOM;

	let visible: boolean = false;

	const dispatch = createEventDispatcher();

	export async function pay() {
		visible = true;

		const paymentUrl = alipay.trade.page.pay.result;

		alipayDOM.innerHTML = paymentUrl;
		// 自动提交表单
		const form = alipayDOM.querySelector('form');
		if (form) {
			form.target = '_blank';
			form.submit(); // 提交支付表单
		}
	}
</script>

<div bind:this={alipayDOM}></div>
<Modal
	bind:visible
	on:close={async () => {
		dispatch('cancel');
	}}>
	<div slot="title">付款确认</div>
	<div slot="body">
		<p>请在新打开的页面完成订单付款，付款完成前请不要关闭此窗口。</p>
		<p>完成付款后，点击「已完成付款」，查看订单支付状态。</p>
	</div>
	<div
		slot="footer"
		class="w-100 text-center">
		<button
			type="button"
			class="btn btn-primary"
			on:click={async () => {
				visible = false;

				dispatch('paid');
			}}>
			已完成付款
		</button>
	</div>
</Modal>
