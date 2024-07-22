import axios from 'axios';
import https from 'https';
import type { AxiosRequestConfig, AxiosProgressEvent } from 'axios';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const config: AxiosRequestConfig = {
	httpsAgent: httpsAgent,
	baseURL: 'http://localhost:5008',
	timeout: 8000, // 3 second, default: unlimited
	headers: {
		/* http headers */
	},
	responseType: 'json',
	xsrfCookieName: 'XSRF-TOKEN',
	xsrfHeaderName: 'X-XSRF-TOKEN',
	onUploadProgress: function (progressEvent: AxiosProgressEvent) {
		// Do whatever you want with the native progress event
	},
	onDownloadProgress: function (progressEvent) {
		// Do whatever you want with the native progress event
	},

	// `maxContentLength` defines the max size of the http response content in bytes allowed in node.js
	//maxContentLength: 20000,

	// `maxBodyLength` (Node only option) defines the max size of the http request content in bytes allowed
	maxBodyLength: 20000,
	maxRedirects: 3,
	/* httpAgent: new http.Agent({ keepAlive: true }),
	 * httpsAgent: new https.Agent({ keepAlive: true }), */
};

export const BsClient = {
	isDebug: false,
	sleep: async function (miliseconds: number) {
		await new Promise((resolve) => setTimeout(resolve, miliseconds));
	},

	debug: function (flag: boolean) {
		this.isDebug = flag;
	},

	axiosOptions: config,

	setHeader: function (k: string, v: string) {
		BsClient.axiosOptions.headers[k] = v;
	},

	setHttpTimeout: function (v: number) {
		BsClient.axiosOptions.timeout = v;
	},

	post: async function (uri: string, payload: any) {
		payload = payload ?? {};
		if (this.isDebug) console.log('post', uri, payload);
		let ret = await BsClient._post(uri, payload);
		return ret?.data;
	},
	//return full response body.
	_post: async function (endpoint: string, payload: any) {
		try {
			let res = await axios.post(endpoint, payload, BsClient.axiosOptions);
			return res;
		} catch (err) {
			if (err.response) return err.response;
			else return { data: { error: err.message } };
		}
	},
	_download: async function (uri: string, payload: any) {
		await axios.post(uri, payload, BsClient.axiosOptions);
	},
	get: async function (uri: string) {
		let ret = await BsClient._get(uri);
		if (ret && ret.data) return ret.data;
		else {
			console.log(uri);
			console.log(ret);
		}
	},

	_get: async function (uri: string) {
		try {
			let ret = await axios.get(uri, BsClient.axiosOptions);
			return ret;
		} catch (error) {
			return error.response;
		}
	},
	delete: async function (uri: string) {
		try {
			let ress = await axios.delete(uri, BsClient.axiosOptions);
			return ress; // 返回响应数据
		} catch (err) {
			// 错误处理
			if (err.response) {
				return err.response; // 如果有响应体，则返回响应体
			} else {
				return { data: { error: err.message } }; // 否则返回错误信息
			}
		}
	},
	patch: async function (uri: string, payload: any) {
		try {
			let reo = await axios.patch(uri,payload, BsClient.axiosOptions);
			return reo; // 返回响应数据
		} catch (err) {
			// 错误处理
			if (err.response) {
				return err.response; // 如果有响应体，则返回响应体
			} else {
				return { data: { error: err.message } }; // 否则返回错误信息
			}
		}
	},
	setServer: function (url: string) {
		BsClient.axiosOptions.baseURL = url;
	},

	login: async function (account: any, password: string) {
		let theAccount: any;
		let thePassword: string;
		if (typeof account === 'string') {
			theAccount = account;
			thePassword = password;
			if (!thePassword) {
				throw new Error('password should not be nullish');
			}
		} else if (
			account.hasOwnProperty('account') &&
			(account.hasOwnProperty('passwd') || account.hasOwnProperty('password'))
		) {
			theAccount = account.account;

			if (account.hasOwnProperty('passwd')) thePassword = account.passwd;
			else if (account.hasOwnProperty('password')) thePassword = account.password;
			else {
				throw new Error('password should not be nullish');
			}
		}

		BsClient.setHeader('Content-type', 'application/json');
		let response = await BsClient.post('/account/login', {
			account: theAccount,
			password: thePassword,
		});
		if (response.sessionToken) {
			BsClient.setHeader('authorization', response.sessionToken);
		}
		return response;
	},

	logout: async function () {
		let response = await BsClient.post('/account/logout', {});
		BsClient.setHeader('authorization', '');
		return response;
	},
};
