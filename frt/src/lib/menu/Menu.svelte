<script lang="ts">
	import { isLocaleLoaded, _, locale } from '$lib/i18n';
	import PcMenu from './PcMenu.svelte';
	import { menus } from '$lib/Stores';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { mygoto } from './Util';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import {
		menuDataForGet,
		menuDataForSet,
		menuInSession,
		menuDataForSetting,
		menuConfig,
		menuRefreshFlag,
	} from './MenuData';
	import type { menuItemType, menuDataType } from './MenuData';

	export let dataMode: string = 'static';
	export let menuDef: menuDataType[] = [{ id: 'Welcome' }];
	export let avatar: any = { img: 'unknown' };
	export let logo: any = { img: '/svg/yarknode.svg' };
	export let menuStyle: string = 'browser';

	const dispatch = createEventDispatcher();

	//copy menuDef to $menuDataForGet once changed.
	//Else where, could get internal menuDef by $menuDataForGet
	$: $menuDataForGet = menuDef;
	//Once menuRefreshFlag was set to true, refresh menu with data in $menuDataForSet;
	$: $menuRefreshFlag &&
		(() => {
			// console.log('Entered refreshMenuFlag');
			__refreshMenu($menuDataForSet);
			// console.log($menuDataForSet);
			$menuRefreshFlag = false;
		})();

	let overflag: Record<string, boolean> = {};
	export let defaultMenuSize: string | undefined = undefined;
	export let pinned: boolean = true;
	let lastPath = '';

	let menuSize: string = 'float-small';
	let lastMenuMode: string = menuStyle === 'mobile' ? 'float-big' : 'float-small';

	if (['mobile', 'pc', 'browser', 'windows'].indexOf(menuStyle) < 0) menuStyle = 'browser';

	let foldersExpanding: any = {};
	let menuItems: menuItemType[] = [];

	const parseDataToItems = (items: any[], data: any[], level: number = 0, folder: string) => {
		foldersExpanding[folder] = false;
		for (let i = 0; i < data.length; i++) {
			let mi: menuItemType = {
				...data[i],
				level,
				display: dataMode === 'editting' ? true : false,
				folder: folder,
				hasSub: data[i].sub ? (data[i].sub.length > 0 ? true : false) : false,
				expanded: false,
				path: folder + data[i].id,
			};
			items.push(mi);
			if (mi.hasSub) {
				parseDataToItems(items, data[i].sub, level + 1, folder + data[i].id + '/');
			}
		}
	};

	const expandFolder = (folder: string) => {
		foldersExpanding[folder] = true;
		for (let i = 0; i < menuItems.length; i++) {
			if (menuItems[i].folder === folder) {
				//展开当前菜单及其所有直接子级
				menuItems[i].display = true;
			} else if (menuItems[i].folder.indexOf(folder) === 0) {
				//展开 之前被展开过的孙级
				if (foldersExpanding[menuItems[i].folder]) {
					menuItems[i].display = true;
				}
			}
		}
	};

	const expandItem = (item: menuItemType) => {
		let selfFolder = item.folder + item.id + '/';
		expandFolder(selfFolder);
		item.expanded = true;
	};

	const collapseItem = (item: menuItemType) => {
		let selfFolder = item.folder + item.id + '/';
		const collapseFolder = (folder: string) => {
			if (dataMode === 'editting') return;
			foldersExpanding[folder] = false;
			for (let i = 0; i < menuItems.length; i++) {
				if (menuItems[i].folder.indexOf(folder) === 0) {
					menuItems[i].display = false;
				}
			}
		};
		collapseFolder(selfFolder);
		item.expanded = false;
	};

	const isFolder = (item: menuItemType) => {
		return item.hasSub;
	};

	const onMouseOver = () => {
		if (dataMode === 'editting') return;
		if (menuSize === 'float-small') {
			menuSize = 'float-big';
			dispatch('sizeChanged', { from: 'float-small', to: 'float-big' });
		}
	};
	const onMouseOut = () => {
		if (dataMode === 'editting') return;
		if (menuSize === 'float-big' && !pinned) {
			if (menuStyle === 'pc' || menuStyle === 'browser') {
				menuSize = 'float-small';
				dispatch('sizeChanged', { from: 'float-big', to: 'float-small' });
			} else {
				menuSize = 'float-logo';
				dispatch('sizeChanged', { from: 'float-big', to: 'float-logo' });
			}
		}
	};
	const onClickLogo = () => {
		if (menuSize === 'float-logo') {
			menuSize = menuStyle === 'mobile' || menuStyle === 'windows' ? lastMenuMode : 'float-big';
			dispatch('sizeChanged', { from: 'float-logo', to: menuSize });
		} else {
			lastMenuMode = menuSize;
			menuSize = 'float-logo';
			dispatch('sizeChanged', { from: lastMenuMode, to: menuSize });
		}
	};
	const onClose = onClickLogo;
	const onBlur = () => {};
	const onFocus = () => {};
	const onTogglePin = (e: Event) => {
		e.preventDefault();
		if (pinned) {
			//menuSize =menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-logo' : 'float-small';
		} else {
			lastMenuMode = menuSize;
			menuSize = 'float-big';
			dispatch('sizeChanged', { from: lastMenuMode, to: menuSize });
		}
		pinned = !pinned;
	};
	export const clickById = (theID: string) => {
		let rbIndex = menuItems.map((mi) => mi.id).indexOf(theID);
		if (rbIndex < 0) return;

		let menuItem = menuItems[rbIndex];
		onClickItem(menuItem);
	};
	const onClickItem = (item: menuItemType) => {
		if (dataMode === 'editting') return;
		if (isFolder(item)) {
			if (item.expanded === false) {
				expandItem(item);
				if ($menuConfig.expandOneOnSameLevel) {
					let changed = false;
					for (let i = 0; i < menuItems.length; i++) {
						if (
							menuItems[i].level === item.level &&
							menuItems[i].path !== item.path &&
							menuItems[i].expanded === true
						) {
							collapseItem(menuItems[i]);
							changed = true;
						}
					}
					if (changed) {
						menuItems = menuItems;
					}
				}
			} else {
				if (lastPath.indexOf(item.path) === 0 || !item.href) collapseItem(item);
			}
		} else {
			if (menuStyle === 'mobile' || menuStyle === 'windows') {
				menuSize = 'float-logo';
			}
		}
		if (item.callback) {
			try {
				dispatch(item.callback, item.payload);
			} catch (e) {
				console.error(e);
			}
		}
		if (dataMode !== 'editting') {
			if (item.target) {
				window && window.open(item.href, item.target);
			} else if (item.href) {
				let m = item.href.match(/^dispatch:([^:]+):?(.+)/);
				if (m) {
					let action = m[1];
					dispatch(action, m[2]);
				} else {
					mygoto(item.href);
				}
			}
		}
		lastPath = item.path;
		menuItems = menuItems;
	};

	//TODO:
	const getLabel = (item: menuItemType): string => {
		let label = item.id;
		if (item.alias) {
			label = item.alias;
		} else {
			label = item.id;
		}
		return label;
	};

	const replaceChildren = (theID: string, children: menuDataType[]) => {
		let rbIndex = menuItems.map((mi) => mi.id).indexOf(theID);
		if (rbIndex >= 0) {
			let rb = menuItems[rbIndex];
			let oldChildren = menuItems.filter((mi) => {
				return mi.folder === rb.folder + rb.id + '/';
			});
			let oldChildrenCount = oldChildren.length;
			menuItems[rbIndex].hasSub = false;
			const newChildrenDataDef = [
				{
					id: menuItems[rbIndex].id,
					class: menuItems[rbIndex].class,
					alias: menuItems[rbIndex].alias,
					icon: menuItems[rbIndex].icon,
					sub: children,
				},
			];
			let tmpItems: menuItemType[] = [];
			parseDataToItems(
				tmpItems,
				newChildrenDataDef,
				menuItems[rbIndex].level,
				menuItems[rbIndex].folder + menuItems[rbIndex].id,
			);
			tmpItems[0].display = true;
			menuItems.splice(rbIndex, oldChildrenCount + 1, ...tmpItems);
			menuItems = menuItems;
		}
	};

	export const translate = (fn: (str: string) => string) => {
		for (let i = 0; i < menuItems.length; i++) {
			let tmp = menuItems[i].alias;
			if (!tmp) continue;
			if (tmp.charAt(0) !== '$') continue;
			menuItems[i].alias = fn(tmp.slice(1));
		}
		menuItems = menuItems;
	};

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

	export const __refreshMenu = (newMenuDef: menuDataType[] | undefined = undefined) => {
		if (newMenuDef) menuDef = newMenuDef;
		if (dataMode === 'editting') {
			menuDef = $menuDataForSetting as menuDataType[];
		}
		menuItems.length = 0;
		parseDataToItems(menuItems, menuDef, 0, '/');
		expandFolder('/');

		if (dataMode === 'editing') {
			menuItems = menuItems.map((x) => {
				x.display = true;
				x.expanded = true;
				return x;
			});
		}
		menuItems = menuItems;
		$menus = menuItems as never[];
	};

	export const tickMenu = () => {
		menuItems = menuItems;
	};

	onMount(async () => {
		menuSize = defaultMenuSize
			? menuStyle === 'mobile' || menuStyle === 'windows'
				? 'float-logo'
				: defaultMenuSize
			: pinned
			? 'float-big'
			: menuStyle === 'mobile' || menuStyle === 'windows'
			? 'float-logo'
			: 'float-small';
		lastMenuMode = menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-big' : 'float-small';

		__refreshMenu();
		dispatch('menuMounted');
	});

	$: menuStyle &&
		(menuSize = menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-logo' : 'float-small') &&
		(lastMenuMode =
			menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-big' : 'float-small');
</script>

<a
	href={'#'}
	id="___ykmenu_hidden_a"
	style={'display: none;'}>
	&nbsp;
</a>
<!-- svelte-ignore missing-declaration -->
{#if menuStyle === 'pc'}
	<PcMenu
		{menuItems}
		{logo}
		{avatar}
		on:changeStyle
		on:changeWorklistStatus />
{:else}
	<div
		class={'kfk-menu' +
			' ' +
			'kfk-menu-style-' +
			menuStyle +
			' ' +
			(dataMode === 'editting' ? 'editting-menu' : 'kfk-menu-' + menuSize + ' tnt-navmenu')}
		on:mouseenter={onMouseOver}
		on:mouseleave={onMouseOut}
		on:blur={onBlur}
		on:focus={onFocus}
		transition:slide={{ delay: 100, duration: 300, easing: quintOut }}>
		{#if dataMode !== 'editting'}
			{#if menuStyle === 'browser' && menuSize === 'float-logo'}
				<div
					class="org-logo-top"
          role="none"
					on:keydown={null}
					on:click={onClickLogo}>
					<img
						src={logo.img}
						class="org-logo-img"
						alt="logo" />
				</div>
			{/if}
			<div class="row">
				{#if menuSize !== 'float-logo' && menuSize !== 'float-small'}
					<div class="col">
						<slot name="me">
							<!-- 缺省 avatar 用图片 -->
							{#if avatar.img !== 'unknown'}
								<div
									class="togglepin "
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
					<div
						class={(menuStyle === 'mobile' || menuStyle === 'windows' ? 'ms-auto' : '') +
							' col togglepin'}
						on:mouseenter={() => {
							overflag['home'] = true;
						}}
						on:mouseleave={() => {
							overflag['home'] = false;
						}}>
						<a
							href={'#'}
							on:click={() => {
								dispatch('goHome');
							}}>
							<i class={'bi fs-5 bi-house' + (overflag['home'] ? '-fill' : '')} />
						</a>
					</div>
					<div
						class="col m-0 p-0 togglepin"
						on:mouseenter={() => {
							overflag['pin'] = true;
						}}
						on:mouseleave={() => {
							overflag['pin'] = false;
						}}>
						<a href={'#'}>
							<i
								class={'bi fs-5 ' +
									(pinned
										? overflag['pin']
											? 'bi-pin'
											: 'bi-pin-fill'
										: overflag['pin']
										? 'bi-pin-angle-fill'
										: 'bi-pin-angle')}
                role="none"
								on:click={onTogglePin}
								on:keydown={onTogglePin} />
						</a>
					</div>
					<div
						class="col m-0 p-0 togglepin"
						on:mouseenter={() => {
							overflag['close'] = true;
						}}
						on:mouseleave={() => {
							overflag['close'] = false;
						}}>
						<a href={null}>
							<i
								class={'bi fs-5 ' + (overflag['close'] ? 'bi-x-circle-fill' : 'bi-x-lg')}
								on:click={() => {
									overflag['close'] = false;
									onClose();
								}}
                role="none"
								on:keydown={null} />
						</a>
					</div>
				{/if}
			</div>
		{/if}
		{#if menuSize !== 'float-logo'}
			<div class="pb-2">
				{#each menuItems as item}
					{#if checkVisible(item)}
						{#if item.id !== '___separator___'}
							<div
								class={dataMode === 'editting'
									? 'menuitem-editting'
									: 'menuitem ' +
									  (item.class
											? Array.isArray(item.class)
												? item.class.join(' ')
												: item.class
											: '')}
								style={menuSize === 'float-small' && dataMode !== 'editting'
									? 'margin-left: 8px;'
									: `margin-left: ${8 + (item.level ?? 0) * 16}px;`}
								transition:slide={{ delay: 100, duration: 300, easing: quintOut }}
                role="none"
								on:keydown={null}
								on:click|preventDefault={(_) => {
									onClickItem(item);
								}}>
								<div class="w-100 row m-0 p-0">
									<div class="col m-0 p-0">
										<!--start 显示图标 -->
										{#if item.id === '____ME'}
											{#if $menuInSession && avatar.img !== 'unknown'}
												<img
													src={avatar.img}
													class={avatar.class ?? 'avatar16'}
													alt="avatar" />
											{:else}
												<i class="bi bi-person" />
											{/if}
										{:else if item.icon}
											<i class={`bi bi-${item.icon}`} />
										{:else if item.img}
											<img
												src={item.img}
												alt={item.id}
												class="avatar16" />
										{/if}
										<!--end 显示图标 -->
										<!--start 显示文字 -->
										{#if dataMode !== 'editting' && menuSize === 'float-small'}
											<!-- 窄屏方式且没有icon,显示第一个字符 -->
											{#if !(item.icon || item.img)}
												<div class="w-100 text-center">
													{getLabel(item).charAt(0)}
												</div>
											{/if}
										{:else}
											<!-- 宽屏方式显示文字 -->
											{getLabel(item)}
										{/if}
										<!--end 显示文字 -->
									</div>
									{#if menuSize === 'float-big' && item.hasSub}
										<div class="col-auto m-0 ms-5 p-0">
											<i class={'bi ' + (item.expanded ? 'bi-chevron-up' : 'bi-chevron-right')} />
										</div>
									{/if}
								</div>
							</div>
						{:else}
							<hr />
						{/if}
					{/if}
				{/each}
				{#if ['mobile', 'windows'].indexOf(menuStyle) >= 0}
					<div>
						<hr class="m-0 p-0 mt-2" />
					</div>
				{/if}
			</div>
		{/if}
		{#if dataMode !== 'editting'}
			{#if menuStyle === 'mobile' || menuStyle === 'windows'}
				<div class="hstack  gap-2">
					<!-- bottom logo -->
					<div
						class={(menuStyle === 'mobile' ? 'ms-auto' : ' ') + ' org-logo'}
						style={logo.img ? `background-image: url(${logo.img}); ` : ''}
						on:click={onClickLogo}
            role="none"
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
						<!--img
						src={logo.img}
						class={logo.class ?? 'tnt-logo-img' + ' ' + (overflag['logo'] ? 'logo-over' : '')}
						alt="bizlogo"
					/-->
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.kfk-menu {
    max-width: 850px;
    padding-bottom: 10px;
    z-index: 1000;
		border: 0px;
		border-radius: 0px;
		margin-left: 5px;
		padding-left: 5px;
		padding-right: 5px;
		padding-top: 5px;
	  color: var(--kfk-menu-color);
		background-color: #cccccc;
		border-radius: 5px;
	}
	.kfk-menu-style-pc {
		left: 0px;
		top: 10px;
	}
	.kfk-menu-style-mobile {
		right: 0px;
		bottom: 2px;
		box-shadow: -5px 0 5px #8e8e8e, 0 10px 5px #8e8e8e, 1px 0 5px #8e8e8e, 0 -1px 5px #8e8e8e;
	}
	.kfk-menu-style-windows {
		left: 2px;
		bottom: 2px;
	}
	.kfk-menu-float-logo {
		position: fixed;
		width: 52px;
	}
	.kfk-menu-style-mobile.kfk-menu-float-logo {
		border-radius: 40px 0px 0px 40px;
	}
	.kfk-menu-style-browser.kfk-menu-float-logo {
		width: 52px;
		height: 52px;
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
	.kfk-menu-style-browser.kfk-menu-float-small {
		height: 100%;
		background: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 155, 25, 0.8));
		background-size: 220%;
	}
	.kfk-menu-style-browser.kfk-menu-float-big {
		height: 100%;
		background: linear-gradient(rgba(255, 255, 255, 0.5), #2726ff33);
		background-size: 220%;
		width: 205px;
	}

	.kfk-menu-float-small .togglepin {
		display: none;
	}
	.kfk-menu-float-logo .togglepin {
		display: none;
	}
	.kfk-menu-float-small .tnt-logo {
		height: 32px;
		background-size: 32px 32px;
	}

	.menuitem {
		overflow: hidden;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		margin-top: 10px;
		margin-right: 8px;
	}
	.menuitem img {
		width: 16px;
		height: 16px;
	}
	.menuitem a {
		text-decoration: none;
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
	.org-logo-top {
		width: 42px;
		height: 42px;
	}
	.org-logo-img {
		width: 42px;
		height: 42px;
		border: 1px #8000802f solid;
		border-radius: 11px;
		background-color: #8000802f;
	}

	.kfk-menu-style-browser.kfk-menu-float-logo .org-logo-img {
		background: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 155, 25, 0.8));
	}
</style>
