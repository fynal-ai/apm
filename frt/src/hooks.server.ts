import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';

export const handle: Handle = async ({ event, resolve }) => {
	locale.set(event.cookies.get('locale') || 'zh-CN');
	const jwtBase64 = event.cookies.get('jwt');
	(event.locals as any).user = jwtBase64
		? JSON.parse(Buffer.from(jwtBase64, 'base64').toString('utf-8'))
		: null;

	const response = await resolve(event, {
		// transformPageChunk: ({ html }) => html.replace('old', 'new'),
		filterSerializedResponseHeaders: (name) => ['etag'].indexOf(name) >= 0,
		// preload: ({ type, path }) => type === 'js' || path.includes('/important/'),
	});
	response.headers.set('x-custom-header', 'lucas-custom');
	return response;
};
