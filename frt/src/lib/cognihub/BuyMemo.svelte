<script lang="ts">
	import FormItem from '$lib/aireq/FormItem.svelte';
	import * as ValidationSchemas from '$lib/aireq/ValidationSchemas.js';
	import type { ValidationObject } from '$lib/Joi';

	export let formData = {
		memo: '',
		agreement: false,
	};

	let formItems = [
		{
			value: 'memo',
			label: '订单备注',

			input: 'text',
		},
		{
			value: 'agreement',
			label: `<span>下单前请仔细阅读<a href="/cognihub/agreement/serve" target="_blank" class="text-decoration-none">服务协议</a> ，勾选即表示同意该协议。</span>`,

			input: 'agreement',
		},
	];

	let validation: ValidationObject = {
		agreement: {
			schema: ValidationSchemas.CHECKBOX.required(),
		},
	};

	let formItemComponents = {};

	export function is_valid() {
		let valid = true;

		{
			Object.keys(formItemComponents).forEach((key) => {
				const component = formItemComponents[key];

				if (component && !component.is_valid()) {
					valid = false;
				}
			});
		}

		return valid;
	}
</script>

<section>
	<div>
		<table>
			<thead>
				<tr>
					<th style="min-width: 80px;"></th>
					<th style="min-width: 64px;"></th>
				</tr>
			</thead>
			<tbody>
				{#each formItems as item}
					<tr>
						<td class="p-1">
							{#if item.value === 'agreement'}
								{''}
							{:else}
								{item.label}:
							{/if}
						</td>
						<td class="p-1">
							<FormItem
								bind:this={formItemComponents[item.value]}
								{item}
								bind:value={formData[item.value]}
								validation={validation[item.value]}
								showLabel={false}>
							</FormItem>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
