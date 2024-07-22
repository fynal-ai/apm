<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import FinancialBalancePayway from './FinancialBalancePayway.svelte';

	export let url;
	export let user;
	export let redirect: string = '';
	export let balance;
</script>

<section>
	<SectionHeader title="余额充值">
		<a
			class="text-primary text-decoration-none"
			href="/cognihub/console/financial/balance/password">
			{balance.hasPassword ? '修改支付密码' : '设置支付密码'}
		</a>
	</SectionHeader>

	<section>
		账户余额： <TaskProperty
			formItem={{
				value: 'balance',
			}}
			task={{
				balance: balance.amount,
			}}></TaskProperty>
	</section>

	<!-- 付款方式 -->
	<section>
		<FinancialBalancePayway
			{url}
			{user}
			{redirect}>
		</FinancialBalancePayway>
	</section>
</section>
