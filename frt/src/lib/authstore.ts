import storage from '$lib/mtcLocalStorage';

interface Auth {
	jwt: string;
}

export const authStore = storage<Auth>('auth', { jwt: '' });
