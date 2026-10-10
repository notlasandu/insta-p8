export interface SyncResult {
  success: boolean;
  updated: boolean;
  reason?: string;
  last_updated?: string;
  error?: string;
}

export interface MetaProfile {
  id?: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
  biography?: string;
  website?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export interface FacebookProfile {
  id?: string;
  name?: string;
  fan_count?: number;
  followers_count?: number;
  picture?: {
    data?: {
      url?: string;
    };
  };
  about?: string;
  link?: string;
}

export interface MetricItem {
  name: string;
  period?: string;
  total_value?: { value: number };
  values?: Array<{ value: number | Record<string, number> }>;
}

export interface NormalizedPost {
  id: string;
  caption: string;
  timestamp: string;
  created_time?: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
  like_count: number;
  comments_count: number;
  shares_count?: number;
  reach_count?: number;
  views_count?: number;
  clicks_count?: number;
}
