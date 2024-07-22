<script lang="ts">
	import FinancialBalancePaywayOnline from './FinancialBalancePaywayOnline.svelte';

	export let url;
	export let user;
	export let redirect: string = '';

	let navs = [
		{
			value: 'payonline',
			label: '网上充值',
		},
		{
			value: 'transfer',
			label: '转账汇款',
		},
	];

	let currentNavIndex = 0;
</script>

<section class="border border-2 shadow p-4 rounded">
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
				<FinancialBalancePaywayOnline
					{url}
					{user}
					{redirect}>
				</FinancialBalancePaywayOnline>
			{:else if navs[currentNavIndex].value === 'transfer'}
				<section>
					<header>
						<h3 class="fs-4">汇款账号</h3>
					</header>
					<section class="py-2">
						<p>
							请汇款至汇款账号进行充值，在汇款之前或汇款成功后与我们取得联系，我们在收到银行汇款后将为您完成充值。汇款账号如下：
						</p>
						<table class="rounded border border-2">
							<thead></thead>
							<tbody>
								{#each [{ label: '收款户名', value: '英智未来（深圳）人工智能科技有限公司' }, { label: '收款银行', value: '中国农业银行前海分行' }, { label: '收款账号', value: '41013700040101818' }] as item}
									<tr>
										<td class="p-2">{item.label}</td>
										<td class="p-2">{item.value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						<div class="my-2">
							<a
								class="btn btn-primary"
								href="/cognihub/sale/contact">
								联系我们
							</a>
						</div>
					</section>
				</section>
			{/if}
		</section>
	</section>
</section>
