<script lang="ts">
	import { _ } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';
	import Searchlet from '$lib/Searchlet.svelte';
	import { filterStorage } from '$lib/mtcLocalStores';
	import { mtcSession, currentTplid } from '$lib/Stores';
	import { tspans } from '$lib/variables';
	import Parser from '$lib/parser';
	import { title } from '$lib/title';
	import { page } from '$app/stores';

	const dispatch = createEventDispatcher();

	$title = 'HyperFlow';
	import { Col, Button, InputGroup, InputGroupText, Input, Offcanvas } from 'sveltestrap';

	const BIZ = 'todo';

	let user = $page.data.user;

	if (!$filterStorage[BIZ]) {
		$filterStorage[BIZ] = { tplTag: '', sortby: '-createdAt' };
	}
	if ($filterStorage[BIZ].hasOwnProperty('sortby') === false) {
		$filterStorage[BIZ].sortby = '-createdAt';
	}

	let show_calendar_select = false;
	let aSsPicked = '---PLS_PICK_ONE---';
	if (!$mtcSession.tplIdsForSearch_for_todo) {
		$mtcSession.tplIdsForSearch_for_todo = [];
	}
	if ($filterStorage[BIZ].calendar_begin !== '' || $filterStorage[BIZ].calendar_end !== '') {
		show_calendar_select = true;
	} else {
		show_calendar_select = false;
	}

	function searchNow(param = { preDelete: false, reason: '' }) {
		dispatch('searchNow', param);
	}
	function resetQuery(preDelete = false) {
		dispatch('resetQuery', preDelete);
	}

	const calendar_changed = function () {
		if (
			Parser.hasValue($filterStorage[BIZ].calendar_begin) &&
			Parser.isEmpty($filterStorage[BIZ].calendar_end)
		) {
			$filterStorage[BIZ].calendar_end = $filterStorage[BIZ].calendar_begin;
		}
		if (
			Parser.hasValue($filterStorage[BIZ].calendar_begin) &&
			Parser.hasValue($filterStorage[BIZ].calendar_end)
		) {
			searchNow({ preDelete: false, reason: 'calendar_changed' });
		}
	};
</script>

