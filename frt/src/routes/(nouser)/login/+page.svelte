<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import { whereAfterLogin } from '$lib/Stores';
	import { toast } from '$lib/Toast';
	import { getAppid, getRedirect_uri } from '$lib/WxLoginConfig';
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';
	import { menuRefreshFlag } from '$lib/menu/MenuData';
	import type { EmpResponse } from '$lib/types';
	import { getUrlQuery, post } from '$lib/utils';
	import { onMount } from 'svelte';
	import { Col, Input, NavLink, Row } from 'sveltestrap';

	const LOGIN_MTC = 1;
	const LOGIN_WX = 2;
	let account: string = '';
	let password: string = '';
	let theCountdown;
	let login_wait: number = -1;
	let login_wait_interval: any = null;
	let errResponse: any = { error: '', message: '' };
	let isUserValid: string = '';
	let isPwdValid: string = '';
	let showResetPassword: boolean = false;
	let passwordErrorCount: number = 0;
	let login_type: number = LOGIN_MTC;
	let openid: string = '';
	let joincode: string = '';
	let tenantid: string = '';

	async function submitLogin() {
		isUserValid = '';
		isPwdValid = '';
		errResponse = { error: '', message: '' };
		const response = (await post(`/auth/login`, {
			account,
			password,
			openid,
		})) as unknown as EmpResponse;

		if (response.error) {
			if (response.error === 'NO_BRUTE') {
				login_wait = 10;
				showResetPassword = true;
				if (login_wait_interval) {
					clearInterval(login_wait_interval);
				}
				login_wait_interval = setInterval(() => {
					login_wait--;
					if (login_wait < 0) clearInterval(login_wait_interval);
				}, 1000);
			}
			errResponse = response;
			errResponse.message = $_(`error.${errResponse.error}`);
			if (response.error === 'login_no_user') {
				isUserValid = ' is-invalid';
				isPwdValid = '';
			} else {
				isUserValid = '';
				isPwdValid = ' is-invalid';
				passwordErrorCount++;
			}
		} else {
			login_wait = -1;
			if (response.user) {
				invalidateAll().then(() => {
					if (joincode && tenantid) {
						goto(`apply/${tenantid}?joincode=${joincode}`);
					} else {
						$menuRefreshFlag = true;
						//如果设置了whereAfterLogin Store, 则转向这个设置的地址
						//否则，转向缺省的/work
						//如果某个功能需要先显示，再询问用户是否登录。设置这个变量，用户登录以后
						//就会再回到这个页面
						//这个页面通常需要放在缺省页面组或(nouser)页面组
						//whereAfterLogin 要放到 (authed)页面组中
						toast(response.user.nickname, $_('notify.welcome'));
						if ($whereAfterLogin) {
							setTimeout(() => {
								goto($whereAfterLogin);
								$whereAfterLogin = '';
							}, 300);
						} else {
							goto($page.url.searchParams.get('redirect') || '/');
						}
					}
				});
			}
		}
	}

	let resendCountdown = 0;

	function changeType(logintype: number) {
		login_type = logintype;
		setTimeout(() => {
			const obj = new WxLogin({
				id: 'wxcode', //wx组建元素
				appid: getAppid($page.url), //微信平台开放id
				scope: 'snsapi_login',
				redirect_uri: getRedirect_uri($page.url), //回调地址 encodeURIComponent编码
				state: '',
				// style: "black",//黑白样式
				// href:"data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDE4MHB4O21hcmlnbi10b3A6LThweH0KLmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQ=="//通过href base64加密css可以微调样式
			});
		});
	}

	onMount(async () => {
		const oScript = document.createElement('script');
		oScript.type = 'text/javascript';
		oScript.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
		document.body.appendChild(oScript);
		// console.log('page', $page);
		let code = getUrlQuery('code');
		//console.log(code);
		joincode = getUrlQuery('joincode');
		tenantid = getUrlQuery('tenantid');
		if (code) {
			//doScanLogin
			api.setFetch($page.data.fetch);
			const res: any = await post(`auth/scanner`, { code });
			if (res.code == 'ACCOUNT_NO_BINDING') {
				//第一次扫微信登录,尚未绑定MTC account
				setFadeMessage(res.msg);
				login_type = LOGIN_MTC;
				openid = res.data;
				console.log('Openid === ', openid);
			} else if (res.code == 500) {
				setFadeMessage(res.msg);
			} else {
				//已经绑定了MTC Account, EMP中的scanlogin成功返回sessionToken string
				login_type = LOGIN_WX;
				if (res.user) {
					invalidateAll().then(() => {
						if (joincode && tenantid) {
							goto(`apply/${tenantid}?joincode=${joincode}`);
						} else {
							//如果设置了whereAfterLogin Store, 则转向这个设置的地址
							//否则，转向缺省的/work
							//如果某个功能需要先显示，再询问用户是否登录。设置这个变量，用户登录以后
							//就会再回到这个页面
							//这个页面通常需要放在缺省页面组或(nouser)页面组
							//whereAfterLogin 要放到 (authed)页面组中
							if ($whereAfterLogin) {
								goto($whereAfterLogin);
								setTimeout(() => {
									$whereAfterLogin = '';
								}, 300);
							} else goto('/');
						}
					});
				}
			}
		}
	});

	const toRegister = () => {
		if (joincode && tenantid) {
			goto(`/register?joincode=${joincode}&tenantid=${tenantid}`);
		} else {
			let _redirect = getUrlQuery('redirect');
			if (_redirect) {
				goto(`/register?redirect=${_redirect}`);
			} else {
				goto('/register');
			}
		}
	};
