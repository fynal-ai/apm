<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { _ } from '$lib/i18n';
	import { clientlocale } from '$lib/mtcLocalStores';
	import { onMount } from 'svelte';
	async function logout() {
		const backupClientLocale = $clientlocale;
		localStorage.clear();
		$clientlocale = backupClientLocale;
		if ($page.data && $page.data.user) {
			delete $page.data.user;
		}
		goto(`/auth/logout`, { replaceState: true }); //退出以后刷新下页面
	}

	onMount(() => {
		logout();
	});
</script>

Log you out...
