<script lang="ts">
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import { handlePostResponse } from '$lib/dit';
	import Modal from '$lib/dit/Modal.svelte';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';
	import { post } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';

	export let user;

	export let visible: boolean = false;

	const dispatch = createEventDispatcher();

	let formData = {
		account: user.account,
		password: '',
	};

	let formItems = [
		{
			value: 'account',
			label: '你的账号',

			input: 'text',

			disabled: true,
		},
		{
			value: 'password',
			label: '你的密码',

			input: 'password',
		},
	];

	let validation: ValidationObject = {
		account: {
			schema: ValidationSchemas.TEXT.required(),
		},
		password: {
			schema: ValidationSchemas.TEXT.required(),
		},
	};

	async function submit(event) {
		let valid = true;

		const postData = {
			account: formData.account,
			password: formData.password,
		};

		{
			validation = validate(validation, postData);

			if (!isValid(validation)) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await post('/auth/login', postData);

			if (response.sessionToken) {
				response._id = 1;

				visible = false;

				dispatch('ok', {
					formData,
					response,
				});
			} else {
				response.message = '验证失败，请检查账号和密码';
			}

			await handlePostResponse(response, '通过验证');
		}
	}
</script>

<Modal
	{visible}
	maskClosable={false}
	closeButton={false}>
	<div slot="title">敏感操作二次认证</div>
	<div slot="body">
		为了保证您的账号安全，请验证身份。认证成功后进行下一步操作

		<div class="d-flex flex-column gap-3">
			{#each formItems as item}
				<div class="form-floating">
					<FormItem
						bind:value={formData[item.value]}
						{item}
						validation={validation[item.value]}
						disabled={item.disabled}>
					</FormItem>
				</div>
			{/each}
		</div>
	</div>
	<div
		slot="footer"
		class="w-100 text-center">
		<button
			type="button"
			class="btn btn-sm btn-secondary"
			on:click={async () => {
				history.back();
			}}>
			{'返回'}
		</button>
		<button
			type="button"
			class="btn btn-sm btn-primary"
			on:click={submit}>
			{'确认'}
		</button>
	</div>
</Modal>
