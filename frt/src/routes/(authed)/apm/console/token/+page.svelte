<script lang="ts">
	export let data: any;
</script>

<section>
	<header>
		<h1>{data.headerTitle}</h1>
	</header>
	<section>
		{data.user.sessionToken}
	</section>
</section>
