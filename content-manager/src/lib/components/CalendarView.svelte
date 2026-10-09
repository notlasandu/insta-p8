<script lang="ts">
  import type { ContentItem } from "$lib/types/content";

  let { posts = [] }: { posts: ContentItem[] } = $props();

  let currentDate = $state(new Date(2026, 7, 1));

  let year = $derived(currentDate.getFullYear());
  let month = $derived(currentDate.getMonth());
  let monthName = $derived(currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
  
  let days = $derived.by(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    return Array.from({ length: 42 }, (_, i) => {
      const dayNumber = i - firstDay + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const dateStr = isCurrentMonth 
        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}` 
        : null;
        
      const dayPosts = dateStr ? posts.filter(p => p.scheduledDate === dateStr) : [];
      
      return {
        dayNumber: isCurrentMonth ? dayNumber : null,
        dateStr,
        posts: dayPosts
      };
    });
  });
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function prevMonth() {
    currentDate = new Date(year, month - 1, 1);
  }

  function nextMonth() {
    currentDate = new Date(year, month + 1, 1);
  }
</script>

<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
  <div class="p-3 sm:p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
    <h2 class="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100">{monthName}</h2>
    <div class="flex gap-1 sm:gap-2">
      <button onclick={prevMonth} aria-label="Previous month" class="p-1.5 sm:p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button onclick={nextMonth} aria-label="Next month" class="p-1.5 sm:p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <div class="min-w-[560px]">
      <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
        {#each weekDays as day}
          <div class="py-2 text-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
            {day}
          </div>
        {/each}
      </div>
      
      <div class="grid grid-cols-7 bg-slate-200 dark:bg-slate-800 gap-px border-b border-slate-200 dark:border-slate-800">
        {#each days as day}
          <div class="bg-white dark:bg-slate-900 min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col {day.dayNumber ? '' : 'bg-slate-50 dark:bg-slate-950/40'}">
            {#if day.dayNumber}
              <div class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-2">{day.dayNumber}</div>
              <div class="flex flex-col gap-1 overflow-y-auto max-h-[70px] sm:max-h-[80px]">
                {#each day.posts as post}
                  <div class="text-[11px] sm:text-xs p-1 rounded font-semibold truncate
                    {post.status === 'POSTED' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' : 
                     post.status === 'READY' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' : 
                     post.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' : 
                     'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'}">
                    {post.title}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
