export interface PlatformStatItem {
  reach: number;
  engaged: number;
  views: number;
  clicks: number;
  followers: number;
}

export interface HistoricalStatItem {
  date: string;
  reach: number;
  engaged: number;
  views: number;
  clicks: number;
  followers: number;
  instagram?: PlatformStatItem;
  facebook?: PlatformStatItem;
  combined?: PlatformStatItem;
}

export type PlatformFilter = 'combined' | 'instagram' | 'facebook';

export type ChartMetric = 'reach' | 'engaged' | 'views' | 'clicks' | 'followers';

export interface ChartDayPoint {
  date: string;
  hasData: boolean;
  value: number | null;
  rawItem?: HistoricalStatItem;
}
