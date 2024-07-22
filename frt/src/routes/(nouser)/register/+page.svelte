<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';
	import type { EmpResponse, registerParam } from '$lib/types';
	import { getUrlQuery, post } from '$lib/utils';
	import { Col, Row } from 'sveltestrap';

	let username: string = '';
	let account: string = '';
	let password: string = '';
	let password2: string = '';
	let errMsg = '';

	const validation = {
		account: /^[a-zA-Z][a-zA-Z0-9_]{2,28}[a-zA-Z0-9]$/,
		username: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9. \-_\u4e00-\u9fa5]{0,28}[a-zA-Z0-9\u4e00-\u9fa5]$/,
		nickname: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9. \-_\u4e00-\u9fa5]{0,28}[a-zA-Z0-9\u4e00-\u9fa5]$/,
		password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/,
		notify: /[esw]{0,3}/,
	};
	let usernameTips = '';
	let accountTips = '';
	let regSuccess = false;
	async function submit(event: Event) {
		event.preventDefault();
		if (password !== password2) {
			setFadeMessage('Passwords are not equal');
			return;
		}
		const params: registerParam = {
			username,
			account,
			password,
			// joincode: $page.data.joincode
		};
		$page.data.joincode ? (params.joincode = $page.data.joincode) : '';

		const response: EmpResponse = (await post(`/auth/register`, params)) as unknown as EmpResponse;

		if (response.error) {
			console.log(response);
			if (response.error === 'MongoServerError') {
				if (response.message?.indexOf('duplicate key')) {
					response.message = $_('register.duplicate');
				} else {
					response.message = $_('register.dberror');
				}
			}
			setFadeMessage(response.message ?? '');
			errMsg = response.message ?? '';
		}
		if (errMsg == 'fetch failed') {
			errMsg = $_('server.FETCH_FAILED');
		}

		if (response.account) {
			regSuccess = true;
		}
	}
	let passwordCheckingMsgs = '';
	let password2CheckingMsgs = '';
	let passwordCssClasses: string = '';
	let password2CssClasses: string = '';
	let enableSigninButton = false;
	const pwdReg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
	const onInputPassword = function () {
		if (password.match(pwdReg)) {
			passwordCssClasses = 'valid';
			passwordCheckingMsgs = '';
			if (password === password2) {
				password2CheckingMsgs = '';
				enableSigninButton = true;
			} else {
				password2CheckingMsgs = $_('setting.personal.password2notsame');
				enableSigninButton = false;
			}
		} else {
			if (password.length < 6) {
				passwordCssClasses = 'invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordtooshort');
				enableSigninButton = false;
			} else if (password.length > 20) {
				passwordCssClasses = 'invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordtoolong');
				enableSigninButton = false;
			} else {
				passwordCssClasses = 'is-invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordhint');
				enableSigninButton = false;
			}
		}
	};
	const onInputPassword2 = function () {
		if (password2 !== password) {
			password2CssClasses = 'is-invalid';
			password2CheckingMsgs = $_('setting.personal.password2notsame');
			enableSigninButton = false;
		} else {
			if (password.match(pwdReg)) {
				passwordCssClasses = 'valid';
				password2CssClasses = 'valid';
				passwordCheckingMsgs = '';
				password2CheckingMsgs = '';
				enableSigninButton = true;
			} else {
				passwordCssClasses = 'is-invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordhint');
				enableSigninButton = false;
			}
		}
	};

	const checkFreeReg = async function () {
		console.log('Checking freereg', account);
		// let ret = await api.post('check/freereg', { email: email });
		// if (ret.error) {
		// 	if (ret.error === 'NO_FREE_REG') {
		// 		errMsg = email.substring(email.indexOf('@') + 1) + $_('account.nofreereg');
		// 	} else {
		// 		errMsg = ret.message as string;
		// 	}
		// }
		if (validation.account.test(account)) {
			accountTips = '';
			let ret = await api.post('account/check/availability', { account: account });
			console.log(ret);
			if (ret.error) {
				console.log(ret.error);
				if (ret.error === 'NO_FREE_REG') {
					errMsg = account.substring(account.indexOf('@') + 1) + $_('account.nofreereg');
				} else if (ret.error === 'ACCOUNT_OCCUPIED') {
					errMsg = $_('account.occupied', {
						values: { account: account.substring(account.indexOf('@') + 1) },
					});
				} else {
					errMsg = ret.message as string;
				}
			}
		} else {
			account == '' ? (accountTips = '') : (accountTips = $_('setting.personal.accountFormatTip'));
		}
	};
	const checkNameReg = async function () {
		console.log('Checking name', username);
		validation.username.test(username) || username == ''
			? (usernameTips = '')
			: (usernameTips = $_('setting.personal.usernameFormatTip'));
	};
	const accountInputting = function () {
		errMsg = '';
	};

	const toLogin = () => {
		let joincode = getUrlQuery('joincode');
		let tenantid = getUrlQuery('tenantid');
		let _redirect = getUrlQuery('redirect');
		let loginPath = '/login';
		if ($page.data.url.hostname.indexOf('lkh.ai') > -1) {
			loginPath = '/caishenlogin';
		}
		if (joincode && tenantid) {
			goto(`${loginPath}?joincode=${joincode}&tenantid=${tenantid}`);
		} else {
			if (_redirect) {
				loginPath = loginPath + '?redirect=' + _redirect;
			}
			goto(`${loginPath}`);
		}
	};
