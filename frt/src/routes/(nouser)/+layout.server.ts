import type { LayoutServerLoad } from './$types';
type localWithUser = { user: { sessionToken: string } };
export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = locals as localWithUser;
	return { user: user, token: user ? user.sessionToken : 'NO_LOGIN_TOKEN' };
};
