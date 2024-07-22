type localWithUser = {
	user: any;
};

import { setupI18n } from '$lib/i18n';

import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { user } = locals as localWithUser;

	// prerender i18n
	{
		let lang = cookies.get('locale') || 'zh-CN';
		setupI18n({ withLocale: lang });
	}

	return { user: user, token: user ? user.sessionToken : 'NO_LOGIN_TOKEN', version: '1.1' };
};
