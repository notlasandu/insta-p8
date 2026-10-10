import type { SupabaseClient } from '@supabase/supabase-js';
import type { MetaProfile, FacebookProfile, MetricItem, NormalizedPost } from './types';

export function calculateDailyStats(
  igProfile: MetaProfile,
  fbProfile: FacebookProfile,
  igInsights: MetricItem[],
  fbInsights: MetricItem[]
) {
  const today = new Date().toISOString().split('T')[0];
  const extractIg = (name: string) => igInsights.find((i) => i.name === name)?.total_value?.value || 0;
  const extractFb = (name: string) => {
    const metric = fbInsights.find((i) => i.name === name);
    const val = metric?.values?.[metric?.values?.length - 1]?.value;
    return typeof val === 'number' ? val : 0;
  };

  const instagram = {
    reach: extractIg('reach'),
    engaged: extractIg('accounts_engaged'),
    views: extractIg('profile_views'),
    clicks: extractIg('website_clicks'),
    followers: igProfile.followers_count || 0
  };

  const facebook = {
    reach: 0,
    engaged: extractFb('page_post_engagements'),
    views: extractFb('page_views_total'),
    clicks: 0,
    followers: fbProfile.followers_count || 0
  };

  const combined = {
    reach: instagram.reach + facebook.reach,
    engaged: instagram.engaged + facebook.engaged,
    views: instagram.views + facebook.views,
    clicks: instagram.clicks + facebook.clicks,
    followers: instagram.followers + facebook.followers
  };

  return {
    date: today,
    reach: combined.reach,
    engaged: combined.engaged,
    views: combined.views,
    clicks: combined.clicks,
    followers: combined.followers,
    instagram,
    facebook,
    combined
  };
}

export async function persistSyncData(
  supabase: SupabaseClient,
  accountId: string,
  payload: {
    igProfile: MetaProfile;
    fbProfile: FacebookProfile;
    igInsights: MetricItem[];
    fbInsights: MetricItem[];
    igMedia: any[];
    fbPosts: NormalizedPost[];
    mediaInsights: Record<string, any>;
  }
) {
  const dailyStats = calculateDailyStats(payload.igProfile, payload.fbProfile, payload.igInsights, payload.fbInsights);

  await supabase.rpc('upsert_daily_analytics', {
    p_account_id: accountId,
    p_date: dailyStats.date,
    p_reach: dailyStats.reach,
    p_engaged: dailyStats.engaged,
    p_views: dailyStats.views,
    p_clicks: dailyStats.clicks,
    p_followers: dailyStats.followers,
    p_instagram: dailyStats.instagram,
    p_facebook: dailyStats.facebook,
    p_combined: dailyStats.combined
  });

  await supabase.rpc('upsert_latest_snapshot', {
    p_account_id: accountId,
    p_profile_info: payload.igProfile,
    p_facebook_profile_info: payload.fbProfile,
    p_account_insights: payload.igInsights,
    p_facebook_account_insights: payload.fbInsights,
    p_media_posts: payload.igMedia,
    p_facebook_posts: payload.fbPosts,
    p_media_insights: payload.mediaInsights
  });

  const igPostRows = (payload.igMedia || []).map((post) => {
    const firstLine = (post.caption || '').split('\n')[0].trim().slice(0, 100);
    return {
      id: post.id,
      account_id: accountId,
      title: firstLine || 'Instagram Reel',
      status: 'POSTED',
      scheduled_date: post.timestamp,
      description: post.caption || '',
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      shares: 0,
      thumbnail: post.thumbnail_url || post.media_url || '',
      metadata: { platform: 'instagram', permalink: post.permalink }
    };
  });

  const fbPostRows = (payload.fbPosts || []).map((post) => {
    const firstLine = (post.caption || '').split('\n')[0].trim().slice(0, 100);
    return {
      id: post.id,
      account_id: accountId,
      title: firstLine || (post.media_type === 'VIDEO' ? 'Facebook Video' : 'Facebook Post'),
      status: 'POSTED',
      scheduled_date: post.timestamp,
      description: post.caption || '',
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      shares: post.shares_count || 0,
      thumbnail: post.thumbnail_url || post.media_url || '',
      metadata: {
        platform: 'facebook',
        reach: post.reach_count || 0,
        views: post.views_count || 0,
        clicks: post.clicks_count || 0,
        permalink: post.permalink
      }
    };
  });

  const allPosts = [...igPostRows, ...fbPostRows];
  if (allPosts.length > 0) {
    await supabase.from('content_posts').upsert(allPosts, { onConflict: 'id' });
  }
}