<div class="row row-cols-1 row-cols-md-2 g-3">
	<!-- <div class="col"> -->
	<!-- 	<InputGroup> -->
	<!-- 		<InputGroupText>{$_('extrafilter.template')}</InputGroupText> -->
	<!-- 		<select -->
	<!-- 			class="form-select" -->
	<!-- 			name="selectTpl" -->
	<!-- 			id="tplSelect" -->
	<!-- 			bind:value={$currentTplid} -->
	<!-- 			on:change|preventDefault={async (e) => { -->
	<!-- 				e.preventDefault(); -->
	<!-- 				searchNow({ preDelete: false, reason: 'allTemplate' }); -->
	<!-- 			}}> -->
	<!-- 			<option value=""> -->
	<!-- 				{$_('extrafilter.allTemplate')} -->
	<!-- 			</option> -->
	<!-- 			{#if $mtcSession.tplIdsForSearch_for_todo} -->
	<!-- 				{#each $mtcSession.tplIdsForSearch_for_todo as tpl} -->
	<!-- 					<option -->
	<!-- 						value={tpl} -->
	<!-- 						selected={tpl === $filterStorage[BIZ].tplid}> -->
	<!-- 						{tpl} -->
	<!-- 					</option> -->
	<!-- 				{/each} -->
	<!-- 			{/if} -->
	<!-- 		</select> -->
	<!-- 		<Button -->
	<!-- 			on:click={(e) => { -->
	<!-- 				e.preventDefault(); -->
	<!-- 				$filterStorage[BIZ].tplid = ''; -->
	<!-- 				searchNow({ preDelete: false, reason: '90deg' }); -->
	<!-- 			}} -->
	<!-- 			color="primary"> -->
	<!-- 			<i class="bi bi-arrow-return-left" /> -->
	<!-- 		</Button> -->
	<!-- 	</InputGroup> -->
	<!-- </div> -->
	{#if user.group === 'ADMIN'}
		<div class="col">
			<InputGroup class="kfk-input-template-name d-flex">
				<InputGroupText>{$_('extrafilter.starter')}</InputGroupText>
				<Input
					class="flex-fill"
					name="other_doer"
					bind:value={$filterStorage[BIZ].doer}
					aria-label="User Eid"
					placeholder="" />
				<Button
					on:click={(e) => {
						e.preventDefault();
						searchNow({ preDelete: false, reason: 'return_left' });
					}}
					color="primary">
					<i class="bi bi-arrow-return-left" />
				</Button>
				<Button
					class="btn-secondary"
					on:click={() => {
						$filterStorage[BIZ].doer = user.eid;
						searchNow({ preDelete: false, reason: 'me' });
					}}>
					{$_('extrafilter.me')}
				</Button>
				<Button
					on:click={async () => {
						$filterStorage[BIZ].doer = '';
						searchNow({ preDelete: false, reason: 'any' });
					}}
					class="btn-secondary m-0 py-1 px-3">
					{$_('remotetable.any')}
				</Button>
			</InputGroup>
		</div>
	{/if}
	<div class="col">
		<div class="input-group">
			<div class="input-group-text">
				{$_('remotetable.filter')}
			</div>
			<input
				class="form-control"
				type="search"
				title={$_('remotetable.bywhat')}
				placeholder={$_('remotetable.bywhat')}
				bind:value={$filterStorage[BIZ].pattern} />
			<div
				class="btn btn-primary"
				on:keydown={null}
				on:click|preventDefault={(e) => {
					e.preventDefault();
					searchNow({ preDelete: false, reason: 'by_what' });
				}}>
				<i class="bi bi-arrow-return-left" />
			</div>
		</div>
	</div>
	<div class="col">
		<div class="input-group">
			<div class="input-group-text">
				{$_('remotetable.in')}
			</div>
			<select
				class="form-control"
				id="timespanSelect"
				bind:value={$filterStorage[BIZ].tspan}
				on:change={async (e) => {
					e.preventDefault();
					//await load($srPage[BIZ], 'refresh', api.CACHE_FLAG.useIfExists);
					searchNow({ preDelete: false, reason: 'by_what' });
				}}>
				{#each Object.keys(tspans) as key}
					<option value={key}>{tspans[key]}</option>
				{/each}
			</select>
			<div
				class="btn btn-primary"
				on:keydown={null}
				on:click={async () => {
					if (show_calendar_select) {
						$filterStorage[BIZ].calendar_begin = '';
						$filterStorage[BIZ].calendar_end = '';
						show_calendar_select = false;
						searchNow({ preDelete: false, reason: 'start_end' });
					} else {
						show_calendar_select = true;
					}
				}}>
				<i class="bi bi-calendar-range" />
			</div>
		</div>
	</div>
	{#if show_calendar_select}
		<Col>
			<InputGroup>
				<InputGroupText>{$_('remotetable.calendarBegin')}</InputGroupText>
				<Input
					type="date"
					bind:value={$filterStorage[BIZ].calendar_begin}
					on:change={calendar_changed} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup>
				<InputGroupText>{$_('remotetable.calendarEnd')}</InputGroupText>
				<Input
					type="date"
					bind:value={$filterStorage[BIZ].calendar_end}
					on:change={calendar_changed} />
				<!-- <Button -->
				<!-- 	on:click={calendar_changed} -->
				<!-- 	color="primary"> -->
				<!-- 	<i class="bi bi-arrow-return-left" /> -->
				<!-- </Button> -->
			</InputGroup>
		</Col>
	{/if}
	<Col>
		<Searchlet
			objtype="todo"
			bind:aSsPicked
			on:searchlet={(msg) => {
				let ss = JSON.parse(msg.detail.ss);
				ss.pattern && ($filterStorage[BIZ].pattern = ss.pattern);
				ss.status && ($filterStorage[BIZ].status = ss.status);
				ss.tspan && ($filterStorage[BIZ].tspan = ss.tspan);
				if (ss.doer) $filterStorage[BIZ].doer = ss.doer;
				else $filterStorage[BIZ].doer = user.eid;
				if (ss.tplid) $currentTplid = ss.tplid;
				else $currentTplid = '';
				ss.calendar_begin && ($filterStorage[BIZ].calendar_begin = ss.calendar_begin);
				ss.calendar_end && ($filterStorage[BIZ].calendar_end = ss.calendar_end);

				if ($filterStorage[BIZ].calendar_begin !== '' || $filterStorage[BIZ].calendar_end !== '') {
					show_calendar_select = true;
				} else {
					show_calendar_select = false;
				}

				searchNow({ preDelete: false, reason: 'searchlet' });
			}}
			on:resetSearchlet={() => {
				console.log('reset searchlet');
				$currentTplid = '';
				aSsPicked = '---PLS_PICK_ONE---';
				resetQuery(true);
			}} />
	</Col>
</div>
