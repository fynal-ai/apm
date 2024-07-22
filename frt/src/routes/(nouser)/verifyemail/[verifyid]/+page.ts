import type { PageLoad } from './$types';

export const load: PageLoad = async ({  params }) => {
	let verifyid = params.verifyid;
	if (verifyid && verifyid.charAt(0) === '@') verifyid = verifyid.substring(1);
	return {
		verifyid
	};
}