<script lang="ts">
  import { session } from '$app/stores';
</script>

<div on:click>
  <span>{$session?.user?.displayName}</span>
</div>