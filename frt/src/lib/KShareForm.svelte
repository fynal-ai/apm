<script lang="ts">
	import { _ } from '$lib/i18n';
	import { text_area_resize } from '$lib/autoresize_textarea';
	import { createEventDispatcher } from 'svelte';
	import TagCloudItem from '$lib/input/TagCloudItem.svelte';
	import * as api from '$lib/api';
	import { setFadeMessage } from '$lib/Notifier';
	const all_scenarios_txt = $_('kshare.all_scenarios');
	const all_industries_txt = $_('kshare.all_industries');
	export let token: string;
	export let tplid: string;
	export let scenarios;
	export let industries;

	const dispatch = createEventDispatcher();
	let kstpl: KsTpl = { name: '', desc: '', price: 0, tags: [], newtag: 'none' };
	const postKShare = async () => {
		const payload: Record<string, any> = { tplid: tplid, ...kstpl };
		delete payload.newtag;
		const res = await api.post(`/kshare/shareTemplate`, payload, token);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			setFadeMessage('Post to processHub successfully', 'success');
		}
	};
</script>

<div class="container">
	<h3 class="m-3">
		{$_('title.share')}
		<br />
		<a
			href={`/template/${tplid}&read`}
			class="kfk-link">
			{tplid}
		</a>
	</h3>
	<div
		class="row"
		id="kstpl_input_name">
		<div class="input-group">
			<span class="input-group-text">{$_('kshare.shareform.name')}:</span>
			<input
				type="text"
				class="form-control"
				bind:value={kstpl.name} />
			<span class="input-group-text">{$_('kshare.shareform.price')}:</span>
			<input
				class="form-control"
				type="number"
				bind:value={kstpl.price} />
		</div>
	</div>
	<div
		class="row"
		id="kstpl_input_desc">
		<div class="input-group">
			<span class="input-group-text">{$_('kshare.shareform.desc')}:</span>
			<textarea
				placeholder="Description"
				bind:value={kstpl.desc}
				use:text_area_resize
				class="form-control" />
		</div>
	</div>
	<div
		class="row"
		id="kstpl_existingtags">
		<div class="col">
			{#each kstpl.tags as tag}
				<TagCloudItem
					bind:text={tag}
					enableDelete={true}
					on:delete={async (e) => {
						kstpl.tags = kstpl.tags.filter((x) => x != tag);
					}} />
			{/each}
			<select
				bind:value={kstpl.newtag}
				on:change={() => {
					if (kstpl.newtag === 'none') return;
					kstpl.tags.push(kstpl.newtag);
					kstpl.tags = [...new Set(kstpl.tags)];
				}}
				class="border rounded">
				<option value={'none'}>{$_('kshare.shareform.scenario')}</option>
				<option value={all_scenarios_txt}>{all_scenarios_txt}</option>
				{#each scenarios as txt}
					<option value={txt}>&nbsp;&nbsp;&nbsp;{txt}</option>
				{/each}
				<option value={all_industries_txt}>{all_industries_txt}</option>
				{#each industries as txt}
					<option value={txt}>&nbsp;&nbsp;&nbsp;{txt}</option>
				{/each}
			</select>
			<!-- <button -->
			<!-- 	class="btn btn-primary btn-sm py-0" -->
			<!-- 	on:click|preventDefault={async () => { -->
			<!-- 		if (kstpl.newtag === 'none') return; -->
			<!-- 		kstpl.tags.push(kstpl.newtag); -->
			<!-- 		kstpl.tags = [...new Set(kstpl.tags)]; -->
			<!-- 	}}> -->
			<!-- 	{$_('kshare.shareform.add')} -->
			<!-- </button> -->
		</div>
	</div>
	<div
		id="kstpl_postsubmit"
		class="py-3">
		<div class="col">
			<button
				class="btn btn-primary"
				on:click={async (e) => {
					e.preventDefault();
					postKShare();
				}}
				color="primary">
				{$_('button.postKShare')}
			</button>

			<button
				class="btn btn-secondary"
				on:click={async (e) => {
					e.preventDefault();
					dispatch('cancel');
				}}>
				{$_('button.cancel')}
			</button>
		</div>
	</div>
	<ul>
		<li>
			分享后，其他人可以在
			<a href="/kshares">ProcessHub</a>
			看到，并选择采纳
		</li>
	</ul>
</div>
