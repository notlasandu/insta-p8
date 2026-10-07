<script lang="ts">
  let { posts } = $props<{
    posts: any[];
  }>();

  let statsByType = $derived.by(() => {
    const stats: Record<string, { count: number; likes: number; comments: number }> = {
      VIDEO: { count: 0, likes: 0, comments: 0 },
      CAROUSEL_ALBUM: { count: 0, likes: 0, comments: 0 },
      IMAGE: { count: 0, likes: 0, comments: 0 }
    };
    for (const p of posts) {
      if (stats[p.media_type]) {
        stats[p.media_type].count += 1;
        stats[p.media_type].likes += p.like_count || 0;
        stats[p.media_type].comments += p.comments_count || 0;
      }
    }
    return stats;
  });

  let maxEngagement = $derived(Math.max(
    ...Object.values(statsByType).map(s => s.likes + s.comments)
  ));
  
  function getWidth(engagement: number) {
    if (maxEngagement === 0) return '0%';
    return `${(engagement / maxEngagement) * 100}%`;
  }
</script>

<details open class="mb-12 group [&::-webkit-details-marker]:hidden" id="suggestions">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
      Strategic Analytics & AI Insights
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Top-of-Funnel (TOFU)</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">0% Coverage</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">0 <span class="text-xs font-normal text-slate-500 dark:text-slate-400">Reach</span></div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting data to analyze discovery driven content.</p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mid-Funnel (MOFU)</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">0% Coverage</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">0 Posts <span class="text-xs font-normal text-slate-500 dark:text-slate-400">Problem-Aware</span></div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting data to analyze consideration content.</p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bottom-of-Funnel (BOFU)</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">0 Inbound DMs</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">0% <span class="text-xs font-normal text-slate-500 dark:text-slate-400">Comment Rate</span></div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting data to analyze conversion content.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Performance by Format
        </h3>
        <div class="space-y-6">
          {#each Object.entries(statsByType) as [type, stats]}
            {@const engagement = stats.likes + stats.comments}
            {@const isTop = engagement === maxEngagement && engagement > 0}
            <div>
              <div class="flex justify-between items-end mb-2">
                <div class="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {type.replace('_', ' ')}
                  {#if isTop}
                    <span class="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold tracking-wider">TOP PERFORMER</span>
                  {/if}
                </div>
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">{engagement.toLocaleString()} <span class="text-slate-400 dark:text-slate-500 font-normal">engagements</span></div>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000 ease-out {isTop ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'}"
                  style="width: {getWidth(engagement)}"
                ></div>
              </div>
              <div class="text-xs text-slate-400 dark:text-slate-500 mt-2 flex justify-between">
                <span>{stats.count} total posts</span>
                <span class="font-medium text-slate-500 dark:text-slate-400">Avg: {stats.count ? Math.round(engagement / stats.count).toLocaleString() : 0} per post</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex flex-col justify-center">
        <div class="flex items-center gap-3 mb-5">
          <div class="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-indigo-50 dark:border-indigo-900/40">
            <span class="text-xl leading-none">✨</span>
          </div>
          <h3 class="text-lg font-bold text-indigo-950 dark:text-indigo-200">AI Strategic Insights</h3>
        </div>
        <div class="space-y-3.5 text-indigo-900/85 dark:text-indigo-200/90 leading-relaxed text-sm">
          <p>
            <strong class="font-bold text-indigo-950 dark:text-white">1. Audience Engagement:</strong> Awaiting data to analyze audience engagement patterns and comment-to-DM triggers.
          </p>
          <p>
            <strong class="font-bold text-indigo-950 dark:text-white">2. Content Discovery:</strong> Connect your account and fetch data to see how users are discovering your content across different formats.
          </p>
          <p>
            <strong class="font-bold text-indigo-950 dark:text-white">3. Growth Opportunities:</strong> AI insights will highlight untapped content opportunities and audience segments once sufficient data is collected.
          </p>
          <div class="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-300">Prescription:</span>
            <p class="text-xs text-indigo-900 dark:text-indigo-200 mt-1">Fetch analytics data to generate your personalized AI strategic prescription.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</details>
