export interface HistoricalStatItem {
  date: string;
  reach: number;
  engaged: number;
  views: number;
  clicks: number;
  followers: number;
}

export type ChartMetric = 'reach' | 'engaged' | 'views' | 'clicks' | 'followers';

export interface ChartDayPoint {
  date: string;
  hasData: boolean;
  value: number | null;
  rawItem?: HistoricalStatItem;
}
