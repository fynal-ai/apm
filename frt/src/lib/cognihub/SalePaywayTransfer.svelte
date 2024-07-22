<script>
	import Arrow from '../../routes/(baystone)/airesource/[gpu]/Arrow.svelte';
</script>

<section class="py-md-4">
	<header>
		<h3 class="fs-4">线下汇款余额充值结算流程：</h3>
	</header>
	<section class="py-4 d-flex flex-wrap">
		<div class="py-2">
			<span class="border p-2 rounded border-primary">通过对公转账方式充值余额</span>
			<Arrow></Arrow>
		</div>

		<div class="py-2">
			<span class="border p-2 rounded border-primary">等待余额到账的通知</span>
			<Arrow></Arrow>
		</div>

		<div class="py-2">
			<span class="border p-2 rounded border-primary">使用余额支付订单</span>
		</div>
	</section>
	<div class="alert alert-warning">
		请特别注意：该方式是对余额的充值，不会自动支付订单。待余额到账后，您需要再次进入订单管理使用余额支付订单。
	</div>

	<div class="d-flex justify-content-end">
		<a
			class="btn btn-primary"
			href="/cognihub/console/financial/balance?type=offline"
			target="_blank">
			去充值
		</a>
	</div>
</section>
