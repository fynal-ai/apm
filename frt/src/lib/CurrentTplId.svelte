<script lang="ts">
	import { currentTplid } from '$lib/Stores';
	import { Button } from 'sveltestrap';
</script>

<Button
	color="light"
	class="fs-3 mx-1 badge  border border-primary text-primary"
	on:click={(e) => {
		e.preventDefault();
	}}>
	{$currentTplid}
</Button>
