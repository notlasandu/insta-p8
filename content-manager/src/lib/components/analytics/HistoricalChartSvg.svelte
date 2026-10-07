<script lang="ts">
  import type { ChartDayPoint } from "$lib/types/analytics";

  let {
    points,
    metricLabel,
    strokeColor = '#10b981',
  }: {
    points: ChartDayPoint[];
    metricLabel: string;
    strokeColor?: string;
  } = $props();

  let hoveredIndex = $state<number | null>(null);
  let containerWidth = $state(1000);

  const height = 280;
  const paddingX = 45;
  const paddingY = 40;

  let width = $derived(containerWidth || 1000);
  let pointsWithData = $derived(points.filter((p) => p.hasData && p.value !== null));

  let maxVal = $derived(
    pointsWithData.length > 0
      ? Math.max(...pointsWithData.map((p) => p.value as number), 10)
      : 10
  );
  let minVal = $derived(
    pointsWithData.length > 0
      ? Math.min(...pointsWithData.map((p) => p.value as number))
      : 0
  );

  let coords = $derived.by(() => {
    const total = Math.max(1, points.length - 1);
    const range = maxVal - minVal || 1;
    return points.map((p, i) => {
      const x = paddingX + (i / total) * (width - paddingX * 2);
      let y = height - paddingY;
      if (p.hasData && p.value !== null) {
        const normalizedY = (p.value - minVal) / range;
        y = height - paddingY - (normalizedY * (height - paddingY * 2));
      }
      return { ...p, x, y };
    });
  });

  let pathSegments = $derived.by(() => {
    const segments: string[] = [];
    let current: string[] = [];
    coords.forEach((p) => {
      if (p.hasData && p.value !== null) {
        current.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      } else {
        if (current.length > 1) {
          segments.push(`M ${current.join(' L ')}`);
        }
        current = [];
      }
    });
    if (current.length > 1) {
      segments.push(`M ${current.join(' L ')}`);
    }
    return segments;
  });
</script>

<div bind:clientWidth={containerWidth} class="relative w-full h-[280px]">
  <svg {width} {height} viewBox="0 0 {width} {height}" class="w-full h-full overflow-visible">
    <line x1="{paddingX}" y1="{paddingY}" x2="{width - paddingX}" y2="{paddingY}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-dasharray="4" />
    <line x1="{paddingX}" y1="{height / 2}" x2="{width - paddingX}" y2="{height / 2}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-dasharray="4" />
    <line x1="{paddingX}" y1="{height - paddingY}" x2="{width - paddingX}" y2="{height - paddingY}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-dasharray="4" />

    <text x="{paddingX - 10}" y="{paddingY + 4}" text-anchor="end" class="text-[10px] fill-slate-400 font-mono">{maxVal.toLocaleString()}</text>
    <text x="{paddingX - 10}" y="{height - paddingY + 4}" text-anchor="end" class="text-[10px] fill-slate-400 font-mono">{minVal.toLocaleString()}</text>

    {#each pathSegments as segment (segment)}
      <path d={segment} fill="none" stroke={strokeColor} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    {/each}

    {#each coords as p, i (p.date)}
      {@const showDateLabel = width >= 640 || i % 2 === 0 || i === coords.length - 1}
      {#if p.hasData && p.value !== null}
        <g class="cursor-pointer" onmouseenter={() => hoveredIndex = i} onmouseleave={() => hoveredIndex = null} role="graphics-symbol">
          <circle cx="{p.x}" cy="{p.y}" r="16" fill="transparent" />
          <circle cx="{p.x}" cy="{p.y}" r="{hoveredIndex === i ? 6 : 4.5}" class="fill-white dark:fill-slate-900 stroke-[2.5px] transition-all" style="stroke: {strokeColor}" />
        </g>
      {/if}

      {#if showDateLabel}
        <text x="{p.x}" y="{height - 12}" text-anchor="middle" class="text-[10px] fill-slate-400 font-medium select-none">
          {new Date(p.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </text>
      {/if}
    {/each}
  </svg>

  {#if hoveredIndex !== null && coords[hoveredIndex] && coords[hoveredIndex].value !== null}
    {@const p = coords[hoveredIndex]}
    <div class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 z-10 drop-shadow-lg" style="left: {p.x}px; top: {p.y}px;">
      <div class="bg-slate-800 dark:bg-slate-700 text-white px-3.5 py-2 rounded-xl flex flex-col items-center whitespace-nowrap relative border border-slate-700 dark:border-slate-600">
        <span class="font-bold text-sm leading-tight">{p.value?.toLocaleString()}</span>
        <span class="text-slate-300 text-[10px] uppercase tracking-wider mb-0.5">{metricLabel}</span>
        <span class="text-slate-400 text-[10px]">{new Date(p.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 dark:bg-slate-700 border-b border-r border-slate-700 dark:border-slate-600 rotate-45"></div>
      </div>
    </div>
  {/if}
</div>
