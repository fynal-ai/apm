<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';
	export let data: PageData;
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';

	let time = 10;
	let status = 1;
	$: ({ verifyid } = data);
	onMount(() => {
		verifyFn();
	});
	let timer: any = null;
	const verifyFn = async () => {
		let res = await api.get('account/verifyEmail/' + verifyid, '');
		console.log(res);
		if (res == 'EMAIL_VERIFIED') {
			status = 2;
		} else {
			status = 3;
		}
		timer = setInterval(() => {
			if (time > 0) {
				time--;
			} else {
				clearInterval(timer);
				toLogin();
			}
		}, 1000);
	};
	const toLogin = () => {
		const url = status == 2 ? '/login' : '/register';
		goto(url);
	};
</script>

<svelte:head>
	<title>Verify Email</title>
</svelte:head>
<div class="tips container align-self-center">
	{#if status == 1}
		邮箱验证中···
	{:else if status == 2}
		<i class="bi bi-check-circle-fill cor-g" />
		邮箱验证成功，点击
		<span
			class="topage"
      role="none"
			on:keydown={() => {}}
			on:keyup={() => {}}
			on:keypress={() => {}}
			on:click={toLogin}>
			去登入
		</span>
		，或者{time}s后自动跳转登入页面。
	{:else if status == 3}
		<i class="bi bi-x-circle-fill cor-r" />
		邮箱验证失败，点击重新
		<span
			class="topage"
      role="none"
			on:keydown={() => {}}
			on:keyup={() => {}}
			on:keypress={() => {}}
			on:click={toLogin}>
			注册
		</span>
		，或者{time}s后自动跳转注册页面。
	{/if}
</div>

<style>
	.tips {
		text-align: center;
		padding-top: 50px;
		font-size: 18px;
	}
	.topage {
		cursor: pointer;
		color: blue;
	}
	.cor-g {
		color: green;
	}
	.cor-r {
		color: red;
	}
</style>
