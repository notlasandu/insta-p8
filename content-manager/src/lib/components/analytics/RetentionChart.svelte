<script lang="ts">
  let {
    retentionGraph = null,
    skipRate = null,
    avgWatchTime = null,
    replaysCount = null
  }: {
    retentionGraph?: Record<string, number> | null;
    skipRate?: number | null;
    avgWatchTime?: number | null;
    replaysCount?: number | null;
  } = $props();

  let points = $derived.by(() => {
    if (!retentionGraph) return [];
    return Object.entries(retentionGraph)
      .map(([sec, val]) => ({ sec: Number(sec), rate: Number(val) }))
      .sort((a, b) => a.sec - b.sec);
  });

  let maxSec = $derived(points.length > 0 ? points[points.length - 1].sec : 0);
  let hookPoint = $derived(points.find((p) => p.sec === 3) ?? points.find((p) => p.sec <= 3 && p.sec >= 1));
  let hookRetention = $derived(hookPoint ? Math.round(hookPoint.rate * 100) : null);
  let finalRetention = $derived(points.length > 0 ? Math.round(points[points.length - 1].rate * 100) : null);

  let pathD = $derived.by(() => {
    if (points.length < 2) return "";
    const w = 340;
    const h = 75;
    const top = 10;
    const left = 15;
    return points.map((p, i) => {
      const x = left + (maxSec > 0 ? (p.sec / maxSec) * w : 0);
      const y = top + h - (Math.max(0, Math.min(1, p.rate)) * h);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  });

  let areaD = $derived.by(() => {
    if (!pathD || points.length < 2) return "";
    const w = 340;
    const h = 75;
    const top = 10;
    const left = 15;
    const lastX = left + w;
    const baseY = top + h;
    return `${pathD} L ${lastX.toFixed(1)} ${baseY} L ${left} ${baseY} Z`;
  });
</script>

<div class="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
  <div class="flex items-center justify-between mb-2.5">
    <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
      <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <span>Audience Retention</span>
    </div>
    <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {#if typeof replaysCount === 'number' && replaysCount > 0}
        <span class="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          {replaysCount} replays
        </span>
      {/if}
      {#if typeof avgWatchTime === 'number' && avgWatchTime > 0}
        <span class="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70">
          Avg: {avgWatchTime}s
        </span>
      {/if}
    </div>
  </div>

  {#if points.length > 2}
    <div class="w-full relative mb-2">
      <svg viewBox="0 0 370 100" class="w-full h-24 overflow-visible">
        <defs>
          <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <line x1="15" y1="10" x2="355" y2="10" stroke="currentColor" class="text-slate-200 dark:text-slate-700/60" stroke-dasharray="3 3" />
        <line x1="15" y1="47.5" x2="355" y2="47.5" stroke="currentColor" class="text-slate-200 dark:text-slate-700/60" stroke-dasharray="3 3" />
        <line x1="15" y1="85" x2="355" y2="85" stroke="currentColor" class="text-slate-200 dark:text-slate-700/60" />

        <path d={areaD} fill="url(#retentionGrad)" />
        <path d={pathD} fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="flex items-center justify-between text-[10px] text-slate-400 font-medium px-3 mt-1">
        <span>0s (100%)</span>
        {#if hookRetention !== null}
          <span class="text-indigo-600 dark:text-indigo-400 font-bold">3s ({hookRetention}%)</span>
        {/if}
        <span>{maxSec}s ({finalRetention}%)</span>
      </div>
    </div>
  {:else if typeof skipRate === 'number'}
    <div class="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
      <div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">3-Second Hook Skip Rate</div>
        <div class="text-base font-bold text-slate-900 dark:text-white mt-0.5">{skipRate}%</div>
      </div>
      <div class="text-right">
        <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hook Retention (Past 3s)</div>
        <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{(100 - skipRate).toFixed(1)}%</div>
      </div>
    </div>
  {/if}
</div>
