<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/a/berl_view');
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
  <div class="flex flex-col items-center gap-3">
    <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <span class="text-xs font-medium">Redirecting to Content Studio...</span>
  </div>
</div>
