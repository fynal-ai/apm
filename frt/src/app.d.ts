// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { User } from '$lib/types';
declare global {
	declare namespace App {
		interface Locals {
			userid: string;
			user?: User;
			perm: string;
		}

		interface LayoutData {
			user: User;
		}

		// interface PageData {}

		// interface PageError {}

		// interface Platform {}
	}
}
