<script>
	import { onMount } from 'svelte';

	let time = new Date();
	$: date = time.toDateString();

	onMount(() => {
		const timer = setInterval(() => {
			time = new Date();
		}, 60000);
		return () => clearInterval(timer);
	});
</script>

<div>{date}</div>
