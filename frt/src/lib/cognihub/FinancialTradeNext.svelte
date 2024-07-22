<script lang="ts">
	import { canInvoiceTrade, canPayTrade } from '$lib/cognihub';
	import GotoPayway from './GotoPayway.svelte';

	export let url;
	export let user;
	export let trade: any;

	let alipayComponent;
</script>

{#if canPayTrade(trade)}
	<GotoPayway
		{trade}
		{url}
		{user}>
	</GotoPayway>
{:else if canInvoiceTrade(trade)}
	<section>
		<div class="row py-2">
			<div class="col col-12 col-sm-auto">
				<div
					class="text-success text-center"
					style="font-size: 4rem;">
					<span class="bi bi-check-circle"></span>
				</div>
			</div>
			<div class="col col-12 col-sm-auto">
				{#if ['recharge'].includes(trade.type)}
					<p>
						{trade.payway === 'system'
							? '系统已给您充值，请前往控制台查看'
							: '您已充值成功，请前往控制台查看'}
					</p>
					<div class="d-flex flex-wrap gap-2">
						<a
							class="btn btn-primary bi bi-arrow-right-circle"
							href={`/cognihub/console/financial/balance`}>
							查看余额
						</a>
					</div>
				{:else if ['package_purchase'].includes(trade.type)}
					<p>您已成功交易，请前往控制台查看使用</p>
					<!-- <p>开发票请至 控制台 - 财务 - 发票管理</p> -->
					<div class="d-flex flex-wrap gap-2">
						<a
							class="btn btn-primary bi bi-arrow-right-circle"
							href={`/cognihub/console/app/detail/${trade.snapshot.app._id}`}>
							开始使用
						</a>
						<!-- <a
							class="btn btn-primary bi bi-receipt"
							href={`/cognihub/console/financial/invoice`}>
							去开发票
						</a> -->
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}
