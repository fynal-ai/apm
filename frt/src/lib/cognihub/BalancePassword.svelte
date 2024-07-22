<script lang="ts">
	import { goto } from '$app/navigation';
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import * as api from '$lib/api';
	import SecondaryAuthenticationModal from '$lib/cognihub/SecondaryAuthenticationModal.svelte';
	import SectionHeader from '$lib/cognihub/SectionHeader.svelte';
	import { handlePostResponse } from '$lib/dit';
	import { isValid, validate, type ValidationObject } from '$lib/Joi';

	export let user;
	export let redirect = '';
	export let hasPassword: boolean = false;

	let mismatchError = '';

	let formData = {
		password: '',
		confirm_password: '',
	};

	let formItems = [
		{
			value: 'password',
			label: '支付密码(6位数字)',

			input: 'payPassword',
		},
		{
			value: 'confirm_password',
			label: '确认密码(6位数字)',
			input: 'payPassword',

			onInput: async (password) => {
				mismatchError = '';
				if (password.length === 6 && password !== formData.password) {
					mismatchError = '两次输入的密码不一致';
				}
			},
		},
	];

	let validation: ValidationObject = {
		password: {
			schema: ValidationSchemas.PAY_PASSWORD.required(),
		},
		confirm_password: {
			schema: ValidationSchemas.PAY_PASSWORD.required(),
		},
	};

	let authModalVisible = isUserOutOfDate(user);

	function isUserOutOfDate(user) {
		try {
			const lastLogin = JSON.parse(atob(user.sessionToken.split('.')[1])).iat;

			if (!lastLogin) {
				return true;
			}

			return lastLogin * 1000 < Date.now() - 1000 * 60 * 10;
		} catch (error) {
			return true;
		}
	}

	async function submit(event) {
		let valid = true;

		const postData = {
			password: formData.password,
		};

		{
			validation = validate(validation, {
				password: formData.password,
				confirm_password: formData.confirm_password,
			});

			if (!isValid(validation)) {
				valid = false;
			}
		}

		{
			if (mismatchError) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await api.post(
				'/cognihub/console/financial/balance/password/update',
				postData,
				user?.sessionToken
			);

			await handlePostResponse(response, hasPassword ? '密码已修改' : '密码已设置');
			if (response._id) {
				await goto(redirect ? redirect : '/cognihub/console/financial/balance');
			}
		}
	}
</script>

<section>
	<SectionHeader title={hasPassword ? '修改支付密码' : '设置支付密码'}>
		<a
			class="text-primary text-decoration-none"
			href="/cognihub/console/financial/balance">
			返回余额充值
		</a>
		<button
			class="btn btn-primary"
			on:click={submit}>
			提交
		</button>
	</SectionHeader>

	<section>
		{#if mismatchError}
			<div
				class="alert alert-danger"
				role="alert">
				{mismatchError}
			</div>
		{/if}
		{#each formItems as item}
			<div class="py-1 form-floating">
				<FormItem
					{item}
					bind:value={formData[item.value]}
					validation={validation[item.value]}>
				</FormItem>
			</div>
		{/each}
	</section>

	{#if authModalVisible}
		<SecondaryAuthenticationModal
			visible={authModalVisible}
			{user}
			on:ok={async (event) => {
				user.sessionToken = event.detail.response.sessionToken;
			}}>
		</SecondaryAuthenticationModal>
	{/if}
</section>
