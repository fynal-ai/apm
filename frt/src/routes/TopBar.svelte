<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { _ } from '$lib/i18n';
	import { clientlocale } from '$lib/mtcLocalStores';
	import Logo from './Logo.svelte';
	const user = $page.data.user;
	let img_path = user?.avatar || '';
	let isAi2nvGroup =
		user &&
		user.group &&
		Array.isArray(user.group) &&
		user.group.some((g: string) => g.startsWith('AI2NV_'));
	async function logout() {
		let backupClientLocale = $clientlocale;
		localStorage.clear();
		$clientlocale = backupClientLocale;
		console.log('logout svelte clear localStorage');
		if ($page.data && $page.data.user) {
			delete $page.data.user;
		}
		goto(`/auth/logout`, { replaceState: true }); //退出以后刷新下页面
	}
	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		img_path = '/images/baystone.png';
	}
</script>

<nav class="navbar navbar-expand-lg">
	<div class="container-fluid">
		<Logo />

		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div
			class="collapse navbar-collapse"
			id="navbarSupportedContent">
			<ul class="navbar-nav mb-2 mb-lg-0">
				<li class="nav-item">
					<a
						class="nav-link"
						class:active={$page.url.pathname.startsWith('/apm/console') ||
							$page.url.pathname.startsWith('/ai2nv/apm/console')}
						href={'/apm/console/dashboard'}>
						控制台
					</a>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						class:active={$page.url.pathname.includes('/aboutus')}
						href={'/aboutus'}>
						{$_('baystone.nav.AboutUs')}
					</a>
				</li>
				<li class="nav-item dropdown">
					<a
						class="nav-link dropdown-toggle"
						href={'#'}
						role="button"
						data-bs-toggle="dropdown"
						aria-expanded="false">
						<span class="navbar-toggler-icon fs-6"></span>
					</a>
					<ul class="dropdown-menu">
						<li>
							<a
								class="dropdown-item"
								on:click={logout}
								href={'#'}>
								{$_('baystone.nav.logout')}
							</a>
						</li>
						{#if isAi2nvGroup}
							<li><hr class="dropdown-divider" /></li>
							<li>
								<a
									class="dropdown-item"
									class:active={['/ai2nv/center'].includes($page.url.pathname)}
									href={'/ai2nv/center'}>
									{$_('baystone.nav.Operations')}
								</a>
							</li>
						{/if}
					</ul>
				</li>
				<li class="nav-item vr mx-3"></li>
				<li class="nav-item d-flex align-items-center me-1">
					{#if user}
						<img
							class="avatar_icon me-1"
							src={img_path}
							on:error={handleImageError}
							alt="" />
						{user.username}
					{:else}
						<div
							class="btn-group"
							role="group">
							<button
								class="btn btn-primary btn-sm"
								type="button"
								on:click={() => {
									goto('/login');
								}}>
								登录
							</button>
							<!-- <button
								class="btn btn-primary btn-sm"
								type="button"
								on:click={() => {
									goto('/register');
								}}>
								注册
							</button> -->
						</div>
					{/if}
				</li>
			</ul>
		</div>
	</div>
</nav>

<style scope>
	@media (min-width: 992px) {
		.navbar-expand-lg .navbar-collapse {
			justify-content: flex-end;
		}
	}
	@media (max-width: 992px) {
		.navbar-collapse {
			padding: 2rem;
			background-color: var(--bs-light);
			border-radius: 0.5rem;
		}
		.navbar-collapse .vr {
			display: none;
		}
	}
	.avatar_icon {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		object-fit: cover;
		margin-right: 1rem;
		background: #f0f0f0;
	}
	.nav-link:hover {
		color: #12a0ff;
	}
	.nav-link.active {
		color: #007bff;
	}
</style>
