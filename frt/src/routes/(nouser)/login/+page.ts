import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { user, url } = await parent();
	if (user) {
		throw redirect(302, url.searchParams.get('redirect') || '/');
	}
	return {};
};
