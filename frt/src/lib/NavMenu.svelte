<script lang="ts">
	throw Error('Deprecated');
	import TimeTool from '$lib/TimeTool';
	import { browser } from '$app/environment';
	import { _, locale } from '$lib/i18n';
	import { tick } from 'svelte';
	import { mtcSession, mylocale } from '$lib/Stores';
	import { page } from '$app/stores';
	import { filterStorage } from '$lib/mtcLocalStores';
	import LocaleSwitcher from '$lib/LocaleSwitcher.svelte';
	import {
		Row,
		InputGroup,
		InputGroupText,
		Col,
		Icon,
		Navbar,
		Nav,
		NavItem,
		NavLink,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem,
		Container,
	} from 'sveltestrap';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { DEPLOY_MODE } from '$lib/Env';
	import { onMount, onDestroy } from 'svelte';
	import Avatar from '$lib/display/Avatar.svelte';

	let isMenuOpen = true;
	let theAvatar: any;
	let theAvatar2: any;

	const toggle = () => (isMenuOpen = !isMenuOpen);
	async function logout() {
		try {
			localStorage.clear();
		} catch (e) {
		} finally {
			await post(`/auth/logout`);
			goto(`/?ps=${crypto.randomUUID()}`);
		}
	}

	//To let navmenu stick to top only when scrollTop < 200, DO: AAA-*
	//AAA-1: uncomment next line
	//let navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center';
	//AAA-2: comment next line
	let navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center sticky-top';

	function myFunction() {
		if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
			navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center';
		} else {
			navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center sticky-top';
		}
	}

	onMount(async () => {
		TimeTool.setLocale($locale ?? 'zh-cn');
		//AAA-2: uncomment next 2 lines
		/* window.onscroll = function () {
			myFunction();
		}; */

		if (browser) {
			document.onkeyup = (e) => {
				if (e.ctrlKey && e.key === '1') {
					goto('/template');
				} else if (e.ctrlKey && e.key === '2') {
					goto('/workflow');
				} else if (e.ctrlKey && e.key === '3') {
					goto('/work');
				} else if (e.ctrlKey && e.key === '4') {
					let elem = document.getElementById('todo_title_area');
					elem && elem.scrollIntoView(true);
				} else if (e.ctrlKey && e.key === 'g') {
					let elem = document.getElementById('cmtinput_for_todo');
					elem && elem.focus();
				}
			};
		}
	});

	onDestroy(async () => {
		if (browser) {
			document.onkeyup = null;
		}
	});

	$: if ($mtcSession.avatarChangedFlag) {
		theAvatar.refresh();
		theAvatar2.refresh();
	}
</script>

{#if $page.data.user && $page.data.user.tenant && $page.data.user.tenant.css}
	<link
		href={$page.data.user.tenant.css}
		rel="stylesheet"
		type="text/css" />
{/if}
<div class={navmenu_class}>
	<Navbar
		id="myNavBar"
		class="flex-fill"
		expand="sm">
		<Row>
			<Col>
				<div
					class="kfk-org-logo org-logo"
					on:keyup={null}
					on:click={() => {
						goto('/');
					}}>
					&nbsp;
				</div>
			</Col>
			<Col>
				<Row>
					{#if $page.data.user}
						<Col class="d-flex justify-content-center">
							<Dropdown class="navbar-expand-sm">
								<DropdownToggle nav>
									<Avatar
										eid={$page.data.user.eid}
										uname={$page.data.user.username}
										style={'avatar40'}
										bind:this={theAvatar} />
								</DropdownToggle>
								<DropdownMenu dark>
									<Container style="width:300px; text-align:center;">
										<Row cols="1">
											<Col style="text-align:center;">
												{#if $page.data.user}
													<Avatar
														eid={$page.data.user.eid}
														uname={$page.data.user.username}
														style={'avatar80-round10'}
														bind:this={theAvatar2} />
												{:else}
													<div class="w-100 d-flex justify-content-center">
														<div class="kfk-avatar-letter-middle img-thumbnail">ME</div>
													</div>
												{/if}
											</Col>
											<Col class="fw-bold mt-2">
												{$page.data.user ? $page.data.user.username : ''}
											</Col>
											<Col>
												{$page.data.user && $page.data.user.tenant
													? $page.data.user.tenant.name
													: ''}
											</Col>
											<Col>{DEPLOY_MODE}</Col>
										</Row>
										<InputGroup>
											<InputGroupText>
												<i class="bi-translate" />
											</InputGroupText>
											<LocaleSwitcher />
										</InputGroup>
									</Container>
									<DropdownItem divider />
									<DropdownItem
										class="text-center"
										on:click={(e) => {
											goto('/settings');
										}}>
										{$_('navmenu.settings')}
									</DropdownItem>
									<DropdownItem
										class="text-center"
										on:click={(e) => {
											goto('/docs');
										}}>
										{$_('navmenu.doc')}
									</DropdownItem>
									<DropdownItem divider />
									<DropdownItem
										class="text-center"
										on:click={logout}>
										<Icon name="door-open" />
										{$_('account.signout')}
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</Col>
					{/if}
				</Row><Row>
					<Col class="kfk-header-username tnt-header-username">
						{$page.data.user ? $page.data.user.username : 'Metatocome'}
					</Col>
				</Row>
			</Col>
		</Row>
		<button
			class="navbar-toggler bg-light border border-primary"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="true"
			aria-label="Toggle navigation">
			<span class="navbar-toggler-icon" />
		</button>
		<div
			class="collapse navbar-collapse show"
			id="navbarSupportedContent">
			<Nav class="ms-auto">
				<NavItem class="px-1">
					<NavLink
						class="m-0 p-0"
						href="/"
						active={$page.url.pathname === '/'}>
						{$_('navmenu.home')}
					</NavLink>
				</NavItem>
				{#if $page.data.user}
					<NavItem class="px-1">
						<NavLink
							class="m-0 p-0"
							href="/discuss"
							active={$page.url.pathname === '/discuss'}>
							{$_('navmenu.discuss')}
						</NavLink>
					</NavItem>
					<NavItem class="px-1">
						<NavLink
							class="m-0 p-0"
							href={'#'}
							on:click={() => {
								goto('/template');
							}}
							active={$page.url.pathname === '/template'}>
							{$_('navmenu.planning')}
						</NavLink>
					</NavItem>
					<NavItem class="px-1">
						<NavLink
							class="m-0 p-0"
							href={'#'}
							on:click={() => {
								goto('/workflow');
							}}
							active={$page.url.pathname === '/workflow'}>
							{$_('navmenu.workflow_mining')}
						</NavLink>
					</NavItem>
					<NavItem class="px-1">
						<NavLink
							class="m-0 p-0"
							href="/work"
							active={$page.url.pathname === '/work'}>
							{$_('navmenu.worklist')}
						</NavLink>
					</NavItem>
				{:else}
					<NavItem class="px-1">
						<NavLink
							class="m-0 ms-3 p-0"
							href="/login"
							active={$page.url.pathname === '/login'}>
							{$_('account.signin')}
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink
							class="m-0 p-0 px-3 "
							href="/register"
							active={$page.url.pathname === '/register'}>
							{$_('account.signup')}
						</NavLink>
					</NavItem>
				{/if}
			</Nav>
		</div>
	</Navbar>
</div>

<style>
	.navbar-toggler-icon {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
	}
</style>
