import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	compilerOptions: {
		enableSourcemap: true,
	},

	preprocess: [
		preprocess({
			sourceMap: true,
		}),
	],
	onwarn: (warning, defaultHandler) => {
		// don't warn on <marquee> elements, cos they're cool
		if (warning.code.startsWith('a11y-')) return;
		if (warning.code === 'a11y-distracting-elements') return;
		if (warning.code === 'a11y-click-events-have-key-events') return;
        
		// 忽略 sveltekit 编译  intl-messageformat 报错
		if (warning.code === 'THIS_IS_UNDEFINED') return;
		// handle all other warnings normally
		defaultHandler(warning);
	},
	kit: {
		adapter: adapter(),
		csrf: {
			//Sveltejs/kit 在检查checkOrigin时,会匹配当前页面的Header.orgin和请求网址的url.origin, 在使用Caddy进行reverseProxy时, 当前网站用的是https, 但由于sveltekit server运行在http下,所以url.orgin始终为http开头,即便域名一致,也会导致匹配不成功.
			//因此,这里把checkOrigin关闭即可.
			//另外,最好去svelite网站,提交一个PR
			checkOrigin: false,
		},
	},
};
