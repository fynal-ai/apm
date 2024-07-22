<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let isDarkMode = false;

	let media: any;

	function changeDarkMode(event) {
		if (event.matches) {
			isDarkMode = true;
		} else {
			isDarkMode = false;
		}
	}

	onMount(() => {
		media = window.matchMedia('(prefers-color-scheme: dark)');

		isDarkMode = media.matches;

		if (media.addEventListener) {
			media.addEventListener('change', changeDarkMode);
		}
		if (media.addListener) {
			media.addListener(changeDarkMode);
		}
	});
	onDestroy(() => {
		if (media) {
			if (media.removeEventListener) {
				media.removeEventListener('change', changeDarkMode);
			}
			if (media.removeListener) {
				media.removeListener(changeDarkMode);
			}
		}
	});
</script>

<div class="row row-cols-1 row-cols-md-2">
	<div class="col">
		<div class="banner">
			<video
				class="w-100"
				class:dark={isDarkMode}
				autoplay
				loop
				muted
				src={isDarkMode
					? 'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/mov/cubic1_dark.mp4'
					: 'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/mov/cubic1.mp4'}>
			</video>
		</div>
	</div>
	<div class="col py-2">
		<div class="card border-0">
			<div class="card-body">
				<h5 class="card-title">Baystone 人工智能公共服务平台</h5>
				<div class="card-text">
					<div class="fs-5">算力·算法·数据·模型·应用·生态·一站式赋能·一体化协同</div>
					<div class="mt-3">
						<ul>
							<li>充裕的先进智算算力，按需使用</li>
							<li>开放的大模型算法库，便捷调用</li>
							<li>多源的行业训练数据，即时获取</li>
							<li>丰富的行业场景应用，即开即用</li>
							<li>活跃的科技创新生态，合作共赢</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.banner video {
		height: 300px;

		mix-blend-mode: multiply;
	}

	.banner video.dark {
		mix-blend-mode: screen;
	}

	.card {
		background-color: rgba(240, 248, 255, 0);
	}
</style>
