<svelte:options accessors={true} />

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import { createEventDispatcher } from 'svelte';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import OrgChartCsvFormat from '$lib/orgchartCsvFormat.svelte';
	import type { EmpResponse, OrgMembers, oneArgFunc } from '$lib/types';
	import { Input, InputGroupText, InputGroup, Container, Button, Row, Col } from 'sveltestrap';
	const dispatch = createEventDispatcher();
	type OUType = { ou: string; cn: string; prefix: string; level: number };
	let allOUs: OUType[] = [];
	let files: any;
	let content;
	let errMsg: string;
	let pickedNewOU = 'root';
	let fileSaver: any = null;
	//let default_user_password = '';
	let admin_password = '';

	let new_ou_id = '';
	let new_ou_name = '';
	let new_user_ou_id = '';
	let new_user_name = '';
	let new_user_eid = '';
	let new_user_account = '';
	let delete_user_eid = '';
	let delete_ou_id = '';
	async function uploadOrgChart(e: Event) {
		e.preventDefault();
		const formData = new FormData();
		// formData.append('password', admin_password);
		//formData.append('default_user_password', default_user_password);
		formData.append('file', files[0]);
		try {
			await fetch(`${API_SERVER}/orgchart/import/excel`, {
				method: 'POST',
				headers: {
					Authorization: $page.data.user.sessionToken,
				},
				body: formData,
			})
				.then((response) => response.json())
				.then(async (result) => {
					if (result.error) {
						setFadeMessage(result.message, 'warning');
					} else {
						refreshAllOUs().then();
						dispatch('refreshOrgChart');
					}
				})
				.catch((error) => {
					console.error('Error:', error);
					setFadeMessage(error.message, 'warning');
				});
		} catch (err) {
			console.error(err);
		}
	}

	type EidType = { eid: string; nickname: string };
	let eidsNotStaff: EidType[] = [];

	const getUserNotStaff = async function () {
		eidsNotStaff = (await api.post(
			'employee/not/in/orgchart',
			{},
			$page.data.user.sessionToken,
		)) as any;
		console.log(eidsNotStaff);
	};
	const removeEmployee = async function (eid: string) {
		(await api.post('tnt/employee/remove', { eids: [eid] }, $page.data.user.sessionToken)) as any;
		eidsNotStaff = eidsNotStaff.filter((u) => {
			return u.eid !== eid;
		});
	};

	type StaffType = { ou: string; cn: string; eid: string };
	export const setPickedStaff = function (pickedStaff: StaffType) {
		new_user_ou_id = pickedStaff.ou;
		new_user_name = pickedStaff.cn;
		new_user_eid = pickedStaff.eid;
		delete_user_eid = pickedStaff.eid;
		pickedNewOU = pickedStaff.ou;
	};

	export const setPickedOU = function (pickedOU: OUType) {
		new_ou_id = pickedOU.ou;
		new_ou_name = pickedOU.cn;
		delete_ou_id = pickedOU.ou;
	};

	const refreshAllOUs = async () => {
		allOUs = await api.post('orgchart/allous', {}, $page.data.user.sessionToken);
		for (let i = 0; i < allOUs.length; i++) {
			let tblChars = '';
			tblChars = '・・'.repeat(allOUs[i].level);
			allOUs[i].prefix = tblChars;
		}
	};
	const onCreateOrModifyOuEntry = async (e: Event) => {
		e.preventDefault();
		let res = await api.post(
			'orgchart/create/or/modify/ou/entry',
			{
				ou: new_ou_id,
				cn: new_ou_name,
			},
			$page.data.user.sessionToken,
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			refreshAllOUs().then();
			dispatch('refreshOrgChart');
			setFadeMessage($_('message.success'), 'success');
		}
	};
	const onRemoveOuEntry = async (e: Event) => {
		e.preventDefault();
		const confirmAction = async () => {
			let res = await api.post(
				'orgchart/remove/ou/entry',
				{
					ou: new_ou_id,
				},
				$page.data.user.sessionToken,
			);
			if (res.error) {
				setFadeMessage(res.message, 'warning');
			} else {
				refreshAllOUs().then();
				dispatch('refreshOrgChart');
				setFadeMessage($_('message.success'), 'success');
			}
		};
		$mtcConfirm = {
			title: $_('setting.orgchart.confirmRemoveOu.title'),
			body: $_('setting.orgchart.confirmRemoveOu.body'),
			buttons: [$_('setting.orgchart.confirmRemoveOu.button.yes')],
			callbacks: [
				async () => {
					await confirmAction();
					mtcConfirmReset();
				},
			],
		};
	};

	onMount(async () => {
		await refreshAllOUs();
	});
</script>

