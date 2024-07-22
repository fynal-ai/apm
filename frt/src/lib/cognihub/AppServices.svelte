<script lang="ts">
	import ListPage from './ListPage.svelte';

	export let data: any = {};
</script>

<ListPage
	url={data.url}
	user={data.user}
	headerTitle={data.headerTitle}
	headerOperations={data.headerOperations}
	headerSize={data.headerSize}
	headerPosition={data.headerPosition}
	headerBorder={data.headerBorder}
	filterFormData={data.filterFormData}
	filterFormItems={data.filterFormItems}
	listLayout={data.listLayout}
	listData={data.listData}
	listFormItems={data.listFormItems}
	fetchNextPage={data.fetchNextPage}>
</ListPage>
