<script lang="ts">
  let { insights } = $props<{
    insights: Array<{
      name: string;
      period: string;
      title: string;
      description: string;
      total_value: { value: number };
      id: string;
    }>
  }>();

  function getInsight(name: string) {
    return insights.find(i => i.name === name);
  }

  const reach = getInsight('reach');
  const engaged = getInsight('accounts_engaged');
  const views = getInsight('profile_views');
  const clicks = getInsight('website_clicks');
</script>

<details open class="mb-12 group [&::-webkit-details-marker]:hidden">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
      Daily Account Insights
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {#if reach}
      <div class="bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden group">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full opacity-50 transition-transform group-hover:scale-150"></div>
        <div class="relative">
          <h3 class="text-sm font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-2">{reach.title}</h3>
          <div class="text-5xl font-black text-indigo-950 dark:text-indigo-100 mb-2">{reach.total_value.value.toLocaleString()}</div>
          
          <details class="text-xs text-indigo-600/80 dark:text-indigo-400 [&::-webkit-details-marker]:hidden mt-4">
            <summary class="cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-200 font-medium select-none flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              View API Metadata
            </summary>
            <div class="mt-2 p-2 bg-indigo-900/10 dark:bg-indigo-900/40 rounded-md text-[10px] space-y-1 dark:text-indigo-200">
              <p><strong>Period:</strong> {reach.period}</p>
              <p><strong>Desc:</strong> {reach.description}</p>
              <p class="truncate font-mono"><strong>ID:</strong> {reach.id}</p>
            </div>
          </details>
        </div>
      </div>
    {/if}

    {#if engaged}
      <div class="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/50 relative overflow-hidden group">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full opacity-50 transition-transform group-hover:scale-150"></div>
        <div class="relative">
          <h3 class="text-sm font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">{engaged.title}</h3>
          <div class="text-5xl font-black text-amber-950 dark:text-amber-100 mb-2">{engaged.total_value.value.toLocaleString()}</div>
          
          <details class="text-xs text-amber-600/80 dark:text-amber-400 [&::-webkit-details-marker]:hidden mt-4">
            <summary class="cursor-pointer hover:text-amber-800 dark:hover:text-amber-200 font-medium select-none flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              View API Metadata
            </summary>
            <div class="mt-2 p-2 bg-amber-900/10 dark:bg-amber-900/40 rounded-md text-[10px] space-y-1 dark:text-amber-200">
              <p><strong>Period:</strong> {engaged.period}</p>
              <p><strong>Desc:</strong> {engaged.description}</p>
              <p class="truncate font-mono"><strong>ID:</strong> {engaged.id}</p>
            </div>
          </details>
        </div>
      </div>
    {/if}

    {#if views}
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div class="relative">
          <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{views.title}</h3>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-2">{views.total_value.value.toLocaleString()}</div>
          
          <details class="text-xs text-slate-400 dark:text-slate-500 [&::-webkit-details-marker]:hidden mt-4">
            <summary class="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 font-medium select-none flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              View API Metadata
            </summary>
            <div class="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md text-[10px] space-y-1 dark:text-slate-300">
              <p><strong>Period:</strong> {views.period}</p>
              <p><strong>Desc:</strong> {views.description}</p>
              <p class="truncate font-mono"><strong>ID:</strong> {views.id}</p>
            </div>
          </details>
        </div>
      </div>
    {/if}

    {#if clicks}
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div class="relative">
          <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{clicks.title}</h3>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-2">{clicks.total_value.value.toLocaleString()}</div>
          
          <details class="text-xs text-slate-400 dark:text-slate-500 [&::-webkit-details-marker]:hidden mt-4">
            <summary class="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 font-medium select-none flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              View API Metadata
            </summary>
            <div class="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md text-[10px] space-y-1 dark:text-slate-300">
              <p><strong>Period:</strong> {clicks.period}</p>
              <p><strong>Desc:</strong> {clicks.description}</p>
              <p class="truncate font-mono"><strong>ID:</strong> {clicks.id}</p>
            </div>
          </details>
        </div>
      </div>
    {/if}
  </div>
</details>

