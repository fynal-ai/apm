<script lang="ts">
	import { Row, Col } from 'sveltestrap';
	export let avatar: string;
	export let name: string;
</script>

<Row class="justify-content-center">
	{#if avatar.trim()}
		<div class="d-flex justify-content-center">
			<img
				alt="avatar"
				src={avatar}
				class="kfk-avatar-small" />
		</div>
	{:else}
		<div class="d-flex justify-content-center text-center kfk-avatar-letter-small">
			{name.substring(0, 1)}
		</div>
	{/if}
</Row>
<Row>
	<div class="w-100 text-center">{name}</div>
</Row>
