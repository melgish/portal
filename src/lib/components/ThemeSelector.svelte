<script lang="ts">
	import { theme } from '$lib/stores';
</script>

<select bind:value={$theme}>
	<option value="red">Red</option>
	<option value="blue">Blue</option>
	<option value="purple">Purple</option>
	<option value="green">Green</option>
</select>
