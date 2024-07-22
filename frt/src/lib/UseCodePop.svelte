<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { use_code_pop,componentProps } from '$lib/Stores.js';
	// 创建一个事件调度器
	const dispatch = createEventDispatcher();

	// 关闭弹窗的函数
	function closeModal() {
		$use_code_pop.visible = false;
		dispatch('close', false);
	}
</script>

{#if $use_code_pop.visible}
	<!-- 使用Svelte的条件渲染显示弹窗 -->
	<div class="modal">
		<div
			class="modal-content"
			on:click|stopPropagation>
			<span
				class="close"
				on:click={closeModal}>
				&times;
			</span>
			{#if $use_code_pop.element}
				<!-- 如果有传入的组件，则渲染传入的组件 -->
				<svelte:component this={$use_code_pop.element} {...$componentProps}/>
			{/if}
		</div>
	</div>
{/if}

<style scope>
	.modal {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		z-index: 3000;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.modal-content {
		background-color: #fefefe;
		margin: auto;
		padding: 20px;
		border: 1px solid #888;
		width: 50%; /* 根据需要调整宽度 */
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
		position: relative;
	}

	.close {
		color: #aaa;
		position: absolute;
		top: 10px;
		right: 20px;
		font-size: 24px;
		font-weight: bold;
	}

	.close:hover {
		color: black;
		cursor: pointer;
	}
</style>
