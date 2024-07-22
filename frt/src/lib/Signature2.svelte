<script lang="ts">
	import * as empApi from '$lib/api';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let objid: string = '';
	export let cn: string = '';
	const isValidSignature = (sig: string) => {
		if (sig.startsWith('data:image/png;base64')) {
			return true;
		} else {
			return false;
		}
	};

	let signature: string = '';

	const useLastSignagure = async (objid: string) => {
		const ret = await empApi.post('signature/load', { objid: objid }, $page.data.user.sessionToken);
		if (isValidSignature(ret)) {
			signature = ret;
		} else {
			signature = '';
		}
	};

	onMount(async () => {
		await useLastSignagure(objid);
	});
</script>

{#if isValidSignature(signature)}
	<img
		src={signature}
		class="kfk-signature"
		alt={cn} />
{:else}
	<div class="d-flex align-items-center  justify-content-center">
		<i class="fs-4 text-success bi bi-emoji-sunglasses" />
	</div>
{/if}
