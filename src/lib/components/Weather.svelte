<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { city } from '$lib/stores';

	let data = null;

	onMount(async () => {
		const getWeather = async () => {
			const rs = await fetch(`${base}/api/weather/${$city}`);
			return await rs.json();
		};

		data = await getWeather();
		const timer = setInterval(async () => {
			data = await getWeather();
		}, 3600000);

		return () => clearInterval(timer);
	});
</script>

<div>
	{#if data}
		<span>{data.name}:</span>
		<span>{Number(data.temp).toFixed(0)}&deg;F</span>
		<span>{data.text}</span>
	{/if}
</div>
