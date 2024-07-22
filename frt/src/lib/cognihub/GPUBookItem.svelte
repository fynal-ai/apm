<div
	class="border border-2 shadow p-2 rounded rounded-4 position-relative item h-100"
	on:click={async () => {
		window.open('https://gpubook.ai/airesources');
	}}
	on:keydown={() => {}}>
	<div
		class="d-flex justify-content-end"
		style="font-size: 0.8em;">
		<div class="text-secondary">
			<i class="bi bi-box-arrow-up-right"></i>
		</div>
	</div>
	<div class="text-center">
		<div class="fs-4 py-3">GPU Book</div>

		<div style="border-top: 1px dashed grey"></div>
		<div class="py-2">
			<div class="typed-out">高配GPU算力 现在开通 马上拥有</div>
		</div>
		<div style="border-top: 1px dashed grey"></div>
		<div
			class="d-flex justify-content-center py-2"
			style="font-size: 0.8em;">
			<a
				href="https://gpubook.ai/airesources"
				target="_blank">
				查看详情
			</a>
		</div>
	</div>
</div>

<style>
	.item:hover {
		--bs-border-opacity: 1;
		border-color: rgba(var(--bs-primary-rgb), var(--bs-border-opacity)) !important;
	}

	@keyframes typing {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}
	@keyframes blink {
		from {
			border-color: transparent;
		}
		to {
			border-color: orange;
		}
	}
	.typed-out {
		overflow: hidden;
		border-right: 0.1em solid orange;
		white-space: nowrap;
		width: 0;
		animation:
			typing 2s forwards,
			blink 0.8s infinite;
	}
</style>
