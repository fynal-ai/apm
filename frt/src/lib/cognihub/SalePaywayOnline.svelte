<script lang="ts">
	import TaskPayway from '$lib/airender/TaskPayway.svelte';
	import SalePaywayAlipay from '$lib/cognihub/SalePaywayAlipay.svelte';
	import SalePaywayBalance from '$lib/cognihub/SalePaywayBalance.svelte';

	export let url;
	export let user;
	export let redirect: string = '';
	export let tradeID: string = '';

	export let formData = {
		amountPayable: 440, // 应付金额

		balance: {
			amount: 100,
			hasPassword: true,
		},
	};

	let checkedIndex = 0;

	let formItems: any = [
		{
			value: 'balance',
			label: '余额支付',
		},
		{
			value: 'alipay',
			label: '支付宝支付',
		},
		// {
		// 	value: 'wechat_pay',
		// 	label: '微信支付',
		// },
		// {
		// 	value: 'union_pay',
		// 	label: '银联支付',
		// },
	];
</script>

<section>
	{#each formItems as item, index}
		<div
			class="my-2 d-flex flex-wrap align-items-center"
			style="user-select: none; cursor: pointer;"
			on:click={async (event) => {
				checkedIndex = index;
			}}
			on:keydown={() => {}}>
			<div class="pe-2">
				<input
					type="radio"
					class=""
					checked={checkedIndex === index} />
			</div>

			<TaskPayway
				task={formData}
				payway={item.value}>
			</TaskPayway>
		</div>
	{/each}

	<section>
		{#if formItems[checkedIndex].value === 'balance'}
			<SalePaywayBalance
				{user}
				{url}
				{tradeID}
				{redirect}
				data={formData}>
			</SalePaywayBalance>
		{:else if formItems[checkedIndex].value === 'alipay'}
			<SalePaywayAlipay
				{user}
				{url}
				{tradeID}>
			</SalePaywayAlipay>
		{/if}
	</section>
</section>
