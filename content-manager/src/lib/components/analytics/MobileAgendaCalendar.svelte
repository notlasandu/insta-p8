<script lang="ts">
  import type { ContentItem } from "$lib/types/content";

  let { posts = [] }: { posts: ContentItem[] } = $props();

  let currentDate = $state(new Date(2026, 7, 1));
  let selectedDay = $state(1);

  let year = $derived(currentDate.getFullYear());
  let month = $derived(currentDate.getMonth());
  let monthName = $derived(currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));

  let daysInMonth = $derived(new Date(year, month + 1, 0).getDate());

  let selectedDateStr = $derived(
    `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  );

  let selectedDayPosts = $derived(
    posts.filter(p => p.scheduledDate === selectedDateStr)
  );

  let monthPostsCount = $derived(
    posts.filter(p => p.scheduledDate?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length
  );

  function prevMonth() {
    currentDate = new Date(year, month - 1, 1);
    selectedDay = 1;
  }

  function nextMonth() {
    currentDate = new Date(year, month + 1, 1);
    selectedDay = 1;
  }

  function getDayPostsCount(dayNum: number) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return posts.filter(p => p.scheduledDate === dStr).length;
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-2xl">
    <div>
      <h3 class="font-bold text-slate-900 dark:text-white text-base">{monthName}</h3>
      <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{monthPostsCount} scheduled</p>
    </div>
    <div class="flex items-center gap-1">
      <button 
        onclick={prevMonth} 
        aria-label="Previous month" 
        class="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs active:scale-95 transition-transform">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button 
        onclick={nextMonth} 
        aria-label="Next month" 
        class="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs active:scale-95 transition-transform">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="overflow-x-auto pb-1 -mx-2 px-2 no-scrollbar">
    <div class="flex items-center gap-1.5 min-w-max">
      {#each Array.from({ length: daysInMonth }, (_, i) => i + 1) as dayNum}
        {@const pCount = getDayPostsCount(dayNum)}
        {@const isSelected = selectedDay === dayNum}
        <button
          onclick={() => selectedDay = dayNum}
          class="flex flex-col items-center justify-center w-11 h-14 rounded-2xl transition-all relative shrink-0 {isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}">
          <span class="text-[10px] font-medium {isSelected ? 'text-indigo-200' : 'text-slate-400'}">
            {new Date(year, month, dayNum).toLocaleString('default', { weekday: 'narrow' })}
          </span>
          <span class="text-sm font-bold mt-0.5">{dayNum}</span>
          {#if pCount > 0}
            <span class="w-1.5 h-1.5 rounded-full {isSelected ? 'bg-white' : 'bg-indigo-500'} mt-1"></span>
          {:else}
            <span class="w-1.5 h-1.5 mt-1"></span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="mt-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
    <div class="flex items-center justify-between mb-3 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Agenda: {new Date(year, month, selectedDay).toLocaleDateString('default', { month: 'short', day: 'numeric', weekday: 'short' })}
      </h4>
      <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
        {selectedDayPosts.length} posts
      </span>
    </div>

    {#if selectedDayPosts.length === 0}
      <div class="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        No content scheduled for this date.
      </div>
    {:else}
      <div class="space-y-2.5">
        {#each selectedDayPosts as post}
          <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                {post.status === 'POSTED' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                 post.status === 'READY' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'}">
                {post.status}
              </span>
              <span class="text-[11px] text-slate-400">{post.platform}</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{post.title}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
