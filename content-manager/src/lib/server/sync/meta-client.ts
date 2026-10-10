import type { SupabaseClient } from '@supabase/supabase-js';
import type { MetaProfile, FacebookProfile, MetricItem, NormalizedPost } from './types';
import { fetchFbVideoInsights } from './fb-video-insights';

const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export async function resolveAccessToken(supabase: SupabaseClient): Promise<string> {
  const envToken = process.env.ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
  if (envToken) return envToken;

  const { data: userRow } = await supabase
    .from('users')
    .select('access_token')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userRow?.access_token) return userRow.access_token;
  throw new Error('Missing Meta Access Token in environment and database.');
}

export async function fetchMetaEndpoint(endpoint: string, params: Record<string, string>, token: string) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append('access_token', token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, v);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta API Error (${endpoint}): ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

export async function fetchInstagramData(token: string, igAccountId: string) {
  const profilePromise = fetchMetaEndpoint(igAccountId, {
    fields: 'name,username,profile_picture_url,biography,website,followers_count,follows_count,media_count'
  }, token) as Promise<MetaProfile>;

  const insightsPromise = fetchMetaEndpoint(`${igAccountId}/insights`, {
    metric: 'reach,accounts_engaged,profile_views,website_clicks',
    metric_type: 'total_value',
    period: 'day'
  }, token).then((res) => (res.data || []) as MetricItem[]).catch(() => [] as MetricItem[]);

  const mediaPromise = fetchMetaEndpoint(`${igAccountId}/media`, {
    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
  }, token).then((res) => res.data || []).catch(() => []);

  const [profile, insights, media] = await Promise.all([profilePromise, insightsPromise, mediaPromise]);

  const recentMedia = media.slice(0, 10);
  const mediaInsightsRecord: Record<string, Array<{ name: string; values?: unknown }>> = {};

  const insightResults = await Promise.allSettled(
    recentMedia.map((post: { id: string; media_type?: string }) => {
      const metric = post.media_type === 'VIDEO'
        ? 'reach,saved,shares,views,ig_reels_avg_watch_time,reels_skip_rate'
        : 'reach,saved,shares';
      return fetchMetaEndpoint(`${post.id}/insights`, { metric }, token);
    })
  );

  insightResults.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      const postId = recentMedia[index].id;
      const normalized = (res.value.data || []).map((item: { name: string }) => ({
        ...item,
        name: item.name === 'carousel_album_reach' ? 'reach' : item.name
      }));
      mediaInsightsRecord[postId] = normalized;
    }
  });

  return { profile, insights, media, mediaInsights: mediaInsightsRecord };
}

export async function fetchFacebookData(token: string, pageId: string) {
  const profilePromise = fetchMetaEndpoint(pageId, {
    fields: 'id,name,fan_count,followers_count,picture,about,link'
  }, token) as Promise<FacebookProfile>;

  const insightsPromise = fetchMetaEndpoint(`${pageId}/insights`, {
    metric: 'page_post_engagements,page_daily_follows,page_views_total,page_video_views',
    period: 'day'
  }, token).then((res) => (res.data || []) as MetricItem[]).catch(() => [] as MetricItem[]);

  const postsPromise = fetchMetaEndpoint(`${pageId}/published_posts`, {
    fields: 'id,message,created_time,shares,reactions.summary(true),comments.summary(true),permalink_url,attachments{media,type,title,url,target}'
  }, token).then((res) => res.data || []).catch(() => []);

  const [profile, insights, rawPosts] = await Promise.all([profilePromise, insightsPromise, postsPromise]);

  const posts: NormalizedPost[] = rawPosts.map((p: any) => {
    const attachment = p.attachments?.data?.[0];
    return {
      id: p.id,
      caption: p.message || '',
      timestamp: p.created_time,
      created_time: p.created_time,
      media_type: attachment?.type === 'video_inline' ? 'VIDEO' : (attachment?.type || 'POST'),
      media_url: attachment?.media?.source || attachment?.media?.image?.src || '',
      thumbnail_url: attachment?.media?.image?.src || '',
      permalink: p.permalink_url,
      like_count: p.reactions?.summary?.total_count || 0,
      comments_count: p.comments?.summary?.total_count || 0,
      shares_count: p.shares?.count || 0,
      video_id: attachment?.target?.id
    };
  });

  const fbMetrics = 'post_total_media_view_unique,post_media_view,post_video_views,post_video_view_time,post_clicks';
  const postInsightResults = await Promise.allSettled(
    posts.map((post) => fetchMetaEndpoint(`${post.id}/insights`, { metric: fbMetrics }, token))
  );

  postInsightResults.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      const items = res.value.data || [];
      for (const item of items) {
        if (item.period && item.period !== 'lifetime') continue;
        const val = item.values?.[0]?.value;
        if (item.name === 'post_total_media_view_unique' && typeof val === 'number') posts[index].reach_count = val;
        if (item.name === 'post_media_view' && typeof val === 'number') posts[index].views_count = val;
        if (item.name === 'post_clicks' && typeof val === 'number') posts[index].clicks_count = val;
      }
      if (!posts[index].reach_count && posts[index].views_count) {
        posts[index].reach_count = posts[index].views_count;
      }
    }
  });

  const videoInsightResults = await Promise.allSettled(
    posts.map((post) => post.video_id ? fetchFbVideoInsights(post.video_id, token) : Promise.resolve(null))
  );

  videoInsightResults.forEach((res, index) => {
    if (res.status === 'fulfilled' && res.value) {
      if (res.value.retention_graph) posts[index].retention_graph = res.value.retention_graph;
      if (res.value.replays_count) posts[index].replays_count = res.value.replays_count;
      if (res.value.avg_watch_time) posts[index].avg_watch_time = res.value.avg_watch_time;
    }
  });

  return { profile, insights, posts };
}
