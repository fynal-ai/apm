export async function post(endpoint: string, data = {}): Promise<Response> {
	console.log('Calling $lib/utils.post', endpoint, data);
	const res = await fetch(endpoint, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify(data || {}),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const jsonRes = await res.json();
	return jsonRes;
}
export const isBlank = function (val: string) {
	if (val === undefined || val === null || val === '') return true;
	else return false;
};
export const blankToDefault = function (val: string, defaultValue: string) {
	if (isBlank(val)) return defaultValue;
	else return val;
};
export const hasValue = function (val: string) {
	return !isBlank(val);
};
export const nbArray = function (arr: any) {
	return arr && Array.isArray(arr) && arr.length > 0;
};

export function getRandomElements<T>(arr: T[], maxElements: number): T[] {
	// Step 1: Generate a random number of elements to extract
	const numberOfElements = Math.floor(Math.random() * maxElements) + 1;

	// Step 2: Shuffle the array
	const shuffled = arr.sort(() => 0.5 - Math.random());

	// Step 3: Slice the array to get the random number of elements
	return shuffled.slice(0, numberOfElements);
}

export const removePunctuation = function (str: string): string {
	// Regular expression for matching English and Chinese punctuation marks
	const regex = /[\u3000-\u303F\uFF00-\uFFEF]|[.,;:?!\(\)\[\]{}'"\-—_]/g;
	return str.replace(regex, '');
};

/**
 * 全角转半角
 */
export const qtb = function (str: string) {
	str = str.replace(/；/g, ';');
	str = str.replace(/：/g, ':');
	str = str.replace(/，/g, ',');
	str = str.replace(/（/g, '(');
	str = str.replace(/）/g, ')');
	str = str.replace(/｜/g, '|');
	str = str.replace(/“/g, '"');
	str = str.replace(/”/g, '"');
	str = str.replace(/。/g, '.');
	str = str.replace(/【/g, '[');
	str = str.replace(/】/g, ']');
	str = str.replace(/「/g, '{');
	str = str.replace(/」/g, '}');
	str = str.replace(/？/g, '?');
	str = str.replace(/《/g, '<');
	str = str.replace(/》/g, '>');
	return str;
};

export const formatId = function (id: string) {
	if (id.match('^[A-Za-z][\\w]*$')) {
		return '';
	} else {
		return 'wrong format';
	}
};

export const objectEqual = (obj1: any, obj2: any) => {
	return Object.entries(obj1).toString() === Object.entries(obj2).toString();
};

export const hasAll = (a: unknown[], b: unknown[]) => {
	let ret = true;
	for (let i = 0; i < b.length; i++) {
		if (a.indexOf(b[i]) < 0) {
			ret = false;
			break;
		}
	}
	return ret;
};

export const hasAny = (a: unknown[], b: unknown[]) => {
	let ret = false;
	for (let i = 0; i < b.length; i++) {
		if (a.indexOf(b[i]) >= 0) {
			ret = true;
			break;
		}
	}
	return ret;
};

export const getUrlQuery = (name: any) => {
	name = name == null ? null : name;
	let url = window.document.location.href.toString();
	let u = url.split('?');
	if (typeof u[1] == 'string') {
		u = u[1].split('&');
		let get: any = {};
		for (let i in u) {
			let j = u[i].split('=');
			get[j[0]] = j[1];
		}
		if (name === null) {
			return get;
		} else if (get.hasOwnProperty(name)) {
			return get[name];
		} else {
			return null;
		}
	} else {
		return null;
	}
};

export function timeAgo(pastTime) {
	if (!pastTime) return '';
	const past: any = new Date(pastTime);
	const now: any = new Date();

	const seconds = Math.round((now - past) / 1000);
	const minutes = Math.round(seconds / 60);
	const hours = Math.round(minutes / 60);
	const days = Math.round(hours / 24);
	const months = Math.round(days / 30);
	const years = Math.round(days / 365);

	if (years > 1) {
		return `${years} years ago`;
	} else if (months > 1) {
		return `${months} months ago`;
	} else if (days > 1) {
		return `${days} days ago`;
	} else if (hours > 1) {
		return `${hours} hours ago`;
	} else if (minutes > 1) {
		return `${minutes} minutes ago`;
	} else {
		return `${seconds} seconds ago`;
	}
}