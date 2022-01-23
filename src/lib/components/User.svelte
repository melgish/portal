<script lang="ts">
  import { session } from '$app/stores';

  console.log('session', $session);
</script>

<div on:click>
  <span>{$session?.user?.displayName}</span>
</div>