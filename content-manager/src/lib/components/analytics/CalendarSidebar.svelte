<script lang="ts">
  import type { ContentItem } from "$lib/types/content";
  import CalendarView from "$lib/components/CalendarView.svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import MobileAgendaCalendar from "./MobileAgendaCalendar.svelte";

  let { isOpen = $bindable(false), posts = [] }: { isOpen: boolean, posts: ContentItem[] } = $props();

  function close() {
    isOpen = false;
  }
</script>

<div class="sm:hidden">
  <BottomSheet bind:isOpen title="Content Calendar">
    <MobileAgendaCalendar {posts} />
  </BottomSheet>
</div>

{#if isOpen}
  <div class="hidden sm:block">
    <div 
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity" 
      onclick={close}
      onkeydown={(e) => e.key === 'Escape' && close()}
      role="button"
      tabindex="0"
      aria-label="Close calendar modal">
    </div>

    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl max-h-[90vh] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden">
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <h2 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Content Calendar
        </h2>
        <button onclick={close} aria-label="Close calendar" class="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4">
        <CalendarView {posts} />
      </div>
    </div>
  </div>
{/if}
