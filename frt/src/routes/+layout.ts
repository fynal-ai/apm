import { browser } from '$app/environment';
import { locale, setupI18n } from '$lib/i18n';
import { clientlocale } from '$lib/mtcLocalStores';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';
const useLang = async function (locale: string) {
	if (['en', 'zh-CN', 'zh-HK', 'zh-TW', 'jp'].includes(locale) === false) {
		if (locale.indexOf('-') > 0) {
			await useLang(locale.substring(0, locale.indexOf('-')));
		} else {
			await useLang('en');
		}
	} else {
		await setupI18n({ withLocale: locale });
	}
};

export const load: LayoutLoad = async ({ url, data }) => {
	const { user, version } = data;
	//if (get(locale) === null && get(clientlocale)) {
	let locale_value = '';
	if (get(locale) === null) {
		clientlocale.subscribe(async (value) => {
			locale_value = value;
			if (value === '') {
				if (browser) {
					// const i18n = get(_);
					let browserLocale = window.navigator.language;
					await useLang(browserLocale);
					clientlocale.set(browserLocale);
					locale_value = browserLocale;
				}
			} else {
				await useLang(value);
			}

			document.cookie = `locale=${value}`; // 存储到cookie里
		});
	}
	return { url, user, version };
};
