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

	export let title = '创建服务';
	export let _id = '';
	export let edit = false;
	export let user;
	export let service = {
		name: 'SORA',
		memo: `视频生成`,

		type: '',
		status: '',
		version: '',
		docUrl: '',
		docMemo: '',

		backendBaseURL: '',
		backendMemo: '',
	};

	let items: any = [
		{
			value: 'name',
			label: '服务名称',

			input: 'text',
		},
		{
			value: 'memo',
			label: '服务描述',

			input: 'textarea',
		},
		{
			value: 'type',
			label: '服务类型',

			input: 'select',

			options: 'cognihub.service.type',
		},
		{
			value: 'status',
			label: '服务状态',

			input: 'select',

			options: 'cognihub.service.status',
		},
		{
			value: 'version',
			label: '服务版本',

			input: 'text',
		},
		{
			value: 'docUrl',
			label: '服务文档地址',

			input: 'text',
		},
		{
			value: 'docMemo',
			label: '服务文档描述',

			input: 'textarea',
		},
		{
			value: 'backendBaseURL',
			label: '后端服务地址',

			input: 'text',
		},
		{
			value: 'backendMemo',
			label: '后端服务描述',

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
		type: {
			schema: ValidationSchemas.TEXT.min(2).required(),
		},
		status: {
			schema: ValidationSchemas.TEXT.min(2).required(),
		},
		version: {
			schema: ValidationSchemas.TEXT.min(2).required(),
		},
		backendBaseURL: {
			schema: ValidationSchemas.URL.min(2).max(256).required(),
		},
	};

	const dispatch = createEventDispatcher();

	async function submit(event) {
		let valid = true;

		const postData = {
			...(edit ? { _id: _id } : {}),

			name: service.name,
			memo: service.memo,

			type: service.type,
			status: service.status,
			version: service.version,
			docUrl: service.docUrl,
			docMemo: service.docMemo,

			backendBaseURL: service.backendBaseURL,
			backendMemo: service.backendMemo,
		};

		{
			// console.log(postData);
			validation = validate(validation, postData);
			if (!isValid(validation)) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await api.post(
				edit ? '/ai2nv/cognihub/console/service/edit' : '/ai2nv/cognihub/console/service/create',
				postData,
				user?.sessionToken
			);

			await handlePostResponse(response, edit ? '编辑成功' : '创建成功');
			if (response._id) {
				await goto(
					redirect
						? replaceURLSearch(redirect, 'serviceID', response._id)
						: '/ai2nv/cognihub/console/service'
				);
			}
		}
	}
</script>

<section>
	<SectionHeader {title}>
		<a
			class="text-primary text-decoration-none"
			href="/ai2nv/cognihub/console/service">
			返回服务
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
						bind:value={service[item.value]}
						{item}
						validation={validation[item.value]}>
					</FormItem>
				</div>
			{/each}
		</div>
	</section>
</section>
