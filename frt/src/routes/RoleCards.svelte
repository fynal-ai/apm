<script lang="ts">
	import { _ } from '$lib/i18n';
	import Statistics from './Statistics.svelte';

	let roleIndex = -1;
	let roles = [
		{
			title: 'baystone.homepage.roll_card.supply_demand_computing_equipment.title',
			subtitle: 'baystone.homepage.roll_card.supply_demand_computing_equipment.subtitle',
			needs: [
				{
					text: 'baystone.homepage.roll_card.supply_demand_computing_equipment.needs.renting_computing',
					url: '/proxy/rent_resource',
				},
				{
					text: 'baystone.homepage.roll_card.supply_demand_computing_equipment.needs.supply_computing',
					url: '/proxy/provide_resource',
				},
				{
					text: 'baystone.homepage.roll_card.supply_demand_computing_equipment.needs.sell_cards_servers',
					url: '/proxy/sale_resource',
				},
				{
					text: 'baystone.homepage.roll_card.supply_demand_computing_equipment.needs.purchasing_cards_servers',
					url: '/proxy/buy_resource',
				},
			],
			img: 'https://picsum.photos/200/300',
			url: 'abcd',
		},
		{
			title: 'baystone.homepage.roll_card.developer.title',
			subtitle: 'baystone.homepage.roll_card.developer.subtitle',
			needs: [
				{
					text: 'baystone.homepage.roll_card.developer.needs.models',
					url: '/aimodel',
				},
				{
					text: 'baystone.homepage.roll_card.developer.needs.apps',
					url: '/admin/aiapp/create',
				},
				{
					text: 'baystone.homepage.roll_card.developer.needs.datasets',
					url: '/datasets',
				},
				{
					text: 'baystone.homepage.roll_card.developer.needs.gpus',
					url: '/proxy/rent_resource',
				},
			],
			img: 'https://picsum.photos/200/300',
			url: 'abcd',
		},
		{
			title: 'baystone.homepage.roll_card.app_demand_side.title',
			subtitle: 'baystone.homepage.roll_card.app_demand_side.subtitle',
			needs: [
				{
					text: 'baystone.homepage.roll_card.app_demand_side.needs.ai_industry_solutions',
					url: '/aiscenario',
				},
				{
					text: 'baystone.homepage.roll_card.app_demand_side.needs.scenario_apps',
					url: '/aiscenario',
				},
				{
					text: 'baystone.homepage.roll_card.app_demand_side.needs.omniverse_software',
					url: '/ov',
				},
				{
					text: 'baystone.homepage.roll_card.app_demand_side.needs.ai_software_training_courses',
					url: '/training',
				},
			],
			img: 'https://picsum.photos/200/300',
			url: 'abcd',
		},
		{
			title: 'baystone.homepage.roll_card.industry_data_practitioners.title',
			subtitle: 'baystone.homepage.roll_card.industry_data_practitioners.subtitle',
			needs: [
				{
					text: 'baystone.homepage.roll_card.industry_data_practitioners.needs.provide_industry_data',
					url: '/admin/datasets',
				},
				{
					text: 'baystone.homepage.roll_card.industry_data_practitioners.needs.look_for_industry_data',
					url: '/datasets',
				},
			],
			img: 'https://picsum.photos/200/300',
			url: 'abcd',
		},
	];
</script>

