<script lang="ts">
	import { goto } from '$app/navigation';
	import { replaceURLSearch } from '$lib/airender';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import * as api from '$lib/api';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import { handlePostResponse } from '$lib/dit';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';
	import { createEventDispatcher } from 'svelte';

	export let title = '创建应用';
	export let _id = '';
	export let edit = false;
	export let user;
	export let app = {
		name: '智汇API',
		memo: `一个加速企业智能化的 Inference API 服务平台

开发者可以简单灵活地使用市面上的所有人工智能大语言模型，来为企业定制专属的智能化解决方案。`,
	};

	let items: any = [
		{
			value: 'name',
			label: '应用名称',

			input: 'text',
		},
		{
			value: 'memo',
			label: '应用功能描述',

			input: 'textarea',
		},
	];
	export let redirect = '';

	let validation: ValidationObject = {
		name: {
			schema: ValidationSchemas.TEXT.min(2).required(),
		},
		memo: {
			schema: ValidationSchemas.TEXT_AREA.min(2).max(1000).required(),
		},
	};

	const dispatch = createEventDispatcher();

	async function submit(event) {
		const postData = {
			...(edit ? { _id: _id } : {}),

			name: app.name,
			memo: app.memo,
		};

		validation = validate(validation, postData);

		if (!isValid(validation)) {
			return;
		}

		{
			const response = await api.post(
				edit ? '/cognihub/console/app/edit' : '/cognihub/console/app/create',
				postData,
				user?.sessionToken
			);

			await handlePostResponse(response, edit ? '编辑成功' : '创建成功');
			if (response._id) {
				await goto(
					redirect ? replaceURLSearch(redirect, 'appID', response._id) : '/cognihub/console/app/my'
				);
			}
		}
	}
</script>

<section>
	<SectionHeader {title}>
		<a
			class="text-primary text-decoration-none"
			href="/cognihub/console/app/my">
			返回我的应用
		</a>
		<button
			class="btn btn-primary"
			on:click={submit}>
			提交
		</button>
	</SectionHeader>

	<section>
		<div class="d-flex flex-column gap-3">
			{#each items as item}
				<div class="form-floating">
					<FormItem
						bind:value={app[item.value]}
						{item}
						validation={validation[item.value]}>
					</FormItem>
				</div>
			{/each}
		</div>
	</section>
</section>
