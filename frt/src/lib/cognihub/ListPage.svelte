<script lang="ts">
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';
	import BusinessList from '$lib/cognihub/BusinessList.svelte';
	import ListFilter from '$lib/cognihub/ListFilter.svelte';
	import type { Size, TextPosition } from '$lib/dit/types';
	import ListHeader from './ListHeader.svelte';

	export let url;
	export let user;

	// header
	export let headerTitle = '服务';
	export let headerOperations = [];
	export let headerSize: Size = 'md';
	export let headerPosition: TextPosition = 'start';
	export let headerBorder: boolean = false;

	// filter
	export let filterFormData = {
		type: '',
		status: '',
		q: '',

		pagingMark: '',
	};
	export let filterFormItems = [
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

	// list
	export let listLayout: TaskListLayout = 'cognihub.service';
	export let listData;
	export let listFormItems: TaskListItems = [
		{
			value: 'name',
			label: '服务名称',
		},
		{
			value: 'type',
			label: '服务类型',
		},
		{
			value: 'status',
			label: '服务状态',
		},
		{
			value: 'createdAt',
			label: '创建时间',

			input: 'datetime',
		},
	];
	export let fetchNextPage = async ({ filterFormData, listData }) => {
		return [];
	};
</script>

<section>
	<ListHeader
		title={headerTitle}
		operations={headerOperations}
		border={headerBorder}
		position={headerPosition}
		size={headerSize}>
	</ListHeader>

	<ListFilter
		formData={filterFormData}
		formItems={filterFormItems}>
	</ListFilter>

	<BusinessList
		{url}
		{user}
		layout={listLayout}
		data={listData}
		formItems={listFormItems}
		on:loadNextPage={async (event) => {
			let beforeLoad = event.detail.beforeLoad;
			let afterLoad = event.detail.afterLoad;

			if (beforeLoad) {
				await beforeLoad();
			}

			let new_list_data = await fetchNextPage({ filterFormData, listData });

			listData = [...listData, ...new_list_data];

			if (afterLoad) {
				await afterLoad();
			}
		}}>
	</BusinessList>
</section>
