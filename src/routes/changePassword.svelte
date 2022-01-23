<script lang="ts" context="module">
	import type { LoadInput } from '@sveltejs/kit';
	import type { ChangePasswordParam } from '$lib/models/auth';
	import Icon from 'fa-svelte';
	import { faUnlock, faBackward, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
	import { createForm } from 'svelte-forms-lib';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import * as yup from 'yup';

	export const load = async ({ session: { authenticated } }: LoadInput<any, any, any>) => {
		// If logged in, redirect to home page
		if (!authenticated) {
			return {
				status: 302,
				redirect: '/signIn'
			};
		}
		return {
			status: 200
		};
	};
</script>

<script lang="ts">


	let error: string;

	const onSubmit = async ({ password, newPassword }: ChangePasswordParam) => {
		error = undefined;
		const body = JSON.stringify({ password, newPassword });
		const headers = { 'content-type': 'application/json' };
		try {
			const rs = await fetch('api/auth/changePassword', { method: 'POST', body, headers });
			if (rs.ok) {
				// Force user to sign in after change
				session.set({});
				return await goto('/signIn');
			}
			// api error is user friendly
			error = (await rs.json()).message;
		} catch (err) {
			console.error(err);
			error = 'Failed to update password';
		}
	};

	const { errors, form, isValid, handleSubmit, handleChange } = createForm<ChangePasswordParam>({
		initialValues: { password: '', newPassword: '', confirmPassword: '' },
		onSubmit,
		validationSchema: yup.object().shape({
			password: yup.string().required('Password is required'),
      newPassword: yup.string().required('New password is required'),
      confirmPassword: yup.string()
        .required('Confirmation password is required')
        .oneOf([yup.ref("newPassword"), null], "Passwords do not match.")
		})
	});
</script>

<form on:submit|preventDefault={handleSubmit}>
	<fieldset>
		<legend>Change Password</legend>
		<div>
			<label for="password">Password</label>
			<input
				autocomplete="current-password"
				bind:value={$form.password}
				id="password"
				name="password"
				on:change={handleChange}
				on:blur={handleChange}
				on:input={handleChange}
				type="password"
			/>
			<div>{$errors.password}</div>
		</div>
		<div>
			<label for="newPassword">New Password</label>
			<input
				bind:value={$form.newPassword}
				id="newPassword"
				name="newPassword"
				on:change={handleChange}
				on:blur={handleChange}
				on:input={handleChange}
				type="password"
			/>
			<div>{$errors.newPassword}</div>
		</div>
		<div>
			<label for="confirmPassword">Confirm New Password</label>
			<input
				bind:value={$form.confirmPassword}
				id="confirmPassword"
				name="confirmPassword"
				on:change={handleChange}
				on:blur={handleChange}
				on:input={handleChange}
				type="password"
			/>
			<div>{$errors.confirmPassword}</div>
		</div>
	</fieldset>
	<footer>
		{#if error}
			<div class="error">{error}</div>
		{/if}
		<button type="submit" disabled={!$isValid}>
			<Icon icon={faCheck} />
			Change Password
		</button>
    <button type="button" on:click={() => goto("/")}>
      <Icon icon={faTimes} />
      Cancel
    </button>
	</footer>
</form>

<style lang="scss">
	form {
		background-color: var(--dark-1);
		box-shadow: 0 0 8px 8px #00000088;
		margin: 1rem auto;
		padding: 1rem;
		border: 3px solid var(--primary-400);
		border-radius: 0.5rem;
		max-width: 25rem;
	}
	fieldset > div {
		> div {
			height: 1rem;
			margin-bottom: 0.5rem;
			color: hsl(0, 100%, 45%);
		}
	}
	footer {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		margin-top: 0.5rem;
		gap: 0.5rem;
	}
</style>
