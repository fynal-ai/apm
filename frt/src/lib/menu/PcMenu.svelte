<script lang="ts">
	import { mygoto } from './Util';
	import PcMenuItem from './PcMenuItem.svelte';
	import { onMount } from 'svelte';
	import type { menuItemType } from './MenuData';

	export let menuItems: menuItemType[] = [];
	export let avatar: any = { img: 'unknown' };
	export let logo: any = { img: '/yarknode_logo.png' };

	let overflag: Record<string, boolean> = {};

	const onMouseOver = () => {};
	const onMouseOut = () => {};
	const onClickLogo = () => {
		mygoto('/');
	};
	const onBlur = () => {};
	const onFocus = () => {};

	const checkVisible = (item: menuItemType) => {
		let ret = true;
		if (!item.display) {
			ret = false;
		} else if (!(item.visible ?? true)) {
			ret = false;
		} else {
			if (item.check_visible) {
				ret = item.check_visible.fn(item.check_visible.what, item.check_visible.expect);
			}
		}

		return ret;
	};

	onMount(async () => {});
</script>

<div
	class={'kfk-menu'}
	on:mouseenter={onMouseOver}
	on:mouseleave={onMouseOut}
	on:blur={onBlur}
	on:focus={onFocus}>
	<div class="hstack  gap-2 text-nowrap">
		<div
			class="org-logo"
			style={logo.img ? `background-image: url(${logo.img}); ` : ''}
			on:click={onClickLogo}
			on:keydown={onClickLogo}
			on:mouseenter={() => {
				overflag['logo'] = true;
			}}
			on:mouseleave={() => {
				overflag['logo'] = false;
			}}
			on:blur={onBlur}
			on:focus={onFocus}>
			&nbsp;
		</div>
		{#each menuItems.filter((item) => item.level === 0) as item, index}
			{#if checkVisible(item)}
				<PcMenuItem
					{menuItems}
					{item}
					on:changeStyle
					on:changeWorklistStatus />
			{/if}
		{/each}
		<slot name="me">
			{#if avatar.img !== 'unknown'}
				<div
					class="ms-auto "
					on:mouseenter={() => {
						overflag['top-avatar'] = true;
					}}
					on:mouseleave={() => {
						overflag['top-avatar'] = false;
					}}>
					<img
						src={avatar.img}
						class={(avatar.class ?? 'avatar32') +
							' ' +
							(overflag['top-avatar'] ? 'avatar-over' : '')}
						alt="avatar" />
				</div>
			{/if}
		</slot>
	</div>
</div>

<style>
	.kfk-menu {
		border: 0px;
		border-radius: 0px;
		margin-left: 5px;
		padding-left: 5px;
		padding-right: 5px;
		padding-top: 5px;
		z-index: 1000;
		background-color: #cccccc;
		border-radius: 5px;
	}
	.kfk-menu-style-pc {
		left: 0px;
		top: 10px;
	}
	.kfk-menu-style-mobile {
		right: 2px;
		bottom: 2px;
	}
	.kfk-menu-style-windows {
		left: 2px;
		bottom: 2px;
	}
	.kfk-menu-float-logo {
		position: fixed;
		width: 42px;
	}
	.kfk-menu-float-big {
		position: fixed;
	}
	.kfk-menu-float-small {
		position: fixed;
		max-width: 42px;
		min-width: 42px;
		width: 42px;
	}

	.menuitem {
		overflow: hidden;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		margin-top: 10px;
		margin-right: 8px;
	}
	.menuitem:hover {
		background-color: var(--bs-primary);
		cursor: pointer;
	}
	.ynmi:hover {
		background-color: var(--bs-primary);
		cursor: pointer;
	}
	.avatar32 {
		width: 32px;
		height: 32px;
		border-radius: 16px;
	}
	.avatar-over {
		border: inset;
		border-color: var(--bs-primary);
	}
	.logo-over {
		border: inset;
		border-color: var(--bs-primary);
	}

	.org-logo {
		width: 32px;
		height: 32px;
		min-width: 32px;
		min-height: 32px;
		background-repeat: no-repeat;
		background-size: 100%;
		background-position: center;
	}
</style>
