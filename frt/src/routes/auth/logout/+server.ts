import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
	const headers = new Headers();
	headers.append(
		'Set-Cookie',
		`jwt=; expires=${new Date(Date.now() - 1000).toUTCString()}; Path=/; HttpOnly`
	);
	headers.append('Location', '/');
	return json({}, { headers, status: 302 });
}
