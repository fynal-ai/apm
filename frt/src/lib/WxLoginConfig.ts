const wxLoginConfigs: Record<string, { appid: string; redirect_uri: string }> = {
	'lkh.ai.localhost': {
		appid: 'wxf8681580688c7ad1',
		redirect_uri: 'https://lkh.ai.localhost/caishenlogin',
	},
	'mtc.localhost': {
		appid: 'wxf8681580688c7ad1',
		redirect_uri: 'https://mtc.localhost/login',
	},
	'mtc.xihuanwu.com': {
		appid: 'wxf8681580688c7ad1',
		redirect_uri: 'https://mtc.localhost/login',
	},
	'liuzijin.com': {
		appid: 'wxf8681580688c7ad1',
		redirect_uri: 'https://mtc.localhost/login',
	},
};

const getWxLoginConfig = (url: URL) => {
	return wxLoginConfigs[url.host];
};
const getAppid = (url: URL) => {
	return getWxLoginConfig(url).appid;
};
const getRedirect_uri = (url: URL) => {
	return getWxLoginConfig(url).redirect_uri;
};

export { getAppid, getRedirect_uri };