</script>

<svelte:head>
	<title>Sign up • HyperFlow</title>
</svelte:head>

<div
	class="container align-self-center"
	style="max-width: 400px;">
	<Row cols="1">
		<Col>
			<h1 class="text-center">{$_('account.signup')}</h1>
		</Col>
		<Col>
			<p
				class="text-center kfk-link"
				on:keydown={() => {}}
				on:keyup={() => {}}
				on:keypress={() => {}}
				on:click={toLogin}>
				<span class="a">{$_('account.haveAnAccount')}</span>
			</p>
		</Col>
		{#if regSuccess === false}
			<Col>
				<form on:submit|preventDefault={submit}>
					<div class="form-floating">
						<input
							class="form-control form-control-lg mt-2"
							id="input-account"
							type="text"
							required
							name="account"
							placeholder="Account"
							bind:value={account}
							on:change={checkFreeReg}
							on:blur={checkFreeReg}
							on:input={accountInputting} />
						<label for="input-account">{$_('account.yourAccount')}</label>
						{accountTips}
					</div>
					{#if errMsg === ''}
						<div class="form-floating">
							<input
								class="form-control form-control-lg mt-2"
								type="text"
								id="input-username"
								required
								placeholder="Your display name"
								on:change={checkNameReg}
								on:blur={checkNameReg}
								bind:value={username} />
							<label for="input-username">{$_('account.yourDisplayName')}</label>
							{usernameTips}
						</div>
						<div class="form-floating">
							<input
								class="form-control form-control-lg mt-2"
								type="password"
								id="input-password"
								name="new-password"
								required
								placeholder="Password"
								autocomplete="new-password"
								bind:value={password}
								on:input={(e) => {
									e.preventDefault();
									onInputPassword();
								}} />
							<label for="input-password">{$_('account.choosePassword')}</label>
							{passwordCheckingMsgs}
						</div>
						<!-- svelte-ignore missing-declaration -->
						<div class="form-floating">
							<input
								class="form-control form-control-lg mt-2"
								type="password"
								id="input-password-repeat"
								required
								placeholder="Password Repeat"
								autocomplete="new-password"
								bind:value={password2}
								on:input={(e) => {
									e.preventDefault();
									onInputPassword2();
								}} />
							<label for="input-password-repeat">{$_('account.verifyPassword')}</label>
							{password2CheckingMsgs}
						</div>
						<button
							class="w-100 btn btn-lg btn-primary pull-xs-right mt-3"
							disabled={enableSigninButton === false}>
							{$_('account.signup')}
						</button>
						<!-- <div class="fw-light fs-6">
							<div class="mt-3">{$_('register.upgradeorgtips')}</div>
						</div> -->
					{:else}
						<div class="mt-3">
							{errMsg}
							<a
								href={'#'}
								class="btn btn-primary"
								on:click={(e) => {
									e.preventDefault();
									errMsg = '';
								}}>
								{$_('register.dismiss')}
							</a>
						</div>
					{/if}
				</form>
			</Col>
		{/if}
		{#if regSuccess}
			<Col class="text-center">
				<div class="mt-3">你的账户：{account}</div>
				<div class="mt-3">你的名称：{username}</div>
				<div class="mt-3">{$_('register.success')}</div>
				<button
					class="btn btn-primary mt-3 w-100"
					on:click|preventDefault={toLogin}>
					{$_('register.loginnow')}
				</button>
			</Col>
		{/if}
	</Row>
</div>

<style>
	.a {
		cursor: pointer;
	}
</style>
