<script lang="ts">
  import type { ChartMetric } from "$lib/types/analytics";

  let { activeMetric = $bindable('reach') }: { activeMetric: ChartMetric } = $props();

  let isOpen = $state(false);

  const options: { id: ChartMetric; label: string }[] = [
    { id: 'reach', label: 'Reach' },
    { id: 'views', label: 'Views' },
    { id: 'engaged', label: 'Engaged' },
    { id: 'clicks', label: 'Clicks' },
    { id: 'followers', label: 'Followers' }
  ];

  function selectOption(id: ChartMetric) {
    activeMetric = id;
    isOpen = false;
  }
</script>

{#snippet metricIcon(id: ChartMetric)}
  {#if id === 'reach'}
    <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
  {:else if id === 'views'}
    <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  {:else if id === 'engaged'}
    <svg class="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  {:else if id === 'clicks'}
    <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
  {:else}
    <svg class="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
  {/if}
{/snippet}

{#if isOpen}
  <div class="fixed inset-0 z-30" onclick={() => isOpen = false} role="presentation"></div>
{/if}

<div class="relative w-full">
  <button 
    type="button"
    class="w-full cursor-pointer select-none flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs h-10"
    onclick={() => isOpen = !isOpen}>
    <div class="flex items-center gap-2 truncate">
      {@render metricIcon(activeMetric)}
      <span class="font-bold text-xs truncate">
        {options.find(o => o.id === activeMetric)?.label}
      </span>
    </div>
    <svg class="w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  </button>

  {#if isOpen}
    <div class="absolute left-0 mt-1.5 w-full sm:w-44 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-40 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
      {#each options as opt (opt.id)}
        <button 
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors {activeMetric === opt.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}"
          onclick={() => selectOption(opt.id)}>
          {@render metricIcon(opt.id)}
          <span>{opt.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
