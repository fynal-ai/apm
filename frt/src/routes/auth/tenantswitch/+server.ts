import * as api from '$lib/api';
import { sveltekit } from '@sveltejs/kit/vite';
import { respond } from '../_respond';
export async function POST({ request, locals }) {
	const body = await request.json();
	const ret = await api.post('tenant/switch', {
		account: body.account,
		tenantid: body.tenantid
	},locals.user.sessionToken);
	if (ret.error) {
		console.error('tenant/switch', ret);
	}
	if (ret.user) {
		locals.user = ret.user;
	}
	return respond(ret);
}
