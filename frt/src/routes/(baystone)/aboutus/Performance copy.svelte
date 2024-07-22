<!-- <div
	class="container-fluid"
	style="background: #00253E; padding-top: 79px; padding-bottom: calc(79px + 77px * 2)"> -->
<script>
	function handleDownload() {
		const fileName = '英智介绍PPT.pdf';
		const fileUrl =
			'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/6f0234fa736a2a108743a5ae88b5e363/%E8%8B%B1%E6%99%BA%E6%9C%AA%E6%9D%A5%E4%BB%8B%E7%BB%8DPPT.pdf';

		// 创建一个动态的 <a> 标签
		const link = document.createElement('a');
		link.href = fileUrl;
		link.download = fileName;
		document.body.appendChild(link); // 将链接添加到页面中
		link.click(); // 模拟点击
		document.body.removeChild(link); // 移除链接
	}
</script>

<div class="d-none d-lg-block d-xl-block">
	<div style="position: relative;">
		<div style="position: absolute;left:62%;font-size: 96px;font-weight: bold;color:#12A0FF">
			Aboutus
		</div>
		<div
			class="container"
			style="margin-top: 30px; margin-bottom: 30px;">
			<div style="font-size: 28px;font-weight: bold;display:flex;align-items:center;">
				英智未来
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="ms-4"
					style="cursor: pointer;"
					on:click={handleDownload}>
					<svg
						width="13"
						height="16"
						viewBox="0 0 13 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M5.60149 11.1937C5.8022 11.3944 6.10325 11.4947 6.30395 11.4947C6.605 11.4947 6.8057 11.3944 7.00641 11.1937L10.5004 7.69965C10.9018 7.29825 10.9018 6.69614 10.5004 6.30386C10.099 5.90246 9.49693 5.90246 9.10465 6.30386L7.29834 8.10105V1.00351C7.29834 0.501754 6.89693 0 6.29483 0C5.69272 0 5.29132 0.401404 5.29132 1.00351V8.2014L3.4029 6.29474C3.00149 5.89333 2.39939 5.89333 2.00711 6.29474C1.6057 6.69614 1.6057 7.29825 2.00711 7.69053L5.60149 11.1937Z"
							fill="#12A0FF" />
						<path
							d="M11.9965 13.4922H1.00351C0.401404 13.4922 0 13.8936 0 14.4957C0 15.0978 0.401404 15.4992 1.00351 15.4992H11.9965C12.5986 15.4992 13 15.0978 13 14.4957C12.9909 13.8936 12.5986 13.4922 11.9965 13.4922Z"
							fill="#12A0FF" />
					</svg>
					<span style="font-size:18px;color:#12A0FF;">下载英智介绍PPT</span>
				</div>
			</div>
			<p style="font-size: 16px;margin-top: 1rem;">
				英智致力于通过提供智算算力资源、AI大模型技术及产品，协助客户建设和提升AI时代的新质生产力。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				英智的主要业务包括人工智能智算算力供应，人工智能企业私有大模型代训练、企业智能体软件平台
				开发等。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				英智是英伟达NPN合作伙伴，向客户提供全面的英伟达AI、英伟达OV产品及行业解决方案。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				截止目前，我们已在深圳建设有一套千卡规模人工智能智算集群，该集群采用英伟达市场顶配芯片，
				InfiniBand 400G IB无阻塞胖树组网架构，与上一代的【H800+4IB组网】集群相比，实际计算效率提
				升4倍以上， 全力保障客户创新研发工作的迭代升级速度和效率。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				面向终端客户，我司还提供人工智能私有化大模型训练服务。客户仅须提供自己的数据，我们便能交
				付训练好的专属LLM大模型，智能程度达到ChatGPT3.5以上水平，且具有ChatGPT没有的场景匹配、
				数据实时性以及信息安全保障等特征。我们的企业AI智能体产品，与企业私有化大模型结合，在场景匹配、数据实时性、信息安全有保障的
				前提下， 提供丰富的智能体问答权限管控功能，客户可以按部门、按项目、按角色，自由设置内部员
				工使用AI智能体时的信息访问权限。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				在算力建设方面，我们拥有从服务器供应、到数据中心组网、AI软件系统调测、大模型训练-调优-推
				理平台搭建等全方位的技术服务能力。我们欢迎有需求的行业大客户、IDC数据中心伙伴，与我们洽谈
				合作。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				另外，我们也建设有类Hugging Face的大模型开发服务社区，通过结合算力、算法、数据、供需，来
				服务整个AI大模型生态参与方。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				所有以上业务，我们都通过
				<a
					href="http://www.baystone.ai"
					target="_blank">
					www.baystone.ai
				</a>
				或
				<a
					href="http://www.baystoneai.com"
					target="_blank">
					www.baystoneai.com
				</a>
				  为您服务。
			</p>

			<p style="font-size: 16px;margin-top: 1rem;">非常欢迎关注我们的公众号和视频号</p>
		</div>
		<!-- <div
			style="position: absolute;height: 30%;width: 20%;background-color: #12A0FF;top: 70%;right: 0;">
		</div>
		<div style="position: absolute;height: 30%;width: 20%;top: 3%;right: 12%;">
			<img
				style="height: 800px;width:550px"
				src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/995c1c1541dbb9f1429e0a3d4810fc92/Group%2032.png"
				alt="" />
		</div> -->
		<div class="container d-flex">
			<div>
				<img
					style="height: 115px;width:115px"
					src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/9002249063cb9a36f4725208f8ddf399/%E5%85%AC%E4%BC%97%E5%8F%B7%201.png"
					alt="" />
				<p>英智未来公众号</p>
			</div>
			<div style="margin-left: 74px;">
				<img
					style="height: 115px;width:115px"
					src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/1835a725c0c925e1501a059d9ffec986/%E8%A7%86%E9%A2%91%E5%8F%B7%201.png"
					alt="" />
				<p>英智AI视频号</p>
			</div>
		</div>
	</div>
	<div style="position: relative;">
		<img
			class="col-12"
			style="height:350px;"
			src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/2cdf55f0b1a473cc32c42429bd96ac35/%E6%9C%AA%E6%A0%87%E9%A2%98-13%201.png"
			alt="rtx4090-1" />
	</div>
