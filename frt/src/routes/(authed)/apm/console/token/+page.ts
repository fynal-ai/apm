import { subtitle } from '$lib/title';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { user } = await parent();
	const title = 'TOKEN';

	subtitle.set(title);

	return {
		headerTitle: title,

		user,
	};
};
