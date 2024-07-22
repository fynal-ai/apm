import * as api from '$lib/api';
import { respond } from '../_respond';

export async function POST({ params, request, fetch, locals }) {
	const token = locals.user.sessionToken;
	console.log('Entering refresh/+server.ts, token', token);
	console.log(typeof fetch);
	//api.setFetch(fetch);
	const ret = await api.post('session/refresh', {}, token);
	/*
	if (ret.user) {
		locals.user = Parser.codeToBase64(JSON.stringify(ret.user));
	}
	*/
	return respond(ret);
}
