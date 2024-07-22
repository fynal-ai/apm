<script lang="ts">
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import AppSelect from '$lib/cognihub/AppSelect.svelte';
	import BuyMemo from '$lib/cognihub/BuyMemo.svelte';
	import BuyOrderDetail from '$lib/cognihub/BuyOrderDetail.svelte';
	import BuyPriceCompute from '$lib/cognihub/BuyPriceCompute.svelte';
	import PackageSelect from '$lib/cognihub/PackageSelect.svelte';
	import { handlePostResponse } from '$lib/dit';

	export let url;
	export let user;
	export let searchParams = {
		appID: '',
		packageID: '',
		serviceID: '',
	};
	export let formData: any = {
		name: '',
		app: {},
		package: {},
	};

	let appSelectComponent;
	let buyOrderDetailComponent;
	let memoComponent;

	let orderDetailFormData: any = [];
	let priceComputeFormData = {
		totalPrice: 0,
		discountAmount: 0,
		amountPayable: 0,
	};
	let memoFormData = {
		memo: '',
		agreement: false,
	};

	async function submit() {
		let valid = true;

		const postData = {
			...formData,

			name: formData.name || formData.package?.name,

			orderDetailFormData,
			priceComputeFormData,
			memoFormData,
		};

		// console.log(postData);

		{
			if (appSelectComponent.is_valid() === false) {
				valid = false;
			}
			if (buyOrderDetailComponent.is_valid() === false) {
				valid = false;
			}
			if (memoComponent.is_valid() === false) {
				valid = false;
			}
		}

		if (valid === false) {
			return;
		}

		{
			const response = await api.post(
				'/cognihub/sale/buy/package/place',
				postData,
				user?.sessionToken
			);

			await handlePostResponse(response, '下单成功');

			if (response._id) {
				await goto(`/cognihub/sale/payway?tradeID=${response._id}`);
			}
		}
	}
</script>

<section>
	<header>
		<h1>购买 {formData.name || formData.package?.name || ''}</h1>
		<p>为你的应用购买LLM推理API服务资源， 当前支持的价格为0元， 先购先得</p>
	</header>

	<section>
		<section>
			<header>
				<h2>选择应用</h2>
			</header>
			<section>
				<p>你需要选择一个应用，将API服务资源与该应用关联</p>
				<AppSelect
					bind:this={appSelectComponent}
					{url}
					{user}
					bind:value={formData.app}
					appID={searchParams['appID']}>
				</AppSelect>
			</section>
		</section>

		{#if formData?.app?._id}
			<section>
				<header>
					<h2>选择套餐</h2>
				</header>
				<section>
					<PackageSelect
						{url}
						{user}
						bind:value={formData.package}
						packageID={searchParams['packageID']}
						serviceID={searchParams['serviceID']}>
					</PackageSelect>
				</section>
			</section>
		{/if}

		{#if formData?.package?._id}
			<section>
				<header>
					<h2>订单详情</h2>
				</header>
				<section>
					<BuyOrderDetail
						bind:this={buyOrderDetailComponent}
						data={[{ app: formData.app, package: formData.package }]}
						bind:formData={orderDetailFormData}>
					</BuyOrderDetail>
				</section>
			</section>
		{/if}

		<!-- 价格计算 -->
		{#if formData?.package?._id}
			<section>
				<BuyPriceCompute
					data={orderDetailFormData}
					bind:formData={priceComputeFormData}></BuyPriceCompute>
			</section>
		{/if}

		<!-- 订单备注 -->
		{#if formData?.package?._id}
			<section>
				<BuyMemo
					bind:this={memoComponent}
					bind:formData={memoFormData}>
				</BuyMemo>
			</section>
		{/if}

		{#if formData?.package?._id}
			<section>
				<div class="d-flex justify-content-end gap-2 flex-wrap">
					<button
						class="btn btn-danger"
						on:click={submit}>
						确认下单
					</button>
				</div>
			</section>
		{/if}
	</section>
</section>
