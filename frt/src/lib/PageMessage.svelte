<script lang="ts">
	export let pageMessage = '';

	type MessageType = 'success' | 'info' | 'warning' | 'danger';
	export let type: MessageType = 'info';
</script>

{#if pageMessage}
	<div
		class="w-100 border-1 rounded bg-light px-3 mt-2 alert"
		class:alert-success={type === 'success'}
		class:alert-danger={type === 'danger'}
		class:alert-warning={type === 'warning'}
		class:alert-info={type === 'info'}>
		{pageMessage}
		<a
			class="kfk-link"
			href={'#'}
			on:click={() => {
				pageMessage = '';
			}}>
			知道了
		</a>
	</div>
{/if}