</div>

<div class="d-block d-lg-none d-xl-none">
	<!-- <div style="position: relative;">
		<div style="position: absolute;top:45%;left:30%;font-size: 40px;font-weight: bold;">
			关于我们
		</div>
		<div style="position: absolute;top:53%;left:30%;font-size: 24px;font-weight: bold;">
			Aboutus
		</div>
		<img
			class="col-12"
			style="height: 300px;"
			src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/8a69229b2d5775cf91fcf69849c8ba28/WX20240409-185808.png"
			alt="rtx4090-1" />
	</div> -->
	<div style="position: relative;">
		<div
			class="container"
			style=" max-width: 1099px; margin-bottom: 47px;">
			<div
				style="font-size: 46px;font-weight: bold;color:#12A0FF;"
				class="d-flex align-items-center justify-content-center">
				Aboutus
			</div>
			<div
				style="font-size: 28px;font-weight: bold;"
				class="d-flex align-items-center justify-content-center">
				英智未来
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="d-flex align-items-center justify-content-center"
				style="cursor: pointer;"
				on:click={handleDownload}>
				<svg
					width="13"
					height="16"
					viewBox="0 0 13 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M5.60149 11.1937C5.8022 11.3944 6.10325 11.4947 6.30395 11.4947C6.605 11.4947 6.8057 11.3944 7.00641 11.1937L10.5004 7.69965C10.9018 7.29825 10.9018 6.69614 10.5004 6.30386C10.099 5.90246 9.49693 5.90246 9.10465 6.30386L7.29834 8.10105V1.00351C7.29834 0.501754 6.89693 0 6.29483 0C5.69272 0 5.29132 0.401404 5.29132 1.00351V8.2014L3.4029 6.29474C3.00149 5.89333 2.39939 5.89333 2.00711 6.29474C1.6057 6.69614 1.6057 7.29825 2.00711 7.69053L5.60149 11.1937Z"
						fill="#12A0FF" />
					<path
						d="M11.9965 13.4922H1.00351C0.401404 13.4922 0 13.8936 0 14.4957C0 15.0978 0.401404 15.4992 1.00351 15.4992H11.9965C12.5986 15.4992 13 15.0978 13 14.4957C12.9909 13.8936 12.5986 13.4922 11.9965 13.4922Z"
						fill="#12A0FF" />
				</svg>
				<span style="font-size:18px;color:#12A0FF;">下载英智介绍PPT</span>
			</div>
			<p style="font-size: 16px;margin-top: 1rem;">
				英智致力于通过提供智算算力资源、AI大模型技术及产品，协助客户建设和提升AI时代的新质生产力。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				英智的主要业务包括人工智能智算算力供应，人工智能企业私有大模型代训练、企业智能体软件平台
				开发等。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				英智是英伟达NPN合作伙伴，向客户提供全面的英伟达AI、英伟达OV产品及行业解决方案。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				截止目前，我们已在深圳建设有一套千卡规模人工智能智算集群，该集群采用英伟达市场顶配芯片，
				InfiniBand 400G IB无阻塞胖树组网架构，与上一代的【H800+4IB组网】集群相比，实际计算效率提
				升4倍以上， 全力保障客户创新研发工作的迭代升级速度和效率。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				面向终端客户，我司还提供人工智能私有化大模型训练服务。客户仅须提供自己的数据，我们便能交
				付训练好的专属LLM大模型，智能程度达到ChatGPT3.5以上水平，且具有ChatGPT没有的场景匹配、
				数据实时性以及信息安全保障等特征。我们的企业AI智能体产品，与企业私有化大模型结合，在场景匹配、数据实时性、信息安全有保障的
				前提下， 提供丰富的智能体问答权限管控功能，客户可以按部门、按项目、按角色，自由设置内部员
				工使用AI智能体时的信息访问权限。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				在算力建设方面，我们拥有从服务器供应、到数据中心组网、AI软件系统调测、大模型训练-调优-推
				理平台搭建等全方位的技术服务能力。我们欢迎有需求的行业大客户、IDC数据中心伙伴，与我们洽谈
				合作。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				另外，我们也建设有类Hugging Face的大模型开发服务社区，通过结合算力、算法、数据、供需，来
				服务整个AI大模型生态参与方。
			</p>
			<p style="font-size: 16px;margin-top: 1rem;">
				所有以上业务，我们都通过
				<a
					href="http://www.baystone.ai"
					target="_blank">
					www.baystone.ai
				</a>
				或
				<a
					href="http://www.baystoneai.com"
					target="_blank">
					www.baystoneai.com
				</a>
				  为您服务。
			</p>

			<p style="font-size: 16px;margin-top: 1rem;">非常欢迎关注我们的公众号和视频号</p>
		</div>
		<div
			class="container d-flex align-items-center justify-content-center"
			style="max-width: 1099px;">
			<div>
				<img
					style="height: 115px;width:115px"
					src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/9002249063cb9a36f4725208f8ddf399/%E5%85%AC%E4%BC%97%E5%8F%B7%201.png"
					alt="" />
				<p>英智未来公众号</p>
			</div>
			<div style="margin-left: 74px;">
				<img
					style="height: 115px;width:115px"
					src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aiblog/1835a725c0c925e1501a059d9ffec986/%E8%A7%86%E9%A2%91%E5%8F%B7%201.png"
					alt="" />
				<p>英智AI视频号</p>
			</div>
		</div>
	</div>
</div>
