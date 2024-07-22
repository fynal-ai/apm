<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		blogFilterByName,
		currentScenario,
		modelFilterByName,
		scenarioFilterByName,
	} from '$lib/Stores.js';
	import { getSearchEndpoint } from '$lib/aiblog/admin';
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';

	let q: string = '';

	function onInput(event) {
		getSearchBoxItems({ q });
	}

	// 阻止事件向上传递
	function stopFunc(event) {
		event.stopPropagation();
	}
	let is_show_search_box = false;
	let search_box_items = {
		scenarios: [],
		scenariosCount: 0,
		models: [],
		modelsCount: 0,

		blogs: [],
		blogsCount: 0,
	};
	let is_init_search_box = false;
	interface SearchPayload {
		q: string; // 搜索关键词
	}
	async function getSearchBoxItems(payload: SearchPayload = { q: '' }) {
		{
			const scenarios = await api.post(
				'/aiscenario/search',
				{ name: payload.q },
				$page.data.user?.sessionToken
			);
			if (scenarios && scenarios.length > 0) {
				search_box_items.scenarios = scenarios.slice(0, 6).map((item) => {
					return { tags_industry: [], ...item };
				});
				search_box_items.scenariosCount = scenarios.length;
			} else {
				search_box_items.scenarios = [];
				search_box_items.scenariosCount = 0;
			}
		}

		{
			const models = await api.post('/aimodel/search', { nikeName: payload.q });
			if (models && models.length > 0) {
				search_box_items.models = models.slice(0, 6);
				search_box_items.modelsCount = models.length;
			} else {
				search_box_items.models = [];
				search_box_items.modelsCount = 0;
			}
		}

		{
			const { list: blogs, total } = await api.post(
				getSearchEndpoint($page.data.user),
				{
					q: payload.q,
					limit: 6,
					hastotal: true,
				},
				$page.data.user?.sessionToken
			);
			if (blogs && blogs.length > 0) {
				search_box_items.blogs = blogs;
				search_box_items.blogsCount = total;
			} else {
				search_box_items.blogs = [];
				search_box_items.blogsCount = 0;
			}
		}
	}
</script>

<svelte:document
	on:click={() => {
		is_show_search_box = false;
	}} />
