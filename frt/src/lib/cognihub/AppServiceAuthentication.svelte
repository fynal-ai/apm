<script lang="ts">
	import TaskProperty from '$lib/airender/TaskProperty.svelte';
	import type { TaskListItems, TaskListLayout } from '$lib/airender/types';

	let layout: TaskListLayout = 'cognihub.app.service';

	export let formData = {
		_id: '',
		secret: '',
	};

	let formItems: TaskListItems = [
		{
			value: 'secret',
			label: 'API_KEY',

			showCopy: true,
		},
	];
</script>

{#each formItems as item}
	<div
		class="text-sm text-secondary"
		style="word-break: break-all;">
		<span>{item.label}</span>
		<span>:</span>
		<span>
			<TaskProperty
				task={formData}
				formItem={item}
				layout={item.layout || layout}>
			</TaskProperty>
		</span>
	</div>
{/each}
