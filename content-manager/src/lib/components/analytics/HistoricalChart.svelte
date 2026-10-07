<script lang="ts">
  import type { HistoricalStatItem, ChartMetric } from "$lib/types/analytics";
  import { computeTotalSections, get14DayPoints, formatRangeLabel } from "$lib/utils/analyticsDate";
  import HistoricalChartSvg from "./HistoricalChartSvg.svelte";

  let {
    data = [],
  }: {
    data: HistoricalStatItem[];
  } = $props();

  let sectionOffset = $state(0);
  let activeMetric = $state<ChartMetric>('reach');

  const metrics: { id: ChartMetric; label: string }[] = [
    { id: 'reach', label: 'Reach' },
    { id: 'views', label: 'Views' },
    { id: 'engaged', label: 'Engaged Accounts' },
    { id: 'clicks', label: 'Link Clicks' },
    { id: 'followers', label: 'Followers' },
  ];

  let totalSections = $derived(computeTotalSections(data));
  let hasOlder = $derived(sectionOffset < totalSections - 1);
  let hasNewer = $derived(sectionOffset > 0);

  let dayPoints = $derived(get14DayPoints(data, sectionOffset, activeMetric));
  let toolbarDateRange = $derived(formatRangeLabel(dayPoints));
  let activeMetricLabel = $derived(
    metrics.find((m) => m.id === activeMetric)?.label ?? 'Reach'
  );
</script>

<details open class="mb-12 group [&::-webkit-details-marker]:hidden">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          Account Growth Over Time
        </h2>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
        Historical (14d)
      </span>
    </div>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-full">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
      <div class="flex items-center gap-2 overflow-x-auto">
        {#each metrics as metric (metric.id)}
          <button 
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border {activeMetric === metric.id ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}"
            onclick={() => activeMetric = metric.id}
          >
            {metric.label}
          </button>
        {/each}
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={!hasOlder}
          onclick={() => sectionOffset++}
          aria-label="Previous 14 Days"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="text-xs font-semibold px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
          {toolbarDateRange}
        </span>
        <button
          class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={!hasNewer}
          onclick={() => sectionOffset--}
          aria-label="Next 14 Days"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <HistoricalChartSvg points={dayPoints} metricLabel={activeMetricLabel} />
  </div>
</details>
