<script lang="ts">
	import type { OperationItemsType, OperationLayout } from './types';

	export let operations: OperationItemsType = [
		{
			class: 'btn btn-sm btn-danger bi bi-trash',
			title: '删除',
			visible: async (event) => {
				return true;
			},
			onClick: async (event) => {
				console.log('删除', event.detail);
			},
		},
	];

	export let data;

	export let layout: OperationLayout = 'row';
	export let show: boolean = true;
</script>

{#if ['row', 'table-column'].includes(layout)}
	<div
		class="d-flex d-flex-wrap gap-2"
		class:flex-column={layout === 'table-column'}
		class:py-2={layout === 'table-column'}
		style="width: max-content;">
		{#each operations as operation}
			{#if typeof operation.visible === 'function'}
				{#await operation.visible({ detail: data }) then visible}
					{#if visible}
						<button
							class={operation.class}
							title={operation.title}
							on:click={async (event) => {
								event.preventDefault();
								event.stopPropagation();

								if (operation.onClick) {
									await operation.onClick({ detail: { ...data, event } });
								}
							}}>
							{#if operation.showTitle}
								{operation.title}
							{/if}
						</button>
					{/if}
				{/await}
			{:else}
				<button
					class={operation.class}
					title={operation.title}
					on:click={async (event) => {
						event.preventDefault();
						event.stopPropagation();

						if (operation.onClick) {
							await operation.onClick({ detail: { ...data, event } });
						}
					}}>
					{#if operation.showTitle}
						{operation.title}
					{/if}
				</button>
			{/if}
		{/each}
	</div>
{:else if layout === 'column'}
	<ul
		class="dropdown-menu"
		class:show>
		{#each operations as operation}
			{#if typeof operation.visible === 'function'}
				{#await operation.visible({ detail: data }) then visible}
					{#if visible}
						<li class="dropdown-item p-0">
							<button
								class={operation.class}
								on:click={async (event) => {
									event.preventDefault();
									event.stopPropagation();

									if (operation.onClick) {
										await operation.onClick({ detail: { ...data, event } });
									}
								}}>
								<span class="px-1">{operation.title}</span>
							</button>
						</li>
					{/if}
				{/await}
			{:else}
				<li class="dropdown-item p-0">
					<button
						class={operation.class}
						on:click={async (event) => {
							event.preventDefault();
							event.stopPropagation();

							if (operation.onClick) {
								await operation.onClick({ detail: { ...data, event } });
							}
						}}>
						<span class="px-1">{operation.title}</span>
					</button>
				</li>
			{/if}
		{/each}
	</ul>
{/if}
