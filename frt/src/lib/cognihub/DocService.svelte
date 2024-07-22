<script lang="ts">
	import { goto } from '$app/navigation';
	import { replaceURLSearch } from '$lib/airender';
	import AppSelect from '$lib/cognihub/AppSelect.svelte';
	import AppServiceDoc from '$lib/cognihub/AppServiceDoc.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/paraiso-dark.min.css';
	import { marked } from 'marked';

	export let service: any = {};
	export let app: any = {};
	export let appID: string = '';
	export let appService: any = {};

	export let url;
	export let user;

	marked.setOptions({
		extensions: {
			renderers: {
				['code']: function (code: any) {
					const text = hljs.highlight(code.text, { language: code.lang }).value;
					const id = Math.random().toString(36).substring(7);
					return `
					<section class="m-0 mb-3 code-section" id="${id}">
						<header>
							<div class="d-flex justify-content-between">
								<span class="code-lang">${code.lang}</span>
								<button class="btn btn-sm btn-outline-info" onclick='(function(){
									const container=document.getElementById("${id}");
									container.querySelector("button").innerText="已复制";
									navigator.clipboard.writeText(container.querySelector("pre").innerText);
								})()'>
									<i class="bi bi-clipboard"></i>
									复制
								</button>
							</div>
						</header>
						<section>
						    <pre class="code"><code class="language ${code.lang}">${text}</code></pre>
						</section>
					</section>`;
				},
			},
			childTokens: {},
		},
		pedantic: false,
		gfm: true,
		breaks: false,
	});
</script>

<section>
	<SectionHeader title={'服务文档 - ' + service.name}>
		<a
			class="text-primary text-decoration-none"
			href={`/cognihub/doc`}>
			返回文档中心
		</a>
		<a
			class="text-primary text-decoration-none"
			href={`/cognihub/console/app/my`}>
			返回我的应用
		</a>
		{#if appID}
			<a
				class="text-primary text-decoration-none"
				href={`/cognihub/console/app/detail/${appID}`}>
				返回应用详情
			</a>
		{/if}
		<a
			class="btn btn-primary"
			href={appID
				? `/cognihub/sale/buy?appID=${appID}&serviceID=${service._id}`
				: `/cognihub/sale/buy?serviceID=${service._id}`}>
			立即购买
		</a>
	</SectionHeader>

	<section>
		<!-- 接口文档 -->
		<section class="border rounded p-2">
			<AppServiceDoc
				showDocUrl={false}
				formData={service}
				{appID}>
			</AppServiceDoc>
		</section>

		<!-- 服务描述 -->
		<section class="border rounded p-2">
			{@html marked(service.memo)}
		</section>

		<!-- 选择应用 -->
		{#if user}
			<section class="card p-2">
				<header><h2 class="fs-5">选择应用</h2></header>
				{#if appID && (!appService || !appService._id)}
					<div class="alert alert-info">
						<span>您所选择的应用目前不包含当前服务，本服务无法被正常使用。</span>
						<a href={`/cognihub/sale/buy?appID=${appID}&serviceID=${service._id}`}>立即购买</a>
					</div>
				{/if}
				<div>
					<AppSelect
						{url}
						{user}
						appID={app._id}
						onSelect={async (value) => {
							await goto(replaceURLSearch(url, 'appID', value._id));
						}}>
					</AppSelect>
				</div>
			</section>
		{/if}

		<!-- 服务文档描述 -->
		<section class="border rounded p-2 content">
			{@html marked(service.docMemo)}
		</section>
	</section>
</section>

<style>
	.content {
		word-break: break-all;
	}
	.content :global(.code-section) {
		background-color: black;
		color: white;

		padding: 0.5rem;
		border-radius: 10px;
	}
	.content :global(pre) {
		background-color: black;
		color: white;

		word-wrap: break-word;
		white-space: pre-wrap;
		word-break: break-all;

		padding: 0;
		border-radius: 0;
		margin: 0;
		box-shadow: none;
	}

	.content :global(img) {
		max-width: 100%;
		height: auto;
	}
	.content :global(video) {
		max-width: 100%;
		height: auto;
	}
</style>
