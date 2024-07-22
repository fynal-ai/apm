import axios from "axios";

export const _axios_tx = axios.create({
	baseURL: "https://api.weixin.qq.com",
	timeout: 30000,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json;charset=UTF-8",
	},
});

