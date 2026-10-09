<script lang="ts">
  import { persistDetails } from "$lib/utils/persistDetails";

  let {
    igProfile = { followers_count: 0 },
    fbProfile = { followers_count: 0 },
    todayStats = {
      combined: { reach: 0, engaged: 0, views: 0, clicks: 0, followers: 0 },
      instagram: { reach: 0, engaged: 0, views: 0, clicks: 0, followers: 0 },
      facebook: { reach: 0, engaged: 0, views: 0, clicks: 0, followers: 0 }
    }
  } = $props<{
    igProfile?: any;
    fbProfile?: any;
    todayStats?: any;
    igInsights?: any[];
    fbInsights?: any[];
  }>();

  let combined = $derived(todayStats.combined || {
    reach: (todayStats.instagram?.reach || 0) + (todayStats.facebook?.reach || 0),
    engaged: (todayStats.instagram?.engaged || 0) + (todayStats.facebook?.engaged || 0),
    views: (todayStats.instagram?.views || 0) + (todayStats.facebook?.views || 0),
    clicks: (todayStats.instagram?.clicks || 0) + (todayStats.facebook?.clicks || 0),
    followers: (igProfile.followers_count || 0) + (fbProfile.followers_count || 0)
  });
</script>

<details open use:persistDetails={'account_insights'} class="mb-12 group [&::-webkit-details-marker]:hidden">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <h2 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
      <span>Insights</span>
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
    <div class="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl p-4 sm:p-6 border border-indigo-100 dark:border-indigo-900/40 relative overflow-hidden">
      <h3 class="text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1 sm:mb-2 truncate">Total Audience</h3>
      <div class="text-2xl sm:text-4xl font-black text-indigo-950 dark:text-indigo-100 mb-2 sm:mb-3">{combined.followers.toLocaleString()}</div>
      <div class="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 border-t border-indigo-100/80 dark:border-indigo-900/40 pt-2 flex-wrap">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></span> IG: {igProfile.followers_count || 0}</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></span> FB: {fbProfile.followers_count || 0}</span>
      </div>
    </div>

    <div class="bg-violet-50/70 dark:bg-violet-950/30 rounded-2xl p-4 sm:p-6 border border-violet-100 dark:border-violet-900/40 relative overflow-hidden">
      <h3 class="text-[11px] sm:text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-1 sm:mb-2 truncate">Today's Reach</h3>
      <div class="text-2xl sm:text-4xl font-black text-violet-950 dark:text-violet-100 mb-2 sm:mb-3">{combined.reach.toLocaleString()}</div>
      <div class="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 border-t border-violet-100/80 dark:border-violet-900/40 pt-2 flex-wrap">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></span> IG: {todayStats.instagram?.reach || 0}</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></span> FB: {todayStats.facebook?.reach || 0}</span>
      </div>
    </div>

    <div class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 sm:p-6 border border-amber-100 dark:border-amber-900/40 relative overflow-hidden">
      <h3 class="text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1 sm:mb-2 truncate">Today's Engaged</h3>
      <div class="text-2xl sm:text-4xl font-black text-amber-950 dark:text-amber-100 mb-2 sm:mb-3">{combined.engaged.toLocaleString()}</div>
      <div class="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 border-t border-amber-100/80 dark:border-indigo-900/40 pt-2 flex-wrap">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></span> IG: {todayStats.instagram?.engaged || 0}</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></span> FB: {todayStats.facebook?.engaged || 0}</span>
      </div>
    </div>

    <div class="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-4 sm:p-6 border border-emerald-100 dark:border-emerald-900/40 relative overflow-hidden">
      <h3 class="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1 sm:mb-2 truncate">Today's Views</h3>
      <div class="text-2xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 mb-2 sm:mb-3">{combined.views.toLocaleString()}</div>
      <div class="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 border-t border-emerald-100/80 dark:border-emerald-900/40 pt-2 flex-wrap">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></span> IG: {todayStats.instagram?.views || 0}</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></span> FB: {todayStats.facebook?.views || 0}</span>
      </div>
    </div>
  </div>
</details>
