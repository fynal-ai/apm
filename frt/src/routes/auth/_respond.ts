import { authStore } from '$lib/authstore';

interface Body {
	error: string;
	user: {
		sessionToken: string;
	};
}

export function respond(body: Body) {
	if (body.error) {
		return new Response(JSON.stringify(body), { status: 401 });
	}

	if (body.user && body.user.sessionToken) {
		console.log('Set cookie...');
		const jwtValue = Buffer.from(JSON.stringify(body.user)).toString('base64');
		authStore.set({ jwt: jwtValue });
		const daysToExpire = new Date(2147483647 * 1000).toUTCString();

		const headers = new Headers();
		headers.append('Set-Cookie', `jwt=${jwtValue};  expires=${daysToExpire}; Path=/; HttpOnly`);
		return new Response(JSON.stringify(body), { headers });
	} else {
		return new Response(JSON.stringify(body));
	}
}
