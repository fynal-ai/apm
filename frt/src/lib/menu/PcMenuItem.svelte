<script lang="ts">
	import { mygoto } from './Util';
	import type { menuItemType } from './MenuData';
	import { overPath } from './MenuData';
	import { createEventDispatcher } from 'svelte';
	export let menuItems: menuItemType[];
	export let item: menuItemType;
	const dispatch = createEventDispatcher();
	const getLabel = (item: menuItemType): string => {
		let label = item.id;
		if (item.alias) {
			label = item.alias;
		} else {
			label = item.id;
		}
		return label;
	};
	const isFolder = (item: menuItemType) => {
		return item.hasSub;
	};

	const collapseItem = (item: menuItemType) => {
		let selfFolder = item.folder + item.id + '/';
		const collapseFolder = (folder: string) => {
			for (let i = 0; i < menuItems.length; i++) {
				if (menuItems[i].folder.indexOf(folder) === 0) {
					menuItems[i].expanded = false;
				}
			}
		};
		collapseFolder(selfFolder);
		item.expanded = false;
	};

	const onClickItem = (e: Event, item: menuItemType) => {
		e.preventDefault();
		if (isFolder(item)) {
			if (item.expanded === false) {
				item.expanded = true;
				let changed = false;
				for (let i = 0; i < menuItems.length; i++) {
					if (
						menuItems[i].level === item.level &&
						menuItems[i].folder === item.folder &&
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
			} else {
				collapseItem(item);
			}
		}
		if (item.callback) {
			try {
				dispatch(item.callback, item.payload);
				console.log('dispatch', item.callback, item.payload);
			} catch (e) {
				console.error(e);
			}
		}
		if (item.target) {
			window && window.open(item.href, item.target);
		} else if (item.href) {
			console.log('goto(item.href)');
			try {
				mygoto(item.href);
			} catch (e: any) {
				console.log(e.message);
			}
		}
		menuItems = menuItems;
	};

	// const onMouseLeaveMenuItem = (item: menuItemType) => {
	// 	console.log(item.expanded);
	// 	if (item.expanded) {
	// 		item.expanded = false;
	// 	}
	// };
</script>

{#if true}
	<div class="ms-1">
		{#if !item.hasSub}
			<div
				class={'dropdown-item btn'}
				on:keydown={null}
				on:mouseenter={(_) => {
					$overPath = item.path;
				}}
				on:click={(e) => {
					onClickItem(e, item);
				}}>
				{getLabel(item)}
			</div>
		{:else}
			<div
				class="dropdown"
				class:dropend={item.level && item.level > 0}>
				<div
					class={'dropdown-toggle btn'}
					id={item.id}
					data-bs-auto-close="outside"
					on:keydown={null}
					on:click={(e) => {
						onClickItem(e, item);
					}}
					on:mouseenter={(_) => {
						let elem = document.getElementById(item.id);
						if (elem) elem.click();
						$overPath = item.path;
					}}
					on:mouseleave={(_) => {
						setTimeout(() => {
							if ($overPath.startsWith(item.path) === false) {
								item.expanded = false;
							}
						}, 100);
					}}
					role="button"
					data-bs-toggle="dropdown"
					aria-expanded="false">
					{getLabel(item)}
				</div>

				<ul
					class="dropdown-menu"
					class:show={item.expanded}>
					{#each menuItems.filter((subitem) => subitem.folder === item.folder + item.id + '/') as subitem}
						<li>
							<svelte:self
								{menuItems}
								item={subitem}
								on:changeStyle
								on:changeWorklistStatus />
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
