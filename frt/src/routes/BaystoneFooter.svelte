<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { _ } from '$lib/i18n';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import Logo from './Logo.svelte';
	const dispatch = createEventDispatcher();

	const logout = async () => {
		await tick();
		await goto('/logout', { replaceState: true, invalidateAll: true });
	};

	const gotoContact = async () => {
		await goto('/contact', { replaceState: true, invalidateAll: true });
	};

	onMount(async () => {
		/* setTimeout(async () => {
			siteInfo = await api.post('site/getinfo', {}, $page.data.user.sessionToken);
		}, 3000); */
	});
</script>

<div
	class="emp-footer mt-5 p-0 pt-3 position-relative"
	id="footer">
	<div
		class="position-absolute bottom-0 start-0 w-100"
		style="z-index: -1;">
		<img
			src="/images/bs-bkg-image2.svg"
			alt="bkg" />
	</div>
	<div class="container">
		<div class="row">
			<div class="col-sm-12 col-md-4">
				<div class="">
					<Logo height={'64px'} />
					<!-- <div class="fs-6">英智大模型推理 API 服务平台</div> -->
					<div class="hstack gap-1 mt-3">
						<div
							class="text-primary fs-3 clickable"
							role="none"
							on:keydown={null}
							on:click={gotoContact}>
							<i class="bi-wechat otherlogo" />
							<i class="bi-sina-weibo otherlogo" />
							<i class="bi-twitter-x otherlogo" />
							<i class="bi-github otherlogo" />
						</div>
					</div>
				</div>
			</div>

			<div class="col-sm-12 col-md-8">
				<div class="row row-cols-2">
					<div class="">
						<div class="fw-bold fs-5 pb-1">入口</div>
						<ul>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/">
									首页
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/apm/console/dashboard">
									控制台
								</a>
							</li>
							{#if !$page.data?.user}
								<li>
									<a
										class="emp-footer-link tnt-footer-link text-decoration-none"
										href="/register">
										{$_('account.signup')}
									</a>
								</li>
								<li>
									<a
										class="emp-footer-link tnt-footer-link text-decoration-none"
										href="/login">
										{$_('account.signin')}
									</a>
								</li>
							{:else}
								<li>
									<a
										class="emp-footer-link tnt-footer-link text-decoration-none"
										href="/logout">
										退出登录
									</a>
								</li>
							{/if}
						</ul>
					</div>

					<div class="">
						<div class="fw-bold fs-5 pb-1">{$_('友情链接')}</div>
						<ul>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none flex"
									target="_blank"
									href="https://baystoneai.com">
									英智人工智能公共服务平台
									<i class="bi bi-box-arrow-up-right"></i>
								</a>
							</li>

							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									target="_blank"
									href="https://bonsai.baystoneai.com">
									英智智能体平台-玲珑
									<i class="bi bi-box-arrow-up-right"></i>
								</a>
							</li>

							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									target="_blank"
									href="https://gpubook.ai/airesources">
									英智算力云平台-GPUBOOK
									<i class="bi bi-box-arrow-up-right"></i>
								</a>
							</li>

							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									target="_blank"
									href="https://cognihub.baystoneai.com">
									英智大模型推理 API 服务平台-智汇API
									<i class="bi bi-box-arrow-up-right"></i>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div
				class="col-md-12 my-5"
				style="font-size: 9px;" />
		</div>
		<div class="row">
			<div
				class="col-md-12 text-center"
				style="font-size: 9px;">
				<p>
					<a
						href="/legal"
						class="kfk-link">
						Legal
					</a>
					<span
						dir="ltr"
						lang="en">
						|
						<a
							href="/contact"
							class="kfk-link">
							Report Trademark Abuse
						</a>

						<br />
						<a href={'https://beian.miit.gov.cn/'}>粤ICP备2023108680号-5</a>

						<br />

						Baystone, BAYSTONE are trademarks internationally registered by the
						<a
							href="https://www.ai2nv.com"
							class="kfk-link">
							AI Future
						</a>
						<br />
						Baystone platform is developed and operated by AI Future company.
						<br />
						some components on this site are licensed under various open-source licenses; use and distribution
						are defined by each software license.
						<br />
					</span>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	#footer {
		text-align: left;
		min-height: 400px;
	}
	#footer,
	ul {
		padding: 0px;
	}
	#footer,
	ul,
	li {
		list-style-type: none;
	}
	#footer .row > div {
		display: block;
		padding-top: 16px;
		padding-bottom: 16px;
	}
</style>
