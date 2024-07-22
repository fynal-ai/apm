import { goto } from '$app/navigation';
import { PUBLIC_API_SERVER } from '$env/static/public';
import { replaceURLSearch } from '$lib/airender';
import * as api from '$lib/api';

const APP_NAME = 'APM';

function isAdmin(user) {
	if (!user) {
		return false; // 未登录
	}

	return (
		['AI2NV_COGNIHUB'].findIndex((item) => {
			return user.group.includes(item);
		}) > -1
	);
}

async function copyToClipboard(text: string) {
	if (!navigator.clipboard) {
		const textArea = document.createElement('textarea');
		textArea.value = text;

		// Avoid scrolling to bottom
		textArea.style.top = '0';
		textArea.style.left = '0';
		textArea.style.position = 'fixed';

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			const successful = document.execCommand('copy');
			const msg = successful ? 'successful' : 'unsuccessful';
			console.log('Fallback: Copying text command was ' + msg);
		} catch (err) {
			console.error('Fallback: Oops, unable to copy', err);
		}

		document.body.removeChild(textArea);
		return;
	}
	return await new Promise((resolve, reject) => {
		navigator.clipboard.writeText(text).then(
			function () {
				console.log('Async: Copying to clipboard was successful!');
				// toast.success('Copying to clipboard was successful!');
				resolve(true);
			},
			function (err) {
				console.error('Async: Could not copy text: ', err);
				reject(err);
			}
		);
	});
}

function getSaleContactEndpoint(user) {
	if (user) {
		return '/cognihub/sale/contact';
	}
	return '/cognihub/public/sale/contact';
}

async function refreshPage(url) {
	await goto(replaceURLSearch(url, 'random', Math.random().toString(36).substring(7)), {
		keepFocus: true,
		noScroll: true,
	});
}

function filterItemsByLayout(items, layout) {
	return items.filter((i) => {
		return !i.layout || i.layout === layout; // 没有设置layout或者layout与当前布局相等
	});
}

