import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, data }) => {
	const { user, token } = data;
	return {
		url,
		user,
		token,
	};
};
