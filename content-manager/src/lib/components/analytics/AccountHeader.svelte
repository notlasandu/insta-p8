<script lang="ts">
  import { page } from "$app/state";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";

  let { title, onOpenCalendar }: { title: string; onOpenCalendar: () => void } = $props();

  let clientEmbedded = $state(false);
  let isEmbedded = $derived(page.url.searchParams.get("embedded") === "true" || clientEmbedded);

  $effect(() => {
    try {
      clientEmbedded = window.self !== window.top;
    } catch {
      clientEmbedded = true;
    }
  });
</script>

<header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      {#if !isEmbedded}
        <a href="/" class="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold" aria-label="Back to Hub">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span class="hidden sm:inline">Hub</span>
        </a>
        <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
      {/if}
      <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
        {title || 'Content Studio'}
      </h1>
    </div>

    <div class="flex items-center gap-2">
      {#if !isEmbedded}
        <ThemeToggle />
      {/if}
      <button 
        title="Content Calendar"
        class="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium"
        onclick={onOpenCalendar}>
        <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span class="hidden sm:inline">Calendar</span>
      </button>
    </div>
  </div>
</header>