<div class="rolecards_container p-5">
	<div class="mb-3">
		<Statistics />
	</div>
	<div class="py-4 rolecards_airesource">
		<div class="d-flex gap-2 flex-wrap justify-content-center">
			<a
				class="btn btn-airesource"
				href={'/airesource'}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					fill="none"
					version="1.1"
					width="14.960000038146973"
					height="16"
					viewBox="0 0 14.960000038146973 16">
					<g>
						<path
							d="M4.76837e-7,10.4L14.9333,10.4L14.9333,5.86667L0,5.86667L4.76837e-7,10.4ZM11.84,7.46667C12.2133,7.46667,12.5067,7.76,12.5333,8.10667C12.5333,8.48,12.24,8.77333,11.8933,8.8C11.5467,8.82667,11.2267,8.50667,11.2,8.16C11.2,7.78667,11.4933,7.46667,11.84,7.46667ZM9.70667,7.46667C9.97333,7.46667,10.2133,7.62667,10.32,7.86667C10.4267,8.10667,10.3733,8.4,10.1867,8.58667C10,8.77333,9.70667,8.82667,9.46667,8.74667C9.22667,8.64,9.04,8.4,9.04,8.13333C9.06667,7.76,9.36,7.46667,9.70667,7.46667ZM2.13333,7.46667L5.86667,7.46667L5.86667,8.8L2.13333,8.8L2.13333,7.46667ZM13.8133,0L1.14667,0C0.533333,0,0.0266665,0.506667,0.0266665,1.12L0.0266665,4.53333L14.96,4.53333L14.96,1.12C14.9333,0.506667,14.4267,-1.19209e-7,13.8133,0ZM5.86667,2.93333L2.13333,2.93333L2.13333,1.6L5.86667,1.6L5.86667,2.93333ZM9.76,2.93333C9.52,2.93333,9.28,2.82667,9.14667,2.61333C9.01333,2.4,9.01333,2.16,9.12,1.94667C9.22667,1.73333,9.46667,1.6,9.70667,1.6C10.0533,1.6,10.3467,1.89333,10.3733,2.24C10.4,2.61333,10.1333,2.90667,9.76,2.93333ZM11.8933,2.93333C11.52,2.93333,11.2267,2.64,11.2,2.29333C11.2,1.92,11.4933,1.62667,11.84,1.6C12.2133,1.6,12.5067,1.89333,12.5333,2.24C12.5333,2.61333,12.24,2.93333,11.8933,2.93333ZM1.12,11.4667L4.76837e-7,11.4667L4.76837e-7,15.2C4.76837e-7,15.6533,0.346667,16,0.8,16L14.1333,16C14.56,16,14.9333,15.6533,14.9333,15.2L14.9333,11.4667L1.12,11.4667ZM5.86667,14.4L2.13333,14.4L2.13333,13.0667L5.86667,13.0667L5.86667,14.4ZM9.73333,14.4C9.36,14.4,9.06667,14.1067,9.06667,13.7333C9.06667,13.36,9.36,13.0667,9.73333,13.0667C10.1067,13.0667,10.4,13.36,10.4,13.7333C10.4,14.1067,10.1067,14.4,9.73333,14.4ZM11.8667,14.4C11.4933,14.4,11.2,14.1067,11.2,13.7333C11.2,13.36,11.4933,13.0667,11.8667,13.0667C12.24,13.0667,12.5333,13.36,12.5333,13.7333C12.5333,14.1067,12.24,14.4,11.8667,14.4Z"
							fill="#FFFFFF"
							fill-opacity="1" />
					</g>
				</svg>
				{$_('baystone.homepage.roll_card.airesource')}
			</a>
		</div>
	</div>
	<div class="row card-row">
		{#each roles as role, index}
			<div class="col col-12 col-md-6 col-lg-3 card-col text-center">
				<div
					class="card w-100 bg-transparent text-light border-light"
					class:shadow={roleIndex === index}
					on:mouseenter={() => {
						roleIndex = index;
					}}
					on:mouseleave={() => {
						roleIndex = -1;
					}}>
					<div class="card-body d-flex flex-column">
						<h5
							class="card-title pb-2"
							class:border-danger={roleIndex === index}>
							{$_(role.title)}
						</h5>
						{#each role.needs as need}
							<div class="card-text mb-2">
								<a
									href={need.url}
									class="kfk-link kfk-light">
									{$_(need.text)}
								</a>
							</div>
						{/each}
						<!-- <div class="position-absolute bottom-0 mb-2"> -->
						<!-- 	<a -->
						<!-- 		href={role.url} -->
						<!-- 		class="btn btn-primary"> -->
						<!-- 		Go somewh -->
						<!-- 	</a> -->
						<!-- </div> -->
					</div>
				</div>
			</div>
		{/each}
	</div>
	<video
		autoplay
		loop
		muted>
		<source
			src="https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/mov/rolecard.mp4"
			type="video/mp4" />
		<!-- 您可以添加更多的视频格式以确保兼容性 -->
	</video>
</div>

<style>
	.card-row {
		display: flex;
		flex-wrap: wrap;
	}
	.card-col {
		display: flex;
		padding: 0.5rem;
	}

	.card-title {
		display: inline-block;
	}
	.rolecards_container {
		position: relative;
		z-index: 100;
		overflow: hidden;
		background-color: darkslategrey;
	}
	.rolecards_container video {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		z-index: -100;
		object-fit: cover;
		object-position: left 50% top 16%;
	}
	.rolecards_container::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3); /* Adjust the alpha value for darkness */
		pointer-events: none; /* Allows interaction with the video */
		z-index: -99;
	}

	.rolecards_airesource {
		position: relative;
		left: 50%;
		width: calc(100vw - 16px);
		transform: translate(-50%, 0);
	}

	.btn-airesource {
		--bs-btn-border-color: #0d6dfd00;
		--bs-btn-hover-color: #fff;
		--bs-btn-hover-border-color: #0d6dfd00;
		--bs-btn-focus-shadow-rgb: 49, 132, 253;
		--bs-btn-active-color: #ffffff;
		--bs-btn-active-border-color: #0d6dfd00;
		--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
		--bs-btn-color: #fff;
		--bs-btn-bg: rgb(18, 160, 255);
		--bs-btn-hover-bg: rgb(18, 160, 255, 0.8);
		--bs-btn-active-bg: rgb(18, 160, 255);
		--bs-btn-padding-y: 8px;
		--bs-btn-padding-x: 20px;
		--bs-btn-font-size: 20px;
		--bs-btn-border-radius: 5px;
	}
</style>
