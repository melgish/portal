<script lang="ts" context="module">
  import type { LoadInput } from "@sveltejs/kit";
  import type { LoginParam } from "$lib/models/login";
  import Icon from "fa-svelte";
  import { faUnlock } from "@fortawesome/free-solid-svg-icons";
  import { createForm } from "svelte-forms-lib";
  import { goto } from "$app/navigation";
  import { session } from "$app/stores";
  import * as yup from "yup";

  export async function load({ session: { authenticated } }: LoadInput<any, any, any>) {
    // If logged in, redirect to home page
    if (authenticated) {
      return {
        status: 302,
        redirect: "/"
      };
    }
    return {
      status: 200
    };
  }
</script>

<script lang="ts">
  let error: string;

  const onSubmit = async ({ userName, password }: LoginParam) => {
    error = undefined;
    const body = JSON.stringify({ userName, password });
    const headers = { "content-type": "application/json" };
    try {
      const rs = await fetch("api/auth", { method: "POST", body, headers });
      if (rs.ok) {
        const user = await rs.json();
        // Load user info into session.
        session.set({ authenticated: true, user });
        return await goto("/");
      }
      // api error is user friendly
      error = (await rs.json()).message;
    } catch (err) {
      console.error(err);
      error = "Failed to login";
    }
  };

  const { errors, form, isValid, handleSubmit, handleChange } = createForm<LoginParam>({
    initialValues: { userName: "", password: "" },
    onSubmit,
    validationSchema: yup.object().shape({
      userName: yup.string().required("User Name is required"),
      password: yup.string().required("Password is required")
    })
  });
</script>

<form on:submit|preventDefault={handleSubmit}>
  <fieldset>
    <legend>Login</legend>
    <div>
      <label for="userName">User Name</label>
      <input
        autocomplete="userName"
        bind:value={$form.userName}
        id="userName"
        name="userName"
        on:change={handleChange}
        on:blur={handleChange}
        on:input={handleChange}
        type="text"
      />
      <div>{$errors.userName}</div>
    </div>
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
  </fieldset>
  <footer>
    {#if error}
      <div class="error">{error}</div>
    {/if}
    <button type="submit" disabled={!$isValid}>
      <Icon icon={faUnlock} />
      Login
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
