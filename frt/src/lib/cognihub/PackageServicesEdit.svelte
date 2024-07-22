<script lang="ts">
	import ListLoadingHandler from '$lib/cognihub/ListLoadingHandler.svelte';
	import PackageServiceEdit from '$lib/cognihub/PackageServiceEdit.svelte';

	export let url;
	export let user;

	export let formData: any = [
		{
			service: {},
			qps: '',
			costType: '',
			dataSizeUnit: '',
			total: '',
		},
	];

	let formItemComponents = {};
	export function is_valid() {
		let valid = true;

		{
			Object.keys(formItemComponents).forEach((key) => {
				const formItemComponent = formItemComponents[key];

				if (formItemComponent && !formItemComponent.is_valid()) {
					valid = false;
				}
			});
		}

		return valid;
	}
</script>

<ListLoadingHandler list={formData}>
	{#each formData as data, index}
		<div class="mb-4 card p-2">
			<div class="d-flex flex-wrap gap-2 justify-content-end">
				<button
					class="btn btn-danger btn-sm bi bi-trash"
					on:click={async (event) => {
						formData.splice(index, 1);

						formData = formData;
					}}>
					删除
				</button>
				<button
					class="btn btn-primary btn-sm bi bi-copy"
					on:click={async (event) => {
						formData.push(JSON.parse(JSON.stringify(data)));

						formData = formData;
					}}>
					克隆
				</button>
			</div>
			<PackageServiceEdit
				{url}
				{user}
				bind:this={formItemComponents[index]}
				formData={data}>
			</PackageServiceEdit>
		</div>
	{/each}
</ListLoadingHandler>
