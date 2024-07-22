<script lang="ts">
	import { APP_NAME } from '$lib/cognihub';

	export let user;
</script>

<section class="position-relative m-0">
	<div class="">
		<div>
			<img
				style="object-fit: cover; width: 100vw; height: calc(100vh - 60px);"
				src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/9b5ed39a1ef63da312cf1b6711e27613/Rectangle%20458.png"
				alt="" />
		</div>
		<!-- md -->
		<div
			class="position-absolute px-4"
			style="
            left: 20%;
            top: 50%;
            transform: translate(-20%, -50%);
			width: 100%;
			max-width: 648px;
            ">
			<h1
				class="mb-4 fs-1"
				style="color: #12A0FF;">
				<div class="typed-out">
					我是{APP_NAME}
				</div>
			</h1>
			<div
				class="mb-2 fs-4"
				style="color:#5C5C5C ;">
				Agent Package Manager
			</div>

			<div class="d-flex gap-2 flex-wrap align-items-end">
				<div class="d-flex gap-2 flex-wrap">
					<a
						class="btn border rounded border-primary text-primary fs-4 px-4"
						href={'/apm/console/dashboard'}>
						进入控制台
					</a>
				</div>

				<div class="d-flex gap-2 flex-wrap">
					<a
						href="/apm/console/token"
						class="text-decoration-none">
						查看TOKEN
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
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
			border-color: inherit;
		}
	}
	.typed-out {
		overflow: hidden;

		border-right: 0.1em solid;
		white-space: nowrap;
		width: 0;
		max-width: fit-content;
		animation:
			typing 2.4s forwards,
			blink 0.8s infinite;
	}
</style>
