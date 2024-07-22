<script lang="ts">
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas';
	import Modal from '$lib/dit/Modal.svelte';
	import { _ } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';

	export let visible: boolean = false;

	const dispatch = createEventDispatcher();

	export let formData = {
		amount: 10,
	};

	let formItems = [
		{
			value: 'amount',
			label: '金额(元)',
			input: 'number',

			min: 0.01,
		},
	];

	let validation = {
		amount: {
			schema: ValidationSchemas.NUMBER.required().min(0.01),
		},
	};

	let formItemComponents = {};
	export function is_valid() {
		let valid = true;

		{
			Object.keys(formItemComponents).forEach((key) => {
				const formItemComponent = formItemComponents[key];

				if (!formItemComponent.is_valid()) {
					valid = false;
				}
			});
		}

		return valid;
	}

	let initialFormData = JSON.stringify(formData);

	async function onCancel() {
		dispatch('cancel', JSON.parse(initialFormData));
		formData = JSON.parse(initialFormData);
	}
</script>

<Modal
	bind:visible
	maskClosable={false}
	on:close={() => {
		onCancel();
	}}>
	<div slot="title">充值</div>
	<div slot="body">
		<form>
			{#if formItems}
				<div class="row row-cols-1">
					{#each formItems as item, index}
						<div class="col">
							<div class="form-floating mb-3">
								<FormItem
									bind:this={formItemComponents[index]}
									{item}
									bind:value={formData[item.value]}
									validation={validation[item.value]}></FormItem>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</form>
	</div>
	<div
		slot="footer"
		class="w-100 text-center">
		<button
			type="button"
			class="btn btn-primary"
			on:click={() => {
				onCancel();

				visible = false;
			}}>
			{$_('取消')}
		</button>
		<button
			type="button"
			class="btn btn-danger"
			on:click={() => {
				let valid = true;

				{
					for (const key in formItemComponents) {
						if (!formItemComponents[key].is_valid()) {
							valid = false;
						}
					}
				}

				// console.log('formData', formData);

				if (valid === false) {
					return;
				}

				dispatch('confirm', formData);

				// visible = false;
			}}>
			{$_('确认')}
		</button>
	</div>
</Modal>
