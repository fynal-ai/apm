<script lang="ts">
	// 列表数据加载中的状态展示
	// - 加载中
	// - 展示错误
	// - 暂无数据

	export let loading: boolean = false;

	export let list: any = [];
</script>

{#if loading}
	<div class="text-center">
		<span
			class="spinner-border"
			role="status">
		</span>
	</div>
{:else if list && Array.isArray(list) && list.length > 0}
	<slot />
{:else}
	<div class="text-center text-muted">
		<i class="bi bi-emoji-frown"></i>
		<span>{list.error ? list.error : '暂无数据'}</span>
	</div>
{/if}
