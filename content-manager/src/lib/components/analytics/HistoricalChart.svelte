<script lang="ts">
  import type { HistoricalStatItem, ChartMetric, PlatformFilter } from "$lib/types/analytics";
  import { computeTotalSections, get14DayPoints, formatRangeLabel } from "$lib/utils/analyticsDate";
  import { persistDetails } from "$lib/utils/persistDetails";
  import HistoricalChartSvg from "./HistoricalChartSvg.svelte";
  import PlatformDropdown from "./PlatformDropdown.svelte";
  import MetricDropdown from "./MetricDropdown.svelte";

  let { data = [] }: { data: HistoricalStatItem[] } = $props();

  let sectionOffset = $state(0);
  let activeMetric = $state<ChartMetric>('reach');
  let activePlatform = $state<PlatformFilter | 'compare'>('combined');

  const metrics: { id: ChartMetric; label: string }[] = [
    { id: 'reach', label: 'Reach' }, { id: 'views', label: 'Views' },
    { id: 'engaged', label: 'Engaged' }, { id: 'clicks', label: 'Clicks' },
    { id: 'followers', label: 'Followers' }
  ];

  let totalSections = $derived(computeTotalSections(data));
  let hasOlder = $derived(sectionOffset < totalSections - 1);
  let hasNewer = $derived(sectionOffset > 0);

  let combinedPoints = $derived(get14DayPoints(data, sectionOffset, activeMetric, 'combined'));
  let igPoints = $derived(get14DayPoints(data, sectionOffset, activeMetric, 'instagram'));
  let fbPoints = $derived(get14DayPoints(data, sectionOffset, activeMetric, 'facebook'));
  let activePoints = $derived(
    activePlatform === 'instagram' ? igPoints : activePlatform === 'facebook' ? fbPoints : combinedPoints
  );

  let toolbarDateRange = $derived(formatRangeLabel(combinedPoints));
  let activeMetricLabel = $derived(metrics.find((m) => m.id === activeMetric)?.label ?? 'Reach');
  let chartColor = $derived(
    activePlatform === 'instagram' ? '#ec4899' : activePlatform === 'facebook' ? '#2563eb' : '#10b981'
  );
</script>

<details open use:persistDetails={'historical_chart'} class="mb-12 group [&::-webkit-details-marker]:hidden">
  <summary class="cursor-pointer select-none flex items-center justify-between gap-2 mb-6 outline-none">
    <h2 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
      <span>Growth Trends</span>
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-full">
    <div class="flex sm:hidden flex-col gap-2.5 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
      <div class="grid grid-cols-2 gap-2 w-full">
        <MetricDropdown bind:activeMetric />
        <PlatformDropdown bind:activePlatform />
      </div>

      <div class="flex items-center justify-between w-full bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          disabled={!hasOlder} onclick={() => sectionOffset++} aria-label="Previous 14 Days">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="text-xs font-semibold px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap text-center flex-1">{toolbarDateRange}</span>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          disabled={!hasNewer} onclick={() => sectionOffset--} aria-label="Next 14 Days">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <div class="hidden sm:flex items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
      <div class="flex items-center gap-2 overflow-x-auto">
        {#each metrics as metric (metric.id)}
          <button 
            class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border cursor-pointer {activeMetric === metric.id ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}"
            onclick={() => activeMetric = metric.id}>
            {metric.label}
          </button>
        {/each}
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <PlatformDropdown bind:activePlatform />

        <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            disabled={!hasOlder} onclick={() => sectionOffset++} aria-label="Previous 14 Days">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span class="text-xs font-semibold px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">{toolbarDateRange}</span>
          <button
            class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            disabled={!hasNewer} onclick={() => sectionOffset--} aria-label="Next 14 Days">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="relative">
      {#if activePlatform === 'compare'}
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div class="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Instagram - {activeMetricLabel}</h4>
            </div>
            <HistoricalChartSvg points={igPoints} metricLabel={activeMetricLabel} strokeColor="#ec4899" />
          </div>
          <div class="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Facebook - {activeMetricLabel}</h4>
            </div>
            <HistoricalChartSvg points={fbPoints} metricLabel={activeMetricLabel} strokeColor="#2563eb" />
          </div>
        </div>
      {:else}
        <HistoricalChartSvg points={activePoints} metricLabel={activeMetricLabel} strokeColor={chartColor} />
      {/if}
    </div>
  </div>
</details>
