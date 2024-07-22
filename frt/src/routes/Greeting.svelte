<script lang="ts">
	import { _ } from '$lib/i18n';
	let greetingOnTime = '';
	$: {
		const currentHour = new Date().getHours();
		if (currentHour < 12) {
			greetingOnTime = $_('baystone.homepage.roll_card.greeting.time.morning');
		} else if (currentHour < 14) {
			greetingOnTime = $_('baystone.homepage.roll_card.greeting.time.midday');
		} else if (currentHour < 18) {
			greetingOnTime = $_('baystone.homepage.roll_card.greeting.time.afternoon');
		} else {
			greetingOnTime = $_('baystone.homepage.roll_card.greeting.time.evening');
		}
	}
</script>

<div class="row mt-3">
	<div class="fs-3 fw-3 text-center">
		{greetingOnTime}{$_('baystone.homepage.roll_card.greeting.message')}
	</div>
</div>
