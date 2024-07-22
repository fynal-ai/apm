<script lang="ts">
	import type { TaskListLayout } from './types';

	export let name;

	export let layout: TaskListLayout = 'airender';

	export let task: any = {};
</script>

{#if ['airender', 'aiops'].includes(layout)}
	<div class="d-inline-flex gap-2 align-items-center">
		<span class="fs-2">
			<i
				class={['bi', task.isDirectory ? 'bi-folder-fill text-primary' : 'bi-file-earmark  '].join(
					' '
				)}>
			</i>
		</span>
		<span>{name}</span>
	</div>
{:else if ['cognihub.user', 'cognihub.app', 'cognihub.service', 'cognihub.package'].includes(layout)}
	<div class="d-inline-flex align-items-center gap-2 flex-wrap">
		<!-- 首个字符加大、阴影 -->
		<div
			class="fs-4 border rounded p-1 text-center text-bg-light shadow-sm d-none d-md-block"
			style="width: 48px;">
			{name.charAt(0).toUpperCase()}
		</div>
		<span>{name}</span>
	</div>
{:else}
	<span>{name}</span>
{/if}
