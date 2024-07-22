// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = false;
import * as api from '$lib/api';
import { subtitle } from '$lib/title';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	//用户访问/login时，如果已经登录，重定向到/work
	const { user, version, url } = await parent();

	let purchaseNowURL = '';
	let freeTrialURL = '';
	const buyURL = new URL('/cognihub/sale/buy', url.href).href;

	if (url) {
		throw redirect(307, '/apm/console/dashboard');
	}

	// throw redirect(307, '/dit');

	subtitle.set('首页');

	const remoteLandPage = await api.post('/cognihub/landpage/detail', {}, user?.sessionToken);

	// 获取立即购买、免费试用的套餐数据
	{
		if (remoteLandPage.purchaseNow && Object.keys(remoteLandPage.purchaseNow).length > 0) {
			purchaseNowURL = '/cognihub/sale/buy';

			let _url = new URL(purchaseNowURL, url.origin);
			Object.keys(remoteLandPage.purchaseNow).forEach((key) => {
				_url.searchParams.set(key, remoteLandPage.purchaseNow[key]);
			});
			purchaseNowURL = _url.pathname + _url.search;
		}
		if (remoteLandPage.freeTrial && Object.keys(remoteLandPage.freeTrial).length > 0) {
			freeTrialURL = '/cognihub/sale/buy';

			let _url = new URL(freeTrialURL, url.origin);
			Object.keys(remoteLandPage.freeTrial).forEach((key) => {
				_url.searchParams.set(key, remoteLandPage.freeTrial[key]);
			});
			freeTrialURL = _url.pathname + _url.search;
		}
	}

	return { user, version: version ?? '1.0', url, purchaseNowURL, freeTrialURL, buyURL };
};
