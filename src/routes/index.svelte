<script lang="ts" context="module">
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";
  import type { Session } from "$lib/models/session";
  import Link from "$lib/components/Link.svelte";

  export async function load({
    session,
    fetch
  }: LoadInput<any, any, Session>): Promise<LoadOutput> {
    if (!session.authenticated) {
      return {
        status: 302,
        redirect: "/login"
      };
    }
    const rs = await fetch("api/links");
    const links = await rs.json();
    return {
      status: 200,
      props: { links }
    };
  }
</script>

<script>
  export let links = [];
</script>

{#each links || [] as row}
  <section>
    <header>{row.title}</header>
    <nav>
      {#each row.links as link}
        <Link {link} />
      {/each}
    </nav>
  </section>
{:else}
  <section>
    <h1>Loading...</h1>
  </section>
{/each}

<style>
  section {
    display: grid;
    justify-items: center;
    margin-top: 1rem;
  }

  header {
    padding: 0.5rem;

    color: var(--primary-600);
    font-family: Lato;
    font-variant: small-caps;
    font-weight: 700;
    font-size: 0.4in;
  }

  nav {
    display: inline-flex;
  }
</style>