<div class="input-container me-3 flex-grow-1">
	<input
		type="text"
		autocomplete="off"
		spellcheck="false"
		class="form-control ps-4"
		id="topbar-search-input"
		bind:value={q}
		placeholder={$_('baystone.nav.all_search')}
		on:focus={() => {
			is_show_search_box = true;
		}}
		on:click={async (event) => {
			stopFunc(event);

			is_show_search_box = true;

			if (is_init_search_box === false) {
				await getSearchBoxItems();
				is_init_search_box = true;
			}
		}}
		on:input={onInput} />
	<svg
		width="1rem"
		height="1rem"
		viewBox="0 0 30 30"
		fill="none"
		xmlns="http://www.w3.org/2000/svg">
		<path
			d="M30 28.59L22.45 21A11 11 0 1 0 21 22.45L28.59 30zM5 14a9 9 0 1 1 9 9a9 9 0 0 1-9-9z"
			fill="currentColor">
		</path>
	</svg>
	<div
		class="search-box"
		class:show={is_show_search_box}
		class:hidden={!is_show_search_box}
		on:keydown={() => {}}
		on:click={(event) => {
			stopFunc(event);
		}}>
		<ul class="list-group search-box-item">
			{#if search_box_items.scenarios && search_box_items.scenarios.length > 0}
				<li
					class="list-group-item list-group-item-heading font-bold text-blue bg-gradient-to-r from-blue">
					Scenarios
				</li>
				{#each search_box_items.scenarios as item}
					<li class="list-group-item">
						<a
							href={'#'}
							on:click|preventDefault={() => {
								goto('/aiscenario');

								is_show_search_box = false;

								$currentScenario = item;
							}}
							class="flex text-xs hover:bg-gray-50 h-8 items-center">
							<span class="bg-gradient-to-r from-gray rounded">{item.name}</span>
						</a>
					</li>
				{/each}
				{#if q && search_box_items.scenariosCount > 6}
					<li class="list-group-item text-gray">
						<a
							href={'#'}
							class="text-xs"
							on:click|preventDefault={() => {
								goto('/aiscenario');

								is_show_search_box = false;

								$scenarioFilterByName = q;
							}}>
							<span>See {search_box_items.scenariosCount} scenario results for "{q}"</span>
						</a>
					</li>
				{/if}
			{/if}

			{#if search_box_items.models && search_box_items.models.length > 0}
				<li
					class="list-group-item list-group-item-heading font-bold text-red bg-gradient-to-r from-red">
					Models
				</li>
				{#each search_box_items.models as item}
					<li class="list-group-item">
						<a
							href={'#'}
							on:click|preventDefault={() => {
								window.open(`/aimodel?uid=${item.uid}`, '_self');
							}}
							class="flex text-xs hover:bg-gray-50 h-8 items-center">
							<span class="bg-gradient-to-r from-gray rounded">{item.modelName}</span>
						</a>
					</li>
				{/each}
				{#if q && search_box_items.modelsCount > 6}
					<li class="list-group-item text-gray">
						<a
							href={'#'}
							class="text-xs"
							on:click|preventDefault={() => {
								goto('/aimodel');

								is_show_search_box = false;

								$modelFilterByName = q;
							}}>
							<span>See {search_box_items.modelsCount} model results for "{q}"</span>
						</a>
					</li>
				{/if}
			{/if}

			{#if search_box_items.blogs && search_box_items.blogs.length > 0}
				<li
					class="list-group-item list-group-item-heading font-bold text-orange bg-gradient-to-r from-orange">
					Blogs
				</li>
				{#each search_box_items.blogs as item}
					<li class="list-group-item">
						<a
							href={'#'}
							on:click|preventDefault={() => {
								goto('/aiblog/detail/' + item._id);

								is_show_search_box = false;
							}}
							class="flex text-xs hover:bg-gray-50 h-8 items-center">
							<span class="bg-gradient-to-r from-gray rounded">{item.title}</span>
						</a>
					</li>
				{/each}
				{#if q && search_box_items.blogsCount > 6}
					<li class="list-group-item text-gray">
						<a
							href={'#'}
							class="text-xs"
							on:click|preventDefault={async () => {
								await goto('/aiblog');

								is_show_search_box = false;

								$blogFilterByName = q;
							}}>
							<span>See {search_box_items.blogsCount} blog results for "{q}"</span>
						</a>
					</li>
				{/if}
			{/if}

			{#if search_box_items.scenariosCount === 0 && search_box_items.modelsCount === 0 && search_box_items.blogsCount === 0}
				<li class="list-group-item">No results found :(</li>
			{/if}
		</ul>
	</div>
</div>

<style>
	.input-container {
		position: relative;
		display: inline-block;
	}

	.input-container input {
		padding-left: 30px; /* Adjust based on the size of the SVG */
		height: 30px; /* Adjust as needed */
		line-height: 30px; /* Adjust as needed */
	}
	.input-container svg {
		position: absolute;
		top: 50%; /* Center vertically */
		left: 5px; /* Spacing from the left edge of the input box */
		transform: translateY(-50%); /* Ensures vertical centering */
		height: 1rem; /* Adjust as needed */
		width: 1rem; /* Adjust as needed */
	}
	.show {
		display: block;
	}
	.hidden {
		display: none;
	}
	.search-box {
		position: absolute;
		min-height: 200px;
		width: 100%;
		z-index: 200;

		min-width: 24rem;
	}
	.search-box-item {
		margin-top: 5px;

		background-color: #ffffff;
		border-radius: 5px;
		box-shadow:
			inset 1px 1px 0 0 hsla(0, 11%, 89%, 0.5),
			0 3px 8px 0 #e4e4e5;
		max-height: 600px;
		overflow-y: auto;
	}

	.font-bold {
		font-weight: bold;
	}
	.text-blue {
		color: var(--bs-blue);
	}
	.text-red {
		color: var(--bs-red);
	}
	.text-orange {
		color: var(--bs-orange);
	}
	.text-gray {
		color: var(--bs-gray);
	}
	.text-xs {
		font-size: 0.75rem;
		line-height: 1rem;
	}
	.h-8 {
		height: 2rem;
	}
	.hover\:bg-gray-50:hover {
		background-color: rgb(249 250 251);
	}
	.flex {
		display: flex;
	}
	.items-center {
		align-items: center;
	}
	.rounded {
		border-radius: 0.25rem;
	}
	a {
		color: inherit;
		text-decoration: none;
	}
	.bg-gradient-to-r {
		background-image: linear-gradient(to right, var(--gradient-from), white);
	}
	.from-blue {
		--gradient-from: #eff6ff;
	}
	.from-red {
		--gradient-from: #fef2f2;
	}
	.from-orange {
		--gradient-from: #fff5eb;
	}
	.from-gray {
		--gradient-from: #f3f4f6;
	}
</style>
