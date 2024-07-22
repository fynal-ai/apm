<script lang="ts">
	export let user;
	export let data = {
		balance: 0,
		coupon: 0,
		invoice: 0,
	};
</script>

<section>
	<p>
		当前余额: <span class="fs-1 text-danger">{data.balance.toFixed(2)}</span>
		<span>元</span>
		<a
			class="btn btn-primary btn-sm ms-2"
			href="/cognihub/console/financial/balance">
			去充值
		</a>
	</p>
	<!-- <p>
		代金券数: {data.coupon}
		<span>张</span>
	</p>
	<p>
		发票金额: {data.invoice.toFixed(2)}
		<span>元</span>
	</p> -->
</section>