<form class="new" enctype="multipart/form-data">
	<Container class="text-nowrap">
		<div class="mt-5" />
		<!--InputGroup>
			<InputGroupText>{$_('setting.orgchart.emp_pwd')}</InputGroupText>
			<Input bind:value={default_user_password} type="password" required={true} />
		</InputGroup -->
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={new_user_ou_id} />
			<InputGroupText>{$_('setting.orgchart.account')}</InputGroupText>
			<Input bind:value={new_user_account} />
			<InputGroupText>{$_('setting.orgchart.emp_eid')}</InputGroupText>
			<Input bind:value={new_user_eid} />
			<InputGroupText>{$_('setting.orgchart.emp_name')}</InputGroupText>
			<Input bind:value={new_user_name} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/create/employee/entry',
						{
							ou: new_user_ou_id,
							eid: new_user_eid,
							cn: new_user_name,
							account: new_user_account,
						},
						$page.data.user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						setFadeMessage($_('message.success'), 'success');
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.emp_entry_create')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.emp_eid')}</InputGroupText>
			<Input bind:value={new_user_eid} />
			<InputGroupText>{$_('setting.orgchart.emp_name')}</InputGroupText>
			<Input bind:value={new_user_name} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/modify/employee/entry',
						{
							eid: new_user_eid,
							cn: new_user_name,
						},
						$page.data.user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.emp_entry_update')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={new_user_ou_id} />
			<InputGroupText>{$_('setting.orgchart.emp_eid')}</InputGroupText>
			<Input bind:value={new_user_eid} />
			<button
				class="btn btn-primary"
				on:click|preventDefault={async () => {
					let res = await api.post(
						'orgchart/remove/one/employee/entry',
						{
							eid: new_user_eid,
							ou: new_user_ou_id,
						},
						$page.data.user.sessionToken,
					);
					if (res.error) {
						setFadeMessage($_(`error.${res.error}`), 'warning');
					} else {
						setFadeMessage($_(`message.success`), 'success');
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.removeentry')}
			</button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.emp_eid')}</InputGroupText>
			<Input bind:value={delete_user_eid} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/remove/all/employee/entries',
						{
							eid: new_user_eid,
						},
						$page.data.user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.emp_entries_remove')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>
				{$_('setting.orgchart.copyormovestaffto', {
					values: {
						from: new_user_ou_id,
						eid: new_user_eid,
					},
				})}
			</InputGroupText>
			<select class="form-select" bind:value={pickedNewOU}>
				{#each allOUs as aOU, aOUIndex}
					<option value={aOU.ou}>{aOU.prefix}{aOU.ou}: {aOU.cn}</option>
				{/each}
			</select>
			<button
				class="btn btn-primary"
				on:click|preventDefault={async () => {
					await api.post(
						'orgchart/copy/employee/entry',
						{
							eid: new_user_eid,
							from: new_user_ou_id,
							to: pickedNewOU,
						},
						$page.data.user.sessionToken,
					);
					dispatch('refreshOrgChart');
				}}>
				{$_('setting.orgchart.btn.copyto')}
			</button>
			<button
				class="btn btn-primary"
				on:click|preventDefault={async () => {
					await api.post(
						'orgchart/move/employee/entry',
						{
							eid: new_user_eid,
							from: new_user_ou_id,
							to: pickedNewOU,
						},
						$page.data.user.sessionToken,
					);
					dispatch('refreshOrgChart');
				}}>
				{$_('setting.orgchart.btn.moveto')}
			</button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={new_ou_id} />
			<InputGroupText>{$_('setting.orgchart.ou_name')}</InputGroupText>
			<Input bind:value={new_ou_name} />
			<Button color="primary" on:click={onCreateOrModifyOuEntry}>
				{$_('setting.orgchart.btn.ou_create')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={delete_ou_id} />
			<Button color="primary" on:click={onRemoveOuEntry}>
				{$_('setting.orgchart.btn.ou_delete')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>{$_('setting.orgchart.exportxlsx')}</InputGroupText>
			<Button
				size="sm"
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					api
						.postSimple('orgchart/export', {}, $page.data.user.sessionToken)
						.then((res) => {
							return res.blob();
						})
						.then(async (data) => {
							console.log(data);
							if (fileSaver === null) {
								fileSaver = await import('file-saver');
							}
							fileSaver.saveAs(data, `orgchart_${$page.data.user.tenant.name}.xlsx`);
							/*
							//If dont' like file-saver, you can save file like below:
							var a = document.createElement('a');
							a.href = window.URL.createObjectURL(data);
							a.download = 'orgchart.xlsx';
							a.click();
							*/
						});
				}}>
				{$_('setting.orgchart.btn.export')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>{$_('setting.orgchart.importxlsx')}</InputGroupText>
			<input class="form-control" name="file" accept=".xlsx" type="file" bind:files />
			<Button size="sm" on:click={uploadOrgChart} color="primary">
				{$_('setting.orgchart.btn.import')}
			</Button>
		</InputGroup>
		<OrgChartCsvFormat />
		{#if errMsg}
			{errMsg}
		{/if}
	</Container>
</form>
<Container class="mt-5 mb-5">
	<Button on:click={getUserNotStaff}>{$_('setting.orgchart.cleanEmployeesNotInOrgchart')}</Button>
	<Row cols="1" class="mt-1">
		{#each eidsNotStaff as uns, index}
			<Col class="mt-1">
				<Row>
					<Col>
						{uns.nickname}({uns.eid})
					</Col>
					<Col>
						<Button
							on:click={async (e) => {
								await removeEmployee(uns.eid);
							}}>
							{$_('button.delete')}
						</Button>
					</Col>
				</Row>
			</Col>
		{/each}
	</Row>
</Container>
