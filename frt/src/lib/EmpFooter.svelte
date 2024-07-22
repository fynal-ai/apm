<script lang="ts">
	import { _ } from '$lib/i18n';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import LocaleSwitcher from '$lib/LocaleSwitcher.svelte';
	import { onMount } from 'svelte';
	import { mainAreaClass } from '$lib/Stores';
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	const dispatch = createEventDispatcher();

	const logout = async () => {
		$mainAreaClass = '';
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
	class="emp-footer tnt-footer mt-5 p-0 pt-3 {$mainAreaClass}"
	id="footer">
	<div class="container">
		<div class="row">
			<div class="col-sm-12 col-md-4">
				<div class="">
					<div class="footer-logo">
						<img
							class="footer-logo-img"
							src="/svg/yarknode.svg"
							alt="metatocome" />
					</div>
					<div class="fs-6">{$_('footer.neural')}</div>
					<div class="hstack gap-1 mt-3">
						<div
							class="text-primary fs-3 clickable"
              role="none"
							on:keydown={null}
							on:click={gotoContact}>
							<i class="bi-twitter otherlogo" />
							<i class="bi-github otherlogo" />
							<i class="bi-discord otherlogo" />
						</div>
					</div>
					<div
						class="mt-3"
						style="max-width: 400px;">
						<div class="input-group">
							<div class="input-group-text">
								<i class="bi-translate" />
							</div>
							<LocaleSwitcher />
						</div>
					</div>
				</div>
			</div>

			<div class="col-sm-12 col-md-8">
				<div class="row">
					<div class="col-6 col-md-3 ">
						<div class="fw-bold fs-5 pb-1">{$_('footer.PLATFORM')}</div>
						<ul>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.video')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.howitworks')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.usecases')}
								</a>
							</li>
							{#if $page.data.user}
								<li>
									<a
										class="emp-footer-link tnt-footer-link text-decoration-none"
										href={'#'}
										on:click={() => {
											dispatch('restartYana', { yanaid: 'yana-001' });
										}}>
										{$_('footer.yana')}
									</a>
								</li>
							{:else}
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
							{/if}
						</ul>
					</div>

					<div class="col-6 col-md-3 ">
						<div class="fw-bold fs-5 pb-1">{$_('footer.DEVELOPER')}</div>
						<ul>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.quickstart')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.examples')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.docsandhelp')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.discord')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.sdks')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.opensource')}
								</a>
							</li>
						</ul>
					</div>
					<div class="col-6 col-md-3 ">
						<div class="fw-bold fs-5 pb-1">{$_('footer.SOLUTION')}</div>
						<ul>
							{#each [{ id: 'manager', title: $_('solutions.manager') }, { id: 'manufactrue', title: $_('solutions.manufacture') }, { id: 'sales', title: $_('solutions.sales') }, { id: 'crm', title: $_('solutions.crm') }] as solution}
								<li>
									<a
										class="emp-footer-link tnt-footer-link text-decoration-none"
										href={`/solution/${solution.id}`}>
										{solution.title}
									</a>
								</li>
							{/each}
						</ul>
					</div>
					<div class="col-6 col-md-3 ">
						<div class="fw-bold fs-5 pb-1">{$_('footer.DEPLOYMENT')}</div>
						<ul>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.paas')}
								</a>
							</li>
							<li>
								<a
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about">
									{$_('footer.privateinstall')}
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
					{#if $page.data.user}
						<a
							class="emp-footer-link tnt-footer-link text-decoration-none"
							href={'#'}
							on:click={logout}>
							{$_('account.signout')}
						</a>
						<br />
					{/if}
					<a
						href="/legal.html"
						class="kfk-link">
						Legal
					</a>
					<span
						dir="ltr"
						lang="en">
						| <a
							href="/contact.html"
							class="kfk-link">
							Report Trademark Abuse
						</a>
						<br />

						YarkNode, MTC, Digiflow are trademarks internationally registered by the
						<a
							href="/digiflow/"
							class="kfk-link">
							Digiflow company.
						</a>
						<br />
						YarkNode SaaS platform is developed and operated by Digiflow software company.
						<br />
						some components on this site are licensed under various open-source licenses; use and distribution
						are defined by each software license.
					</span>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	#footer {
		text-align: left;
		background-color: rgba(0, 0, 255, 0.03);
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
	.main-area-width-big {
		margin-left: 218px;
		margin-right: 1.5rem;
	}
	.main-area-width-small {
		margin-left: 55px;
	}
	.footer-logo {
		width: 64px;
		height: 48px;
	}

	.footer-logo-img {
		width: 42px;
		height: 42px;
		border: 1px #8000802f solid;
		border-radius: 11px;
		background-color: var(--kfk-footer-logo-bg-color);
	}
</style>
