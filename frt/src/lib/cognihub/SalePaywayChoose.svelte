<script lang="ts">
	import SalePaywayOnline from './SalePaywayOnline.svelte';
	import SalePaywayTransfer from './SalePaywayTransfer.svelte';

	export let url;
	export let user;
	export let tradeID: string = '';

	export let formData: any = {
		amountPayable: 0,
		balance: {},
	};
	let formItems = [
		{
			value: 'orderDetail',
			label: '订单信息',
		},
		{
			value: 'createdAt',
			label: '订单时间',

			input: 'datetime',
		},
		{
			value: 'amountPayable',
			label: '应付金额',
		},
	];

	let navs = [
		{
			value: 'payonline',
			label: '线上支付',
		},
		{
			value: 'transfer',
			label: '转账汇款',
		},
	];

	let currentNavIndex = 0;
</script>

<section class="border border-2 shadow p-4 rounded">
	<header>
		<h2 class="fs-6">选择支付方式</h2>
	</header>

	<section>
		<nav class="d-flex flex-wrap gap-2 mb-2">
			{#each navs as nav, index}
				<button
					class="btn btn-sm"
					class:btn-primary={currentNavIndex === index}
					on:click={async (event) => {
						currentNavIndex = index;
					}}>
					{nav.label}
				</button>
			{/each}
		</nav>

		<section class="p-2">
			{#if navs[currentNavIndex].value === 'payonline'}
				<SalePaywayOnline
					{tradeID}
					{formData}
					{url}
					{user}>
				</SalePaywayOnline>
			{:else if navs[currentNavIndex].value === 'transfer'}
				<SalePaywayTransfer></SalePaywayTransfer>
			{/if}
		</section>
	</section>
</section>
