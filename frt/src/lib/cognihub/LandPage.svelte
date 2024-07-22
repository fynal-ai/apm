<script lang="ts">
	import { APP_NAME, isAdmin } from '$lib/cognihub';
	import type { LandPageLayoutType } from '$lib/cognihub/types';
	import Buy from './Buy.svelte';

	export let user;
	export let purchaseNowURL = '/cognihub/sale/buy';
	export let freeTrialURL = '/cognihub/sale/buy';
	export let buyURL;

	let layout: LandPageLayoutType = isAdmin(user) ? 'admin' : 'user';
</script>

<section class="position-relative m-0">
	<div class="">
		<div>
			<img
				style="object-fit: cover; width: 100vw; height: calc(100vh - 60px);"
				src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/327df4c82dd735811ef15ee28a16fb14/Rectangle%20458%20%283%29.png"
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
				向开发者提供大模型推理API
			</div>
			<div
				class="fs-6"
				style="color:#5C5C5C ;">
				注册开发者账号后，即可获得APPKEY
			</div>
			<div
				class="fs-6"
				style="color:#5C5C5C ;">
				可以切换市面上所有主流大语言模型
			</div>
			<div
				class="mb-5 fs-6"
				style="color:#5C5C5C ;">
				兼容OpenAI API
			</div>
			<div class="d-flex gap-2 flex-wrap align-items-end">
				<div class="d-flex gap-2 flex-wrap">
					{#if layout === 'user'}
						{#if purchaseNowURL}
							<a
								class="btn btn-primary fs-4 px-4"
								href={purchaseNowURL}>
								立即购买
							</a>
						{/if}

						{#if freeTrialURL}
							<a
								href={freeTrialURL}
								class="btn btn-primary fs-4 px-4">
								当前免费使用
							</a>
						{/if}
					{/if}
					<a
						class="btn border rounded border-primary text-primary fs-4 px-4"
						href={layout === 'user'
							? '/cognihub/console/dashboard'
							: '/ai2nv/cognihub/console/dashboard'}>
						控制台
					</a>
				</div>
				<div class="d-flex gap-2 flex-wrap">
					{#if layout === 'user'}
						<!-- <a href="/cognihub/pricing">产品价格</a> -->
						<!-- <a href="/cognihub/doc">帮助文档</a> -->
						<a
							href="/cognihub/sale/contact"
							class="text-decoration-none">
							联系我们
						</a>
						<a
							href="/cognihub/pricing"
							class="text-decoration-none">
							更多价格
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

{#if layout === 'user'}
	<section class="container">
		<Buy
			url={new URL(buyURL)}
			{user} />
	</section>
{/if}

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
