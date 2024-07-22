<script lang="ts">
	import FormItem from '$lib/aireq/FormItem.svelte';
	import { marked } from 'marked';

	export let formData = {
		_id: '6650754730153b49c5dd08a5',
		id: '6650754730153b49c5dd08a5',
		name: '测试',
		memo: '测试',
		owner: '664fea14c41968cbf4dceef4',
		secret: 'rGBEj6vwka1F2IivvbwhLLVsx8m2z3uIgACi',
		createdAt: '2024-05-24T11:08:55.489Z',
		updatedAt: '2024-05-24T11:08:55.489Z',
		__v: 0,
	};

	export let url;
	export let user;

	export let showMemo: boolean = true;

	let formItems: any = [
		{
			value: 'id',
			label: 'APPID',

			input: 'text',

			col: 6,
		},
		{
			value: 'secret',
			label: 'API_KEY',

			input: 'text',

			col: 6,
		},
	];
</script>

<section>
	<div class="row row-cols-1 row-cols-sm-2">
		{#each formItems as item}
			<div
				class={['col my-1', item.col ? `col-sm-${item.col}` : `col-sm-12`]
					.filter((item) => {
						return item;
					})
					.join(' ')}>
				<div class="form-floating">
					<FormItem
						value={formData[item.value]}
						{item}
						disabled>
					</FormItem>
				</div>
			</div>
		{/each}
	</div>

	{#if showMemo === true}
		<section>
			<div class="card">
				<div class="p-2">
					{@html marked(formData['memo'])}
				</div>
			</div>
		</section>
	{/if}
</section>
