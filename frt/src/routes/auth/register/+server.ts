import * as api from '$lib/api';
import { respond } from '../_respond';
import ErrorProcessor from '$lib/errorProcessor';

export async function POST({ params, request }) {
	const reginfo = await request.json();

	console.log('Before register/+server.ts', reginfo);
	const ret = await api.post('/account/register', reginfo);
	console.log('register/+server.ts', ret);

	return respond(ret);
}
