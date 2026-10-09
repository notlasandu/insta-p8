<script lang="ts">
  export type SortOption = 'date' | 'reach';

  let { activeSort = $bindable('date') }: { activeSort: SortOption } = $props();

  let isOpen = $state(false);

  const options: { id: SortOption; label: string }[] = [
    { id: 'date', label: 'Date Published' },
    { id: 'reach', label: 'Highest Reach' }
  ];

  function selectOption(id: SortOption) {
    activeSort = id;
    isOpen = false;
  }
</script>

{#snippet sortIcon(id: SortOption)}
  {#if id === 'date'}
    <svg class="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  {:else}
    <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
  {/if}
{/snippet}

{#if isOpen}
  <div class="fixed inset-0 z-30" onclick={() => isOpen = false} role="presentation"></div>
{/if}

<div class="relative w-full sm:w-auto">
  <button 
    type="button"
    class="w-full sm:w-auto cursor-pointer select-none flex items-center justify-between gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs h-10"
    onclick={() => isOpen = !isOpen}>
    <div class="flex items-center gap-2 truncate">
      {@render sortIcon(activeSort)}
      <span class="font-bold text-xs truncate">
        {options.find(o => o.id === activeSort)?.label}
      </span>
    </div>
    <svg class="w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  </button>

  {#if isOpen}
    <div class="absolute right-0 mt-1.5 w-full sm:w-44 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-40 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
      {#each options as opt (opt.id)}
        <button 
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors {activeSort === opt.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}"
          onclick={() => selectOption(opt.id)}>
          {@render sortIcon(opt.id)}
          <span>{opt.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
