<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    isOpen = $bindable(false),
    title = '',
    children
  }: {
    isOpen: boolean;
    title?: string;
    children?: Snippet;
  } = $props();

  function close() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="0"
    aria-label="Close sheet">
  </div>

  <div class="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
    <div class="pt-3 pb-2 flex flex-col items-center shrink-0">
      <div class="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-3"></div>
      <div class="w-full px-5 flex items-center justify-between">
        {#if title}
          <h3 class="text-base font-bold text-slate-900 dark:text-white truncate">{title}</h3>
        {:else}
          <div></div>
        {/if}
        <button 
          onclick={close}
          aria-label="Close"
          class="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-5 pb-8 pt-1">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
{/if}
