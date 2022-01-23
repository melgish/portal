<script lang="ts">
	import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
	import Icon from 'fa-svelte';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';

	import Calendar from '$lib/components/Calendar.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import Configure from '$lib/components/Configure.svelte';
	import '$lib/app.scss';
	import { theme } from '$lib/stores';
import User from '$lib/components/User.svelte';

	let showConfig = false;

	const signOut = async () => {
		session.set({});
		await fetch('api/auth/signOut', { method: 'DELETE' });
		await goto('/signIn');
	};
</script>

<svelte:head>
	<link rel="stylesheet" href={`theme/${$theme}.css`} />
</svelte:head>

<div class="bar">
	{#if $session.authenticated}
		<div on:click={() => (showConfig = true)} class="icon" title="Configure">
			<Icon icon={faCog} />
		</div>
		<Weather />
	{/if}
	<div class="grow" />
	<Calendar />
	{#if $session.authenticated}
		<div on:click={signOut} class="icon" title="Logout">
			<Icon icon={faSignOutAlt} />
		</div>
		<User on:click={() => goto("/changePassword")}/>
	{/if}
</div>
<main>
	<slot />
	{#if showConfig}
		<Configure on:close={() => (showConfig = false)} />
	{/if}
</main>

<style>
	.icon {
		margin-top: 0.1rem;
		margin-bottom: -0.1rem;
	}
	.bar {
		display: flex;
		background-color: var(--primary-600);
		color: var(--dark-1);
		font-size: 0.25in;
		font-weight: bold;
		gap: 0.5rem;
		padding: 0.25rem 1rem;
		align-items: center;
	}
	.grow {
		flex: 1 1;
	}
</style>
