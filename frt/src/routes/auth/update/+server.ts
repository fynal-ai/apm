import * as api from '$lib/api';
import type { Action } from './$types';
import { respond } from '../_respond';

export const POST: Action = async ({ request, locals }) => {
	const body = await request.json();
	let ret: any;

	if (body.value?.username) {
		ret = await api.post('account/set/username', body.value, locals.user.sessionToken);
	} else if (body.value?.nickname) {
		ret = await api.post('employee/set/nickname', body.value, locals.user.sessionToken);
	} else if (body.value?.notify) {
		ret = await api.post('employee/set/notify', body.value, locals.user.sessionToken);
	} else if (body.value?.signature) {
		ret = await api.post('employee/signature/set/text', body.value, locals.user.sessionToken);
	} else if (body.value?.password) {
		ret = await api.post('/account/set/password', body.value, locals.user.sessionToken);
	}
	// let ret = await api.post('account/profile/update', body, locals.user.sessionToken);
	if (ret.error) {
		console.error('auth/login', ret);
	}
	if (ret.user) {
		locals.user = ret.user;
	}

	return respond(ret);
};
