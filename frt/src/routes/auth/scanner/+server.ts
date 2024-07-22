import * as api from '$lib/api';
import { respond } from '../_respond';

export async function POST({ request, fetch, locals }) {
	const body = await request.json();
	api.setFetch(fetch);
	const ret = await api.post('account/scanner', {
		code: body.code,
	});
	if (ret.error) {
		console.error('auth/scanner', ret);
	}
	if (ret.perm) {
		locals.perm = ret.perm;
	}
	console.log(ret);
	return respond(ret);
}
