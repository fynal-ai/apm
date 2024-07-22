<script lang="ts">
	import { marked } from 'marked';

	export let background: any = {
		odd: '',
		even: '',
	};
	export let banner = {
		title: 'Bonsai AI助手',
		description: `高效的信息处理能力，跨领域的<br/>知识查询 企业级内部知识库、组织构建`,
		image:
			'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/9b5ed39a1ef63da312cf1b6711e27613/Rectangle%20458.png',
		button: {
			text: '立即体验',
			href: 'https://bonsai.baystoneai.com',
		},
	};
	export let functions = [
		{
			title: '智能解答，深度学习',
			description: `Bonsai 是一款智能聊天工具，能够理解并回应用户的查询和指令。能解答 各种不同问题，提供准确的个性化帮助。简洁友好的 界面设计，使得操作简单易上手。`,
			image:
				'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/914b63bdd47f7d22fdec4fe8b5b0f9b7/Group%2033.png',
		},
		{
			title: '支持私有化部署',
			description: `智能高效地协助处理信息查询、数据分析等任务，确保数据安全，大大提升工作效率。`,
			image:
				'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/976c80cbd09fcd2303e976009471d2bc/b5167a4c678c9f7f778243afdff50bb3fac6eb9a74c0e-5DdPSI_fw1200%201.png',
		},
		{
			title: '支持私有数据',
			description: `支持私有数据设计，保障信息安全，智能处理数据分析、信息检索等任务，提高决策效率，保护企业资产。`,
			image:
				'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/abdd63c7e233b5101f6c5c9c1d40922d/6cc0bcce7da1a00dc6dc380fc17a243976e3f8fb1e0008-d2jye8_fw1200%201%20%281%29.png',
		},
		{
			title: '支持大模型切换',
			description: `灵活适应不同任务需求，提升处理能力和效率，确保高质量的输出，满足多样化的应用场景。`,
			image:
				'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/e26a67a0103f39ae73ff729c35232b57/246facf7456037393bb74da2fb022173dfc08880322c1-yDVbK5_fw1200%201.png',
		},
		{
			title: '支持跨部门数据隔离',
			description: `具备跨部门数据隔离能力，确保部门间信息安全独立，有效管理敏感数据，支撑合规性需求，促进企业内部数据保护与合作。`,
			image:
				'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/42dbf0cef8b6f2789b52da41aadf8446/8864c749bbc8d0c316700af9acce9a54ae3c50cf17781-dwOfTo_fw1200%201.png',
		},
	];
</script>

<section class="position-relative mb-5 mt-0">
	<div class="d-none d-lg-block d-xl-block">
		<div>
			<img
				class="w-100"
				style="height: 600px; object-fit: cover;"
				src={banner.image}
				alt="" />
		</div>

		<div
			class="position-absolute"
			style="
            left: 30%;
            top: 50%;
            transform: translate(0, -50%);
            ">
			<h1
				class="mb-4 fs-2"
				style="color: #12A0FF;">
				{banner.title}
			</h1>
			<div
				class="mb-5 fs-4"
				style="color:#5C5C5C ;">
				{@html marked(banner.description)}
			</div>
			<div>
				<a
					class="btn btn-primary fs-4 px-4"
					href={banner.button.href}>
					{banner.button.text}
				</a>
			</div>
		</div>
	</div>
	<div class="d-block d-lg-none d-xl-none">
		<div>
			<img
				class="w-100"
				style="height: 18vh;object-fit: cover;"
				src={banner.image}
				alt="" />
		</div>

		<div
			class="position-absolute"
			style="
            left: 10%;
            top: 50%;
            transform: translate(0, -50%);
            ">
			<h1
				class="fs-2"
				style="color: #12A0FF;">
				{banner.title}
			</h1>
			<div
				class="mb-2"
				style="color:#5C5C5C ;">
				{@html marked(banner.description)}
			</div>
			<div>
				<a
					class="btn btn-primary fs-4 px-4"
					href={banner.button.href}>
					{banner.button.text}
				</a>
			</div>
		</div>
	</div>
	<!-- 产品： 1. 加速渲染 优势： 1. 随时随地进行 -->
</section>

<!-- <section class="mb-5">
	<header class="text-center fs-2">产品优势</header>
</section> -->

<section class="mb-5">
	<div
		class="container-fluid"
		style="max-width: 1099px;">
		<!-- lg,xl -->
		<div class="d-none d-lg-block d-xl-block">
			{#each functions as item, index}
				<!-- 偶数 左图右文，奇数 左文右图 -->
				<div
					class="row justify-content-between align-items-center py-5"
					style="margin-top: {index % 2 !== 0 ? '25%' : '0'};margin-bottom: {index % 2 !== 0
						? '25%'
						: '0'};">
					{#if index % 2 === 0}
						<div
							class="col col-auto text-start"
							style="max-width: 50%;">
							<img
								src={item.image}
								style="max-height: 455px; min-height: 272px; width: 100%; object-fit: cover;"
								alt="" />
						</div>
						<div
							class="col col-auto text-left ps-4"
							style="max-width: 50%;">
							<div class="title">{item.title}</div>
							<div class="description">{@html item.description}</div>
						</div>
					{/if}

					{#if index % 2 !== 0}
						<section
							class="position-absolute mb-5 mt-0"
							style="width: 100vw;left:0px;padding:0px;height: 560px;"
							style:background={background.even}>
							<!-- <div style="width: 100vw;"> -->
							<div
								class="text-end ps-4"
								style="max-width: 33%;position: absolute;top: 40%;left: 17%;">
								<div class="title">{item.title}</div>
								<div class="description">{@html item.description}</div>
							</div>
							<div
								class="col col-auto text-start"
								style="max-width: 50%;position: absolute;left: 52%;top:8%">
								<img
									src={item.image}
									style="max-height: 455px; min-height: 272px; width: 100%; object-fit: cover;"
									alt="" />
							</div>
							<!-- </div> -->
						</section>
					{/if}
				</div>
			{/each}
		</div>

		<!-- xs,sm -->
		<div class="d-block d-lg-none d-xl-none">
			{#each functions as item, index}
				<!-- 上图下文 -->
				<div class="row text-center gap-4 py-4">
					<div class="col col-12">
						<img
							src={item.image}
							style="max-height: 455px; min-height: 272px; width: 100%; object-fit: cover;"
							alt="" />
					</div>
					<div class="col col-12">
						<div class="title">{item.title}</div>
						<div class="description">{@html item.description}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- <section>
	<div class="text-center">
		<a
			class="btn btn-primary fs-4 px-4"
			href={'/airender'}>
			立即体验
		</a>
	</div>
</section> -->

<style>
	.title {
		font-size: 32px;

		font-weight: bold;
		line-height: 24px;
		color: #12a0ff;

		margin-bottom: 17px;
	}
	.subtitle {
		font-size: 24px;
		font-weight: 500;
		line-height: 32px;
		color: #000000;

		margin-bottom: 25px;
	}
	.description {
		font-size: 18px;
		font-weight: normal;
		line-height: 24px;
		letter-spacing: 0em;
		color: #595c5f;
	}
</style>
