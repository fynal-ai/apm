// import { writable } from 'svelte/store';
// import type { User } from '$lib/types';

// export const user = writable < User > {};

// if (process.browser) {
// 	user = writable<User>(JSON.parse(localStorage.getItem('user')));
// 	user.subscribe((value) => (localStorage.user = JSON.stringify(value)));
// }

import { writable } from 'svelte/store';
import type { User } from '$lib/types';

function isBrowser() {
	return typeof window !== 'undefined';
}

function createUserStore() {
	let initialValue = {};
	if (isBrowser() && localStorage.getItem('user')) {
		try {
			initialValue = JSON.parse(localStorage.getItem('user'));
		} catch (e) {
			console.error('Error parsing user from localStorage', e);
		}
	}

	const { subscribe, set, update } = writable<User>(initialValue);

	if (isBrowser()) {
		subscribe((value) => {
			localStorage.setItem('user', JSON.stringify(value));
		});
	}

	return {
		subscribe,
		set,
		update,
		// 你还可以在这里添加更多的方法，例如reset, login, logout等
	};
}

export const user = createUserStore();


