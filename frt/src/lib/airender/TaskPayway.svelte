<script lang="ts">
	import TaskBlank from '$lib/airender/TaskBlank.svelte';
	import type { PaywayType } from '$lib/airender/types';
	import SvgIcons from '$lib/cognihub/SvgIcons.svelte';

	export let task: any = {};
	export let payway: PaywayType;
</script>

<SvgIcons></SvgIcons>

{#if payway === 'alipay'}
	<svg
		style="
    width: 5rem;
    height: 5rem;
">
		<use xlink:href="#icon-alipay"></use>
	</svg>
{:else if payway === 'balance'}
	<div
		class="d-flex flex-wrap align-items-center"
		style="min-width: 80px;">
		<img
			src="/images/balance.png"
			style="width: 24px;"
			alt="" />
		<div class="text-primary">
			<span
				data-v-78956ea7=""
				class="balance-title">
				余额支付
			</span>
			{#if task.balance}
				<span>
					可用余额：{task.balance.amount ? task.balance.amount.toFixed(2) : '0.00'}元
				</span>
			{/if}
		</div>
	</div>
{:else if payway === 'union_pay'}
	<img
		data-v-78956ea7=""
		src="/images/union_pay.png"
		style="width: 52px; vertical-align: middle;"
		alt="" />

	<span>银联支付</span>
{:else if payway === 'wechat_pay'}
	<svg
		style="
    width: 3rem;
    height: 3rem;
">
		<use xlink:href="#icon-wechat"></use>
	</svg>
	<span>微信支付</span>
{:else if payway === 'system'}
	系统充值
{:else}
	<TaskBlank></TaskBlank>
{/if}
