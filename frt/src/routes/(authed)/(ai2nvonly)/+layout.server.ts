// src/routes/+layout.server.ts

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
//export const load: LayoutServerLoad = async ({ request, locals, setHeaders }) => {
export const load: LayoutServerLoad = async ({ url, params, locals }) => {
	const { user } = locals;
	if (!user) {
		throw redirect(307, '/login');
	}
	if (user.group && Array.isArray(user.group) && user.group.some((g) => g.startsWith('AI2NV_')))
		return { user: user, token: user ? user.sessionToken : 'NO_LOGIN_TOKEN' };
	else throw redirect(307, '/');
};