// 使用远程数据替换模板里的值
function replaceTemplateWithRemote(template, remote) {
	if (Array.isArray(remote)) {
		const map = remote.reduce((previousValue, currentValue) => {
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
	return template;
}

async function searchApp({ filter, list = [] }, token) {
	let { q } = filter;

	return await api.post(
		'/cognihub/console/app/search',
		{
			...(q ? { q } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchUser({ filter, list = [] }, token) {
	let { role, q } = filter;

	return await api.post(
		'/ai2nv/cognihub/console/user/search',
		{
			...(role && role !== 'all' ? { role } : {}),
			...(q ? { q } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchService({ filter, list = [] }, token) {
	let { status, type, q, statuses } = filter;

	return await api.post(
		'/ai2nv/cognihub/console/service/search',
		{
			...(status && status !== 'all' ? { status } : {}),
			...(statuses && statuses.length > 0 ? { statuses } : {}),
			...(type ? { type } : {}),

			...(q ? { q } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchServicePublic({ filter, list = [] }) {
	let { type, q } = filter;

	return await api.post('/cognihub/pricing/service/search', {
		...(type ? { type } : {}),
		...(q ? { q } : {}),

		...(list && list.length > 0
			? {
					pagingMark: list[list.length - 1]?.updatedAt,
			  }
			: {}),
	});
}
async function searchPackage({ filter, list = [] }, token) {
	let { status, type, q } = filter;

	return await api.post(
		'/ai2nv/cognihub/console/package/search',
		{
			...(status && status !== 'all' ? { status } : {}),
			...(type ? { type } : {}),

			...(q ? { q } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchPackagePublic({ filter, list = [] }) {
	let { type, q, serviceID } = filter;

	return await api.post('/cognihub/pricing/package/search', {
		...(type ? { type } : {}),
		...(q ? { q } : {}),
		...(serviceID ? { serviceID } : {}),

		...(list && list.length > 0
			? {
					pagingMark: list[list.length - 1]?.updatedAt,
			  }
			: {}),
	});
}
async function searchTrade({ filter, list = [] }, token) {
	let { q, status, startTime, endTime } = filter;

	return await api.post(
		'/cognihub/console/financial/trade/search',
		{
			...(q ? { q } : {}),
			...(status && status !== 'all' ? { status } : {}),
			...(startTime ? { startTime } : {}),
			...(endTime ? { endTime } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchTradeAdmin({ filter, list = [] }, token) {
	let { q, status, type, payway, startTime, endTime } = filter;

	return await api.post(
		'/ai2nv/cognihub/console/financial/trade/search',
		{
			...(q ? { q } : {}),
			...(status && status !== 'all' ? { status } : {}),
			...(type && type !== 'all' ? { type } : {}),
			...(payway && payway !== 'all' ? { payway } : {}),
			...(startTime ? { startTime } : {}),
			...(endTime ? { endTime } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchBalanceAdmin({ filter, list = [] }, token) {
	let { q, status } = filter;

	return await api.post(
		'/ai2nv/cognihub/console/financial/balance/search',
		{
			...(q ? { q } : {}),
			...(status && status !== 'all' ? { status } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchBill({ filter, list = [] }, token) {
	let { q, startTime, endTime } = filter;

	return await api.post(
		'/cognihub/console/financial/bill/search',
		{
			...(q ? { q } : {}),
			...(startTime ? { startTime } : {}),
			...(endTime ? { endTime } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchBillAdmin({ filter, list = [] }, token) {
	let { q, startTime, endTime } = filter;

	return await api.post(
		'/ai2nv/cognihub/console/financial/bill/search',
		{
			...(q ? { q } : {}),
			...(startTime ? { startTime } : {}),
			...(endTime ? { endTime } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}
async function searchAppService({ filter, list = [] }, token) {
	let { status, type, q, statuses, appID } = filter;

	return await api.post(
		'/cognihub/console/app/service/search',
		{
			appID,

			...(status && status !== 'all' ? { status } : {}),
			...(statuses && statuses.length > 0 ? { statuses } : {}),
			...(type ? { type } : {}),

			...(q ? { q } : {}),

			...(list && list.length > 0
				? {
						pagingMark: list[list.length - 1]?.updatedAt,
				  }
				: {}),
		},
		token
	);
}

function getServiceEndpoint(service) {
	return getServiceIDEndpoint(service._id);
}
function getServiceIDEndpoint(serviceID) {
	return `${PUBLIC_API_SERVER}/cognihub/service/${serviceID}`;
}

const SERVICE_STATUS_COLOR = {
	design: 'primary',
	development: 'primary',
	testing: 'primary',
	deployment: 'primary',
	maintenance: 'warning',
	retirement: 'secondary',
	online: 'success',
	offline: 'danger',
	running: 'success',
	stopped: 'secondary',
	enabled: 'success',
	disabled: 'secondary',
	overdue: 'danger',
};
const PACKAGE_TYPE_COLOR = {
	trial: 'primary',
	subscription: 'success',
	prepaid: 'success',
	pay_as_you_go: 'success',
	group_family: 'success',
	enterprise: 'success',
	educational: 'success',
	long_term: 'success',
	limited_time: 'success',
	customized: 'success',
	gift: 'primary',
};
const PACKAGE_STATUS_COLOR = {
	activated: 'success',
	in_use: 'success',
	expired: 'danger',
	suspended: 'secondary',
	cancelled: 'secondary',
	overdue: 'danger',
};
const TRADE_STATUS_COLOR = {
	pending_payment: 'danger',
	in_progress: 'danger',
	completed: 'success',
	cancelled: 'secondary',
	awaiting_renewal: 'danger',
	expired: 'danger',
	refunding: 'danger',
	dispute: 'danger',
	refunded: 'success',
};
const BALANCE_STATUS_COLOR = {
	enabled: 'success',
	disabled: 'danger',
	overdue: 'danger',
	due: 'danger',
	cancelled: 'secondary',
};
const APP_SERVICE_STATUS_COLOR = {
	activated: 'success',
	in_use: 'success',
	expired: 'danger',
	suspended: 'secondary',
	cancelled: 'secondary',
	overdue: 'danger',
	exhausted: 'danger',
	refunded: 'danger',
};

const SERVICE_STATUS_CAN_BUY = ['online', 'running', 'enabled'];

function canCancelTrade(task) {
	return ['pending_payment', 'in_progress'].includes(task.status);
}
function canPayTrade(task) {
	return ['pending_payment'].includes(task.status);
}
function canInvoiceTrade(task) {
	return ['completed'].includes(task.status);
}
function canOnTheShelfPackage(task) {
	return ['activated', 'in_use'].includes(task.status) === false;
}
function canOffTheShelfPackage(task) {
	return ['activated', 'in_use'].includes(task.status);
}
function canRefundTrade(task) {
	return ['completed'].includes(task.status);
}

// 2000000 js 处理成 千、万、百万、千万、亿、十亿、百亿、千亿
function formatNumber(num, fractionDigits = 2) {
	if (num < 10000) {
		return num;
	} else if (num < 100000000) {
		return (num / 10000).toFixed(fractionDigits) + '万';
	} else if (num < 1000000000000) {
		return (num / 100000000).toFixed(fractionDigits) + '亿';
	} else {
		return (num / 1000000000000).toFixed(fractionDigits) + '万亿';
	}
}

export {
	APP_NAME,
	APP_SERVICE_STATUS_COLOR,
	BALANCE_STATUS_COLOR,
	PACKAGE_STATUS_COLOR,
	PACKAGE_TYPE_COLOR,
	SERVICE_STATUS_CAN_BUY,
	SERVICE_STATUS_COLOR,
	TRADE_STATUS_COLOR,
	canCancelTrade,
	canInvoiceTrade,
	canOffTheShelfPackage,
	canOnTheShelfPackage,
	canPayTrade,
	canRefundTrade,
	copyToClipboard,
	filterItemsByLayout,
	formatNumber,
	getSaleContactEndpoint,
	getServiceEndpoint,
	getServiceIDEndpoint,
	isAdmin,
	refreshPage,
	replaceTemplateWithRemote,
	searchApp,
	searchAppService,
	searchBalanceAdmin,
	searchBill,
	searchBillAdmin,
	searchPackage,
	searchPackagePublic,
	searchService,
	searchServicePublic,
	searchTrade,
	searchTradeAdmin,
	searchUser,
};
