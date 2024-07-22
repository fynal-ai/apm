<script lang="ts">
	import { goto } from '$app/navigation';
	import FormItem from '$lib/aireq/FormItem.svelte';

	export let formData: any = {
		type: '',
		status: '',
		q: '',
	};
	export let formItems = [
		{
			value: 'type',
			label: '类型',
			input: 'select',

			options: 'cognihub.service.type',

			onSelect: async (value) => {},
		},
		{
			value: 'status',
			label: '状态',
			input: 'select',

			options: 'cognihub.service.status',

			onSelect: async (value) => {},
		},
		{
			value: 'q',
			label: '查询服务名称',
			input: 'searchQ',

			onChange: async (value) => {},
		},
	];
</script>

<section>
	<header class="d-flex gap-2 flex-wrap align-items-center mb-2">
		<h3 class="fs-6 m-0">筛选</h3>
		<button
			class="btn btn-secondary btn-sm bi bi-trash"
			on:click={async () => {
				await goto(window.location.pathname);
			}}>
			清空过滤条件
		</button>
	</header>
	<section
		class="row row-cols-1"
		class:row-cols-md-2={formItems.length >= 2}
		class:row-cols-lg-3={formItems.length >= 3}>
		{#each formItems as item}
			<div class="col">
				<div class="form-floating">
					<FormItem
						{item}
						value={formData[item.value]}>
					</FormItem>
				</div>
			</div>
		{/each}
	</section>
</section>
