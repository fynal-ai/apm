import { viteExternalsPlugin } from 'vite-plugin-externals';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		viteExternalsPlugin({
			fsevents: 'fsevents',
			vue: 'Vue',
			react: 'React',
			'react-dom': 'ReactDOM',
			// value support chain, transform to window['React']['lazy']
			lazy: ['React', 'lazy'],
		}),
	],
	server: {
		fs: {
			allow: ['..'],
		},
	},
	//base: '.',
	build: {
		assetsInlineLimit: 0,
		rollupOptions: {
			external: [
				/node_modules\/rollup/,
				/node_modules\/vite/,
				/node_modules\/fsevents/,
				'svelte-file-dropzone/Dropzone.svelte',
			], //   /^node:.*/,
			onwarn: (warning, warn) => {
				// skip certain warnings
				if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
				if (warning.code?.startsWith('a11y-')) return;

				if (warning.id && warning.id.indexOf('node_modules/sveltestrap') >= 0) return;
				if (warning.message.indexOf('file-saver') > 0) return;
				if (warning.message.indexOf('filepond') > 0) return;

				if (warning.code === 'CIRCULAR_DEPENDENCY') {
					return;
				}

				// throw on others
				// Using Object.assign over new Error(warning.message) will make the CLI
				// print additional information such as warning location and help url.
				if (warning.code === 'MISSING_EXPORT') throw Object.assign(new Error(), warning);

				// 忽略 sveltekit 编译  intl-messageformat 报错
				if (warning.code === 'THIS_IS_UNDEFINED') return;
				// Use default for everything else
				warn(warning);
			},
		},
	},
	ssr: {
		noExternal: ['@sveltekit-i18n/*', 'intl-messageformat', '@formatjs/*'],
	},
});