</script>

<svelte:head>
	<title>Sign in • HyperFlow</title>
</svelte:head>

<div
	class="container align-self-center"
	style="max-width: 400px;">
	<Row cols="1">
		<Col>
			{#if openid == ''}
				<h1 class="text-center mt-5">
					{$_('account.signin')}
				</h1>
			{:else}
				<h1 class="text-center mt-5">
					{$_('account.binding')}
				</h1>
			{/if}
		</Col>
		<!-- <Col>
			{#if openid == ''}
				<p
					class="text-center kfk-link"
					role="none"
					on:keydown={() => {}}
					on:keyup={() => {}}
					on:keypress={() => {}}
					on:click={toRegister}>
					<span class="a">{$_('account.needAnAccount')}</span>
				</p>
			{/if}
		</Col> -->
		<Col>
			<div class="login-box">
				{#if login_type === LOGIN_MTC}
					{#if openid == ''}
						<img
							src="/images/code.jpg"
							alt="mtc"
							width="30"
							height="30"
							class="change-view"
							role="none"
							on:keydown={() => {}}
							on:keyup={() => {}}
							on:keypress={() => {}}
							on:click={() => changeType(2)} />
					{/if}
					<form on:submit|preventDefault={submitLogin}>
						<div class="form-floating flex-fill">
							<Input
								class={'form-control form-control-lg mt-4 ' + isUserValid}
								id="input-account"
								name="account"
								required
								autocomplete="account"
								placeholder="Account"
								bind:value={account}
								aria-describedby="validationServerUsernameFeedback" />
							<label for="input-account">{$_('account.yourAccount')}</label>
							<div
								id="validationServerUsernameFeedback"
								class="invalid-feedback">
								{#if errResponse.error && errResponse.message}
									{errResponse.message}
								{/if}
							</div>
						</div>
						<div class="form-floating flex-fill has-validation">
							<Input
								class={'form-control form-control-lg mt-3 ' + isPwdValid}
								id="input-password"
								type="password"
								required
								placeholder="Password"
								autocomplete="current-password"
								bind:value={password}
								aria-describedby="validationServerPwdFeedback" />
							<label for="input-password">{$_('account.password')}</label>
							<div
								id="validationServerPwdFeedback"
								class="invalid-feedback">
								{#if errResponse.error && errResponse.message}
									{errResponse.message}
								{/if}
							</div>
						</div>
						<div class="w-100 d-flex justify-content-end">
							<button
								class="w-100 btn btn-lg btn-primary pull-xs-right mt-5"
								type="submit"
								disabled={login_wait >= 0}>
								{openid == '' ? $_('account.signin') : $_('account.binding')}
								{login_wait < 0 ? '' : `(${login_wait})`}
							</button>
						</div>
					</form>
				{:else}
					{#if openid == ''}
						<img
							src="/images/pc.jpg"
							alt="mtc"
							width="30"
							height="30"
							class="change-view"
							role="none"
							on:keydown={() => {}}
							on:keyup={() => {}}
							on:keypress={() => {}}
							on:click={() => changeType(1)} />
					{/if}
					<div
						id="wxcode"
						class="wxcode" />
				{/if}
			</div>
		</Col>
		{#if showResetPassword || passwordErrorCount > 2}
			<Col class="text-center mt-5">
				<NavLink
					on:click={() => {
						goto('/resetpassword');
					}}>
					{$_('login.reset_password')}
				</NavLink>
			</Col>
		{/if}
		<!-- <button -->
		<!-- 	class="bg-warning" -->
		<!-- 	on:click={() => { -->
		<!-- 		account = 'test004'; -->
		<!-- 		password = 'Jerome@99'; -->
		<!-- 		submitLogin(); -->
		<!-- 	}}> -->
		<!-- 	test - remove before deploy -->
		<!-- </button> -->

		<!-- <div class="col text-center">
			<a
				class="kfk-link"
				href={'/'}>
				回到首页
			</a>
		</div> -->
	</Row>
</div>

<style>
	.login-box {
		max-width: 400px;
		/* height: 300px; */
		box-shadow: rgb(204, 204, 204) 2px 2px 9px;
		position: relative;
		border-width: 1px;
		border-style: solid;
		border-color: rgb(236, 236, 236);
		border-image: initial;
		border-radius: 4px;
		margin: 20px auto;
		padding: 20px;
		background: #fff;
	}
	.change-view {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
	}
	.wxcode {
		text-align: center;
	}
	.a {
		cursor: pointer;
	}
</style>
