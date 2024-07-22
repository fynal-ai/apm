<script lang="ts">
	import type { PageData } from './$types';
	import * as api from '$lib/api';
	export let data: PageData;

	let { user } = data;
	$: ({ user } = data);
</script>

<ul class="ykcode">
	<li>eid: {user.eid}</li>
	<li>group: {user.group}</li>
	<li>name: {user.nickname}</li>
	<li>account: {user.account}</li>
	<li>account name: {user.username}</li>
	<li>tenant:</li>
	<ul>
		<li>id: {user.tenant._id}</li>
		<li>name: {user.tenant.name}</li>
		<li>domain: {user.tenant.domain}</li>
		<li>owner: {user.tenant.owner}</li>
	</ul>
	<li>
		Share template:
		{#await api.post('kshare/able', {}, user.sessionToken)}
			Checking
		{:then tsadmin}
			{tsadmin.ksable}
		{/await}
	</li>
</ul>
