import * as empApi from '$lib/api';
import { respond } from '../_respond';
export const POST = async ({ request, fetch }): Promise<ReturnType<typeof respond>> => {
	//const { request, locals } = event;
	const body = await request.json();
	empApi.setFetch(fetch);
	const ret = await empApi.post('account/login', {
		account: body.account,
		password: body.password,
		openid: body.openid,
	});
	if (ret.error) {
		console.error('auth/login', ret);
	}
	return respond(ret);
};
