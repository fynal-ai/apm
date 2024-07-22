<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ContextMenu from '../../routes/(authed)/airender/assets/ContextMenu.svelte';
	import TableOperation from './TableOperation.svelte';
	import TaskList from './TaskList.svelte';
	import type { OperationLayout, TaskListItems, TaskListLayout } from './types';

	export let data;
	export let formItems: TaskListItems;
	export let enableSelect: boolean = true;
	export let selected;
	export let layout: TaskListLayout = 'airender';

	export let contextMenuShow: boolean = false;
	let contextMenuComponent;
	export let contextMenuData = {};

	export let showOperations: boolean = false;
	export let operations: any = [];
	export let operationsLayout: OperationLayout = 'row';
	export let enableContextMenu: boolean = true;
	export let contextMenuOperations: any = []; // 传入contextMenuOperations或slot为contextmenu，优先展示operations

	export let showRefreshInterval: boolean = false;
	export let refreshInterval: boolean = true;

	export let onClickRow: any = undefined;

	export let sortable: boolean = false;
	export let sortBy = {
		field: '',
		order: 0,
	};

	const dispatch = createEventDispatcher();
</script>

<section>
	<TaskList
		bind:data
		{layout}
		{formItems}
		{enableSelect}
		{selected}
		{enableContextMenu}
		on:showContextMenu={(event) => {
			contextMenuComponent.updateContextMenuPosition(event.detail.event);

			contextMenuData = event.detail;

			dispatch('showContextMenu', event.detail);
		}}
		{showOperations}
		{operations}
		{operationsLayout}
		{refreshInterval}
		{showRefreshInterval}
		on:refresh
		{onClickRow}
		{sortable}
		bind:sortBy
		on:sort
		on:loadNextPage>
		<div slot="header">
			<slot name="header" />
		</div>
	</TaskList>

	<!-- 右键菜单 -->
	{#if enableContextMenu}
		<ContextMenu
			bind:this={contextMenuComponent}
			bind:showMenu={contextMenuShow}>
			<div slot="body">
				{#if contextMenuOperations.length > 0}
					<TableOperation
						layout="column"
						operations={contextMenuOperations}
						data={contextMenuData}>
					</TableOperation>
				{:else}
					<slot name="contextmenu" />
				{/if}
			</div>
		</ContextMenu>
	{/if}
</section>
