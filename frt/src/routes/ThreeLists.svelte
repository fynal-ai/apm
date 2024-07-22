<script lang="ts">
	import { _ } from '$lib/i18n';
	import AiBlogList from '$lib/AiBlogList.svelte';
</script>

<div class="row m-0 mb-5 g-5">
	<div class="col col-12 col-md-4">
		<div class="mb-2">{$_('baystone.homepage.news.top_ai_scenario')}</div>
		<AiBlogList
			limit={5}
			layout={'list'}
			listLayoutSize={'small'}
			showCategory={false}
			tags={['topscenario']}
			hasMoreByTag
			hasHeader={false}></AiBlogList>
	</div>
	<div class="col col-12 col-md-4">
		<div class="mb-2">{$_('baystone.homepage.news.computing_support_demand')}</div>
		<AiBlogList
			limit={5}
			layout={'list'}
			listLayoutSize={'small'}
			showCategory={false}
			tags={['gpumarket']}
			hasMoreByTag
			hasHeader={false}></AiBlogList>
	</div>
	<div class="col col-12 col-md-4">
		<div class="mb-2">{$_('baystone.homepage.news.ai_industry_policy')}</div>
		<AiBlogList
			limit={5}
			layout={'list'}
			listLayoutSize={'small'}
			showCategory={false}
			tags={['govpolicy']}
			hasMoreByTag
			hasHeader={false}></AiBlogList>
	</div>
</div>
