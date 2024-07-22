<script lang="ts">
	import { page } from '$app/stores';
	import { breakpoint, mtcConfirm, notifyMessage } from '$lib/Stores';
	import DocumentTitle from '$lib/cognihub/DocumentTitle.svelte';
	import Confirm from '$lib/confirm.svelte';
	import { isLocaleLoaded } from '$lib/i18n';
	import { onMount } from 'svelte';
	import BaystoneFooter from './BaystoneFooter.svelte';
	import TopBar from './TopBar.svelte';

	let theConfirm: any;
	let showNotify = false;
	let notifyTimeout: ReturnType<typeof setTimeout> | undefined;

	// will be bind to: <svelte:window bind:innerWidth />
	// so we can get the innerWidth of the current browswer size
	// to determine bootstrapBreakpoint
	// we will use bootstrap breakpoint to "work", "workflow" pages
	let innerWidth = 0;
	let scrollY = 0;

	function getBootstrapBreakpoint(w: number) {
		const ret = w < 576 ? 0 : w < 768 ? 1 : w < 992 ? 2 : w < 1200 ? 3 : w < 1400 ? 4 : 5;
		//console.log('Get bootstrape breakpoint', ret);
		return ret;
	}

	let defaultToastPosClass = 'position-fixed top-50 start-50 translate-middle w-50';
	let toastPosClass = defaultToastPosClass;
	$: $breakpoint = getBootstrapBreakpoint(innerWidth);

	$: $notifyMessage.msg !== '' &&
		(() => {
			showNotify = true;
			if (notifyTimeout) {
				clearTimeout(notifyTimeout);
				notifyTimeout = undefined;
			}
			switch ($notifyMessage.pos) {
				case 'center':
					toastPosClass = 'position-fixed top-50 start-50 translate-middle w-50';
					break;
				case 'top-0':
					toastPosClass = 'position-fixed top-0 start-0 translate-middle';
					break;
				case 'top-50':
					toastPosClass = 'position-fixed top-0 start-50 translate-middle';
					break;
				case 'top-100':
					toastPosClass = 'position-fixed top-0 start-100 translate-middle';
					break;
				case 'center-0':
					toastPosClass = 'position-fixed top-50 start-0 translate-middle';
					break;
				case 'center-50':
					toastPosClass = 'position-fixed top-50 start-50 translate-middle';
					break;
				case 'center-100':
					toastPosClass = 'position-fixed top-50 start-100 translate-middle';
					break;
				case 'bottom-0':
					toastPosClass = 'position-fixed top-100 start-0 translate-middle';
					break;
				case 'bottom-50':
					toastPosClass = 'position-fixed top-100 start-50 translate-middle';
					break;
				case 'bottom-100':
					toastPosClass = 'position-fixed top-100 start-100 translate-middle';
					break;
				default:
					toastPosClass = 'position-fixed top-50 start-50 translate-middle w-50';
					break;
			}
			notifyTimeout = setTimeout(
				async () => {
					$notifyMessage.msg = '';
					showNotify = false;
					notifyTimeout = undefined;
				},
				($notifyMessage.duration ?? 3) * 1000
			);
		})();

	$: $mtcConfirm.title != '' &&
		theConfirm &&
		(() => {
			theConfirm.title = $mtcConfirm.title;
			theConfirm.body = $mtcConfirm.body;
			theConfirm.buttons = $mtcConfirm.buttons;
			theConfirm.callbacks = $mtcConfirm.callbacks;
			theConfirm.toggle();
		})();

	onMount(async () => {
		await import('bootstrap/dist/js/bootstrap.min.js');
		$breakpoint = getBootstrapBreakpoint(innerWidth);
	});
</script>

<svelte:head>
	{#if $page.data.url.hostname.indexOf('lkh.ai') > -1}
		<link
			rel="icon"
			href="/favicons/favicon-ai.png" />
	{:else if $page.data.url.hostname.indexOf('baystone') > -1}
		<link
			rel="icon"
			href="/images/baystone-logo.png" />
	{:else}
		<link
			rel="icon"
			href="/favicon.png" />
	{/if}
</svelte:head>
<svelte:window
	bind:innerWidth
	bind:scrollY />
{#key $page.data.user}
	{#if $isLocaleLoaded}
		{#if ['/ast'].indexOf($page.url.pathname) >= 0}
			<slot />
		{:else}
			{#if ['/login', '/register'].indexOf($page.url.pathname) === -1}
				<div
					class="px-5 fixed-top topcolor topheight"
					class:transparent={scrollY < 60}>
					<TopBar />
				</div>
				<div
					id="topAnchor"
					class="border-bottom topheight" />
			{/if}
			<slot />
			<BaystoneFooter />
		{/if}
	{:else}
		<!-- If locale has not been loaded -->
		{#if $page.data.url.hostname.indexOf('lkh.ai') > -1}
			<div class="container">
				class="w-100 text-center " style="height:100vh;">
				<div class="runninglogo-ai w-100">&nbsp;</div>
			</div>
		{:else}
			<div
				class="container w-100 text-center"
				style="height:100vh;">
				<div class="runninglogo w-100">&nbsp;</div>
			</div>
		{/if}
	{/if}
{/key}

<DocumentTitle></DocumentTitle>

<Confirm bind:this={theConfirm} />

<!-- Do not show notify if it's default -->
{#if showNotify && ($notifyMessage.title === 'Notification' && $notifyMessage.msg === 'Hello Yarknode') == false}
	<div
		class={`card shadow-lg ${toastPosClass} border border-info my-bg-${
			$notifyMessage.type ?? 'light'
		}`}
		style="max-width: 300px; z-index: 2;">
		<div class="card-body">
			<div class="card-title d-flex">
				{$notifyMessage.title ?? 'Notification'}
				<div class="clickable ms-auto">
					<i
						role="none"
						class="bi bi-x"
						on:keydown={undefined}
						on:click={() => {
							$notifyMessage.msg = '';
							showNotify = false;
						}} />
				</div>
			</div>
			<p class="card-text">
				{$notifyMessage.msg}
			</p>
		</div>
	</div>
{/if}

<style>
	.topheight {
		height: 60px;
	}
	.topcolor {
		background-color: var(--bs-body-bg) !important;
		transition: background-color 0.3s;
	}
	.topcolor.transparent {
		/* background-color: transparent; */
		transition: background-color 0.3s;
	}
</style>
