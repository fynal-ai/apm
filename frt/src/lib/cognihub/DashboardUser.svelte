<script lang="ts">
	import StatusStatistics from '../../routes/(authed)/dit/StatusStatistics.svelte';
	import type { DashboardLayoutType } from './types';

	export let user;
	export let layout: DashboardLayoutType = 'user';

	export let data: any = {
		role: [
			{
				value: 'all',

				label: '所有',
				amount: 0,
				url: '/ai2nv/cognihub/console/user',

				color: 'secondary',
			},
			{
				value: 'admin',

				label: '管理员',
				amount: 0,
				url: '/ai2nv/cognihub/console/user/list/admin',

				color: 'primary',
			},
			{
				value: 'admin',

				label: '用户',
				amount: 0,
				url: '/ai2nv/cognihub/console/user/list/user',

				color: 'success',
			},
		],
	};
</script>

<section>
	<section>{user.nickname}，您好</section>

	{#if layout === 'admin'}
		<section>
			{#if data?.role}
				<StatusStatistics data={data.role}></StatusStatistics>
			{/if}
		</section>
	{/if}
</section>
