<script lang="ts">
	import { page } from '$app/stores';
</script>

{#if ['/airesource'].includes($page.url.pathname)}
	<slot />
{:else}
	<div class="container mt-3">
		<slot />
	</div>
{/if}
