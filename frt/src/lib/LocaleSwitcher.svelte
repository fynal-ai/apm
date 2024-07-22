<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/i18n';
	import { clientlocale, confirmlocale } from '$lib/mtcLocalStores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let locale_value = 'zh-CN';

	function switchLocale(event: Event) {
		event.preventDefault();
		$clientlocale = (event.target as HTMLInputElement).value;
		$confirmlocale = false;

		dispatch('locale-changed', $clientlocale);
	}
	onMount(async () => {
		locale_value = $clientlocale || 'zh-CN';
	});

	const languages = {
		en: 'English',
		'zh-CN': '简体中文',
		'zh-HK': '香港繁體',
		'zh-TW': '臺灣正體',
		jp: '日文',
	};

	$: locale_value = $locale ?? 'zh-CN';
</script>

<select
	class="py-0 form-select form-select-sm"
	id="locale-switcher"
	bind:value={locale_value}
	on:change={switchLocale}>
	<option value="en">{languages['en']}</option>
	<option value="zh-CN">{languages['zh-CN']}</option>
	,
	<option value="zh-HK">{languages['zh-HK']}</option>
	,
	<option value="zh-TW">{languages['zh-TW']}</option>
	<option value="jp">{languages['jp']}</option>
	,
</select>
