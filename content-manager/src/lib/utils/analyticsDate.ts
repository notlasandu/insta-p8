import type { HistoricalStatItem, ChartMetric, ChartDayPoint, PlatformFilter } from "$lib/types/analytics";

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeTotalSections(data: HistoricalStatItem[], pageSize = 14): number {
  if (!data || data.length === 0) return 1;
  const anchor = parseLocalDate(data[data.length - 1].date);
  const oldest = parseLocalDate(data[0].date);
  const dayDiff = Math.max(
    0,
    Math.round((anchor.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24))
  );
  return Math.max(1, Math.ceil((dayDiff + 1) / pageSize));
}

export function get14DayPoints(
  data: HistoricalStatItem[],
  sectionOffset: number,
  activeMetric: ChartMetric,
  platform: PlatformFilter = 'combined'
): ChartDayPoint[] {
  const anchor = data && data.length > 0 ? parseLocalDate(data[data.length - 1].date) : new Date();
  const dataMap = new Map<string, HistoricalStatItem>();
  if (data) {
    for (const item of data) {
      dataMap.set(item.date, item);
    }
  }

  const windowEnd = new Date(anchor);
  windowEnd.setDate(anchor.getDate() - sectionOffset * 14);

  const points: ChartDayPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const current = new Date(windowEnd);
    current.setDate(windowEnd.getDate() - i);
    const dateStr = formatLocalDate(current);
    const item = dataMap.get(dateStr);
    let val: number | null = null;
    if (item) {
      if (platform === 'instagram' && item.instagram) {
        val = item.instagram[activeMetric] ?? null;
      } else if (platform === 'facebook' && item.facebook) {
        val = item.facebook[activeMetric] ?? null;
      } else if (platform === 'combined' && item.combined) {
        val = item.combined[activeMetric] ?? null;
      } else {
        val = item[activeMetric] ?? null;
      }
    }
    points.push({
      date: dateStr,
      hasData: Boolean(item),
      value: val,
      rawItem: item,
    });
  }
  return points;
}

export function formatRangeLabel(points: ChartDayPoint[]): string {
  if (!points || points.length === 0) return "";
  const first = parseLocalDate(points[0].date);
  const last = parseLocalDate(points[points.length - 1].date);
  const firstMonth = first.toLocaleDateString(undefined, { month: 'short' });
  const firstDay = first.getDate();
  const lastMonth = last.toLocaleDateString(undefined, { month: 'short' });
  const lastDay = last.getDate();
  const lastYear = last.getFullYear();

  if (first.getFullYear() !== lastYear) {
    return `${firstMonth} ${firstDay}, ${first.getFullYear()} – ${lastMonth} ${lastDay}, ${lastYear}`;
  }
  if (firstMonth === lastMonth) {
    return `${firstMonth} ${firstDay} – ${lastDay}, ${lastYear}`;
  }
  return `${firstMonth} ${firstDay} – ${lastMonth} ${lastDay}, ${lastYear}`;
}
