<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { page } from '$app/stores';
	export let signature: string;
	export let cn: string;
	export let eid: string;
	export let style = 'textsig-0';
	let imgUrl = `${API_SERVER}/signature/${eid}?token=${$page.data.user.sessionToken}`;
	export const refresh = () => {
		imgUrl = imgUrl + '&t=' + new Date().getTime();
	};
	$: signature && refresh();
</script>

{#if signature.startsWith('PIC:')}
	<img src={imgUrl} class="kfk-signature" alt={cn} />
{:else if signature.trim() === ''}
	<div class={'rounded rounded-3 ' + style}>
		{cn}
	</div>
{:else}
	<div class={'rounded rounded-3 ' + style}>
		{signature}
	</div>
{/if}
