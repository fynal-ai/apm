// src/routes/+layout.server.ts

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
//export const load: LayoutServerLoad = async ({ request, locals, setHeaders }) => {
export const load: LayoutServerLoad = async ({ url, params, locals }) => {
	const { user } = locals;
	if (!locals.user) {
		console.log('Access without user, will redirect to /login ', url);
		if (url.pathname.startsWith('/apply')) {
			console.log(url.pathname);
			const tenantid = params.tenantid;
			throw redirect(307, '/login' + url.search + '&tenantid=' + tenantid);
		} else {
			function isIP(url) {
				url = new URL(url);
				const pattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
				return pattern.test(url.hostname);
			}
			const _url = new URL(url.href);
			if (isIP(_url.href)) {
				_url.protocol = 'http:';
			}
			console.log(url.href);
			throw redirect(307, '/login?redirect=' + encodeURIComponent(_url.href));
		}
	}
	return { user: user, token: user ? user.sessionToken : 'NO_LOGIN_TOKEN' };
};
