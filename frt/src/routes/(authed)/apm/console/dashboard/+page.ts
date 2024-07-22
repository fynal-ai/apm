import * as api from '$lib/api';
import { subtitle } from '$lib/title';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { user } = await parent();

	subtitle.set('控制台');

	// 模板
	const dashboard = {
		app: {
			status: [
				{
					value: 'all',

					label: '所有',
					amount: 0,
					url: '/cognihub/console/app/my',

					color: 'secondary',
				},
			],
		},
		financial: {
			balance: 0,
			coupon: 0,
			invoice: 0,
		},
	};

	const remoteDashboard = await api.post(
		'/cognihub/console/dashboard/detail',
		{},
		user?.sessionToken
	);

	// 应用概览
	if (Array.isArray(remoteDashboard?.app?.status)) {
		const template = dashboard.app.status;
		const map = remoteDashboard.app.status.reduce((previousValue, currentValue) => {
			previousValue[currentValue.value] = currentValue.amount;
			return previousValue;
		}, {});

		template.map((item) => {
			if (map[item.value] === undefined) {
				return item;
			}

			item.amount = map[item.value];
			return item;
		});
	}

	// 财务概览
	{
		if (remoteDashboard?.financial) {
			Object.assign(dashboard.financial, remoteDashboard.financial);
		}
	}

	return {
		dashboard,

		layout: 'user',
	};
};
