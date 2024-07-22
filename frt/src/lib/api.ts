/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_SERVER } from '$lib/Env';
import { fetchCache } from '$lib/Stores';
import MD5 from 'blueimp-md5';

const windowFetch = fetch;
let customFetch = windowFetch;

export function setFetch(fetch: any) {
	customFetch = fetch;
}
type CacheType = Record<string, { path: string; data: string; etag: string }>;
let theCache: CacheType = {};

fetchCache.subscribe((value) => {
	theCache = value;
});

export const CACHE_FLAG = { bypass: 0, useIfExists: 1, preDelete: 2 };

type OPTS = {
	method: string;
	headers: Record<string, string>;
	mode?: string;
	body?: string;
};

export async function postSimple(
	path: string,
	data: Record<string, any> | null = null,
	token: string | null = null
): Promise<any> {
	return await sendSimple('POST', path, data, token);
}

export async function sendSimple(
	method: string,
	path: string,
	data: Record<string, any> | null = null,
	token: string | null = null
) {
	const opts: OPTS = { method: method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		opts.headers['authorization'] = token;
	}

	return await customFetch(`${API_SERVER}/${path}`, opts as RequestInit);
}

export async function fetchMultiple(path: string, body: any, token: string): Promise<any> {
	await customFetch(`${API_SERVER}/${path}`, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
		body: body,
	});
}

async function send(
	method: string,
	path: string,
	data: Record<string, unknown> | null = {},
	token: string | null = null,
	cacheFlag = CACHE_FLAG.bypass
): Promise<any> {
	const opts: OPTS = { method, headers: {} };
	const cacheKey = { method: method, path: path, body: {}, token: '' };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
		cacheKey.body = opts.body;
	}
	//console.debug(path, opts.body);

	if (token) {
		//HAPI.dev中的extract.js会从从多处取tokens
		// 如下
		//  const cookieKey = customOrDefaultKey(options, 'cookieKey', 'token');
		//const headerKey = customOrDefaultKey(options, 'headerKey', 'authorization');
		//const urlKey = customOrDefaultKey(options, 'urlKey', 'token');
		//const payloadKey = customOrDefaultKey(options, 'payloadKey', 'token');
		//const pattern = new RegExp(options.tokenType + '\\s+([^$]+)', 'i');
		opts.headers['authorization'] = token;
		cacheKey.token = token;
	}

	let returnCode304 = false;
	let foundCache = false;
	const cacheID: string = MD5(JSON.stringify(cacheKey));
	if (cacheFlag === CACHE_FLAG.preDelete) {
		console.log(path, 'Preclear cache');
		delete theCache[cacheID];
	}
	if (theCache[cacheID]) {
		foundCache = true;
		//console.log(path, 'Found cacheID in cache, should add If-None-Match header');
		opts.headers['If-None-Match'] = theCache[cacheID].etag;
		// } else {
		//   console.log(path, 'no local cache');
		if (cacheFlag === CACHE_FLAG.useIfExists) {
			console.log(path, 'Return cached');
			return JSON.parse(theCache[cacheID].data);
		}
	}

	const fullPath = path.startsWith('/') ? `${API_SERVER}${path}` : `${API_SERVER}/${path}`;
	// const fullPath = `http://dev.mtc.xihuanwu.com/${path}`
	// const fullPath = `http://124.223.94.157:5008/${path}`
	//const fullPath = `http://localhost:5009/${path}`
	if (path.indexOf('login') >= 0) {
		console.log(fullPath);
	}
	let responseETag: string | null = '';
	return customFetch(fullPath, opts as RequestInit)
		.then((response) => {
			if (response.status === 304) {
				returnCode304 = true;
				responseETag = response.headers.get('etag');
				return theCache[cacheID].data;
			} else {
				responseETag = response.headers.get('etag');
				return response.text();
			}
		})
		.then((jsonText) => {
			try {
				const ret = JSON.parse(jsonText);
				if (ret.error) {
					if (theCache[cacheID]) {
						delete theCache[cacheID];
						console.log(path, 'Clear cache key on error', cacheID);
					}
				} else {
					if (!(foundCache && returnCode304)) {
						if (responseETag) {
							theCache[cacheID] = {
								path: path,
								data: jsonText,
								etag: responseETag ? responseETag : '',
							};
							//console.log(path, 'Update cache to', theCache);
							console.log(path, 'Update cache, etag ', responseETag);
							fetchCache.set(theCache);
							// } else {
							//   console.log(path, 'Not cachable, no etag');
						}
					} else {
						console.log(path, 'HIT 304, use cached etag', responseETag);
					}
				}
				return ret;
			} catch (err) {
				const ret = jsonText;
				return ret;
			}
		})
		.catch((err) => {
			console.log('==================err');
			console.log(fullPath);
			console.log(err);
			console.log('==================err');
			return { error: 'API_ERROR', message: err.message };
		});
}

export function get(path: string, token: string): Promise<any> {
	return send('GET', path, null, token);
}

export function del(path: string, token: string): Promise<any> {
	return send('DELETE', path, null, token);
}

export function post(
	path: string,
	data: Record<string, unknown>,
	token = '',
	cacheFlag = CACHE_FLAG.bypass
): Promise<any> {
	if (typeof data !== 'object') {
		console.warn('Post data is not a Record');
	}
	return send('POST', path, data, token, cacheFlag);
}

export async function uploadFile(path: string, file: File, token = ''): Promise<any> {
	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch(`${API_SERVER}${path}`, {
		method: 'POST',
		headers: {
			authorization: token,
		},
		body: formData,
	});

	if (response.ok !== true) {
		return;
	}

	return response.json();
}
export async function downloadFile(path: string, data: object, token = ''): Promise<any> {
	const response = await fetch(`${API_SERVER}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authorization: token,
		},
		body: JSON.stringify(data),
	});

	if (response.ok !== true) {
		return;
	}

	return {
		blob: await response.blob(),
		filename:
			response.headers.get('content-disposition') &&
			decodeURI(response.headers.get('content-disposition').split('filename=')[1]),
	};
}

export function hasCache(path: string, data: Record<string, unknown>, token: string): boolean {
	const cacheKey = { method: 'POST', path: path, body: JSON.stringify(data), token: token };
	const cacheID = MD5(JSON.stringify(cacheKey));
	if (theCache[cacheID]) {
		return true;
	} else {
		return false;
	}
}

export function getCache(path: string, data: Record<string, unknown>, token: string): any {
	const cacheKey = { method: 'POST', path: path, body: JSON.stringify(data), token: token };
	const cacheID = MD5(JSON.stringify(cacheKey));
	if (theCache[cacheID]) {
		return JSON.parse(theCache[cacheID].data);
	} else {
		return null;
	}
}

export function removeCacheByPath(path: string) {
	for (const key in theCache) {
		const value = theCache[key];
		if (value.path === path) {
			delete theCache[key];
		}
	}
	return null;
}

export function put(path: string, data: Record<string, unknown>, token: string): Promise<any> {
	return send('PUT', path, data, token);
}
