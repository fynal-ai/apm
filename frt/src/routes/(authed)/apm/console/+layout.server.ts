// src/routes/+layout.server.ts

import { isAdmin } from '$lib/cognihub';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
//export const load: LayoutServerLoad = async ({ request, locals, setHeaders }) => {
export const load: LayoutServerLoad = async ({ url, params, locals }) => {
	const { user } = locals;
	if (isAdmin(user)) {
		throw redirect(307, '/ai2nv/cognihub/console/dashboard');
	}
};
