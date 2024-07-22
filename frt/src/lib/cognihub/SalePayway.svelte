<script lang="ts">
	import SalePaywayTradeDetail from '$lib/cognihub/SalePaywayTradeDetail.svelte';
	import SalePaywayChoose from './SalePaywayChoose.svelte';
	import SectionHeader from './SectionHeader.svelte';

	export let url;
	export let user;
	export let searchParams = {
		tradeID: '',
	};
	export let formData = {
		trade: {},
		amountPayable: 0,
		balance: {},
	};
</script>

<section>
	<SectionHeader title={`选择付款方式 - 订单号：${searchParams.tradeID}`}></SectionHeader>

	<section>
		<!-- 订单信息 -->
		<section>
			<SalePaywayTradeDetail formData={formData.trade}></SalePaywayTradeDetail>
		</section>

		<!-- 付款方式 -->
		<section>
			<SalePaywayChoose
				tradeID={searchParams.tradeID}
				formData={{
					amountPayable: formData.amountPayable,
					balance: formData.balance,
				}}
				{url}
				{user}>
			</SalePaywayChoose>
		</section>
	</section>
</section>
