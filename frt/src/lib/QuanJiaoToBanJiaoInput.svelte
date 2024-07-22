<script lang="ts">
	import { Input } from 'sveltestrap';
	import { qtb } from '$lib/utils';
	export let value: string;
	const valueChanged = (e: Event) => {
		e.preventDefault();
		value = qtb(value);
	};
</script>

<Input
	type="text"
	bind:value
	on:input={valueChanged}
	on:change={valueChanged} />
