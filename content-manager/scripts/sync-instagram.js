import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exkefrxudvgxymaulopu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2Vmcnh1ZHZneHltYXVsb3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM4MzIsImV4cCI6MjEwMjk3OTgzMn0.YIgapOjJ59LTZ8bJjp4hDTPph5yOas3jtRzLgGUKbGQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

let ACCESS_TOKEN = process.env.ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  try {
    const configPath = path.join(process.env.USERPROFILE || 'C:\\Users\\Lasandu', '.gemini', 'config', 'mcp_config.json');
    const mcpRaw = await fs.readFile(configPath, 'utf-8');
    const mcp = JSON.parse(mcpRaw);
    ACCESS_TOKEN = mcp?.mcpServers?.meta?.env?.META_ACCESS_TOKEN;
  } catch (e) {
    // fallback failed
  }
}

if (!ACCESS_TOKEN) {
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('access_token')
      .or(`business_account_id.eq.${process.env.IG_ACCOUNT_ID || '17841423877461958'},id.eq.1618667293386976`)
      .limit(1)
      .maybeSingle();

    if (userRow?.access_token) {
      ACCESS_TOKEN = userRow.access_token;
    } else {
      const { data: anyUser } = await supabase.from('users').select('access_token').limit(1).maybeSingle();
      if (anyUser?.access_token) {
        ACCESS_TOKEN = anyUser.access_token;
      }
    }
  } catch (e) {
    // Supabase query failed
  }
}

const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID || '17841423877461958';
const FB_PAGE_ID = process.env.FB_PAGE_ID || '1353894244476166';
const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

if (!ACCESS_TOKEN) {
  console.error("Missing ACCESS_TOKEN environment variable or database token.");
  process.exit(1);
}

async function fetchFromMeta(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append('access_token', ACCESS_TOKEN);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta API Error (${endpoint}): ${response.status} ${response.statusText}\n${errorText}`);
  }
  return response.json();
}

async function runSync() {
  console.log("Starting Meta Sync with Supabase integration...");

  const targetAccount = process.env.TARGET_ACCOUNT || 'copiumbuilder';
  const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'accounts', targetAccount, 'analytics_raw.json');
  let data = {};

  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (e) {
    console.log("No existing local analytics_raw.json found. Creating in-memory structure.");
    data = { historical_stats: [] };
  }

  try {
    // 1. Fetch Instagram Profile Info
    console.log("Fetching Instagram profile info...");
    const igProfile = await fetchFromMeta(IG_ACCOUNT_ID, {
      fields: 'name,username,profile_picture_url,biography,website,followers_count,follows_count,media_count'
    });
    data.profile_info = igProfile;

    // 2. Fetch Facebook Page Profile Info
    console.log("Fetching Facebook page profile info...");
    const fbProfile = await fetchFromMeta(FB_PAGE_ID, {
      fields: 'id,name,fan_count,followers_count,picture,about,link'
    });
    data.facebook_profile_info = fbProfile;

    // 3. Fetch Instagram Account Insights (Day)
    console.log("Fetching Instagram account insights...");
    let igInsights = [];
    try {
      const insightsRes = await fetchFromMeta(`${IG_ACCOUNT_ID}/insights`, {
        metric: 'reach,accounts_engaged,profile_views,website_clicks',
        metric_type: 'total_value',
        period: 'day'
      });
      igInsights = insightsRes.data || [];
    } catch (e) {
      console.warn("Instagram insights warning:", e.message);
    }
    data.account_insights = igInsights;

    // 4. Fetch Facebook Account Insights (Day)
    console.log("Fetching Facebook page insights...");
    let fbInsights = [];
    try {
      const fbInsightsRes = await fetchFromMeta(`${FB_PAGE_ID}/insights`, {
        metric: 'page_post_engagements,page_daily_follows,page_views_total,page_video_views',
        period: 'day'
      });
      fbInsights = fbInsightsRes.data || [];
    } catch (e) {
      console.warn("Facebook insights warning:", e.message);
    }
    data.facebook_account_insights = fbInsights;

    // 5. Extract Totals for Today
    const today = new Date().toISOString().split('T')[0];
    const extractIg = (name) => igInsights.find(i => i.name === name)?.total_value?.value || 0;
    const extractFb = (name) => {
      const metric = fbInsights.find(i => i.name === name);
      const val = metric?.values?.[metric?.values?.length - 1]?.value;
      return typeof val === 'number' ? val : 0;
    };

    const igStats = {
      reach: extractIg('reach'),
      engaged: extractIg('accounts_engaged'),
      views: extractIg('profile_views'),
      clicks: extractIg('website_clicks'),
      followers: igProfile.followers_count || 0
    };

    const fbStats = {
      reach: 0,
      engaged: extractFb('page_post_engagements'),
      views: extractFb('page_views_total'),
      clicks: 0,
      followers: fbProfile.followers_count || 0
    };

    const combinedStats = {
      reach: igStats.reach + fbStats.reach,
      engaged: igStats.engaged + fbStats.engaged,
      views: igStats.views + fbStats.views,
      clicks: igStats.clicks + fbStats.clicks,
      followers: igStats.followers + fbStats.followers
    };

    const todayStats = {
      date: today,
      reach: combinedStats.reach,
      engaged: combinedStats.engaged,
      views: combinedStats.views,
      clicks: combinedStats.clicks,
      followers: combinedStats.followers,
      instagram: igStats,
      facebook: fbStats,
      combined: combinedStats
    };

    // 6. Fetch Instagram Media Posts & Insights
    console.log("Fetching Instagram media posts...");
    const mediaRes = await fetchFromMeta(`${IG_ACCOUNT_ID}/media`, {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
    });
    data.media_posts = mediaRes.data || [];

    data.media_insights = data.media_insights || {};
    const recentIgPosts = data.media_posts.slice(0, 10);
    for (const post of recentIgPosts) {
      try {
        const insightsRes = await fetchFromMeta(`${post.id}/insights`, { metric: 'reach,saved,shares' });
        const normalized = (insightsRes.data || []).map(i => {
          if (i.name === 'carousel_album_reach') i.name = 'reach';
          return i;
        });
        data.media_insights[post.id] = normalized;
      } catch (e) {
        console.warn(`Failed to fetch insights for IG post ${post.id}:`, e.message);
      }
    }

    // 7. Fetch Facebook Published Posts
    console.log("Fetching Facebook published posts...");
    const fbPostsRes = await fetchFromMeta(`${FB_PAGE_ID}/published_posts`, {
      fields: 'id,message,created_time,shares,reactions.summary(true),comments.summary(true),permalink_url,attachments{media,type,title,url,target}'
    });

    data.facebook_posts = (fbPostsRes.data || []).map(p => {
      const attachment = p.attachments?.data?.[0];
      return {
        id: p.id,
        caption: p.message || '',
        created_time: p.created_time,
        timestamp: p.created_time,
        media_type: attachment?.type === 'video_inline' ? 'VIDEO' : (attachment?.type || 'POST'),
        media_url: attachment?.media?.source || attachment?.media?.image?.src || '',
        thumbnail_url: attachment?.media?.image?.src || '',
        permalink: p.permalink_url,
        like_count: p.reactions?.summary?.total_count || 0,
        comments_count: p.comments?.summary?.total_count || 0,
        shares_count: p.shares?.count || 0
      };
    });

    // 8. Upsert into Supabase
    console.log("Upserting daily analytics to Supabase...");
    const { error: dailyErr } = await supabase.rpc('upsert_daily_analytics', {
      p_account_id: targetAccount,
      p_date: today,
      p_reach: todayStats.reach,
      p_engaged: todayStats.engaged,
      p_views: todayStats.views,
      p_clicks: todayStats.clicks,
      p_followers: todayStats.followers,
      p_instagram: todayStats.instagram,
      p_facebook: todayStats.facebook,
      p_combined: todayStats.combined
    });

    if (dailyErr) {
      console.warn("Supabase upsert_daily_analytics warning:", dailyErr.message);
    } else {
      console.log("Successfully upserted today's stats into Supabase!");
    }

    console.log("Upserting latest account snapshots to Supabase...");
    const { error: snapshotErr } = await supabase.rpc('upsert_latest_snapshot', {
      p_account_id: targetAccount,
      p_profile_info: data.profile_info,
      p_facebook_profile_info: data.facebook_profile_info,
      p_account_insights: data.account_insights,
      p_facebook_account_insights: data.facebook_account_insights,
      p_media_posts: data.media_posts,
      p_facebook_posts: data.facebook_posts,
      p_media_insights: data.media_insights
    });

    if (snapshotErr) {
      console.warn("Supabase upsert_latest_snapshot warning:", snapshotErr.message);
    } else {
      console.log("Successfully upserted latest snapshot into Supabase!");
    }

    // 9. Fetch Full Historical Records from Supabase
    console.log("Fetching full historical series from Supabase...");
    const { data: dbHistory, error: histErr } = await supabase
      .from('account_daily_analytics')
      .select('date, reach, engaged, views, clicks, followers, instagram, facebook, combined')
      .eq('account_id', targetAccount)
      .order('date', { ascending: true });

    if (!histErr && dbHistory && dbHistory.length > 0) {
      data.historical_stats = dbHistory;
      console.log(`Loaded ${dbHistory.length} historical day(s) from Supabase.`);
    } else {
      const existingIndex = (data.historical_stats || []).findIndex(s => s.date === today);
      if (existingIndex >= 0) {
        data.historical_stats[existingIndex] = todayStats;
      } else {
        data.historical_stats.push(todayStats);
      }
    }

    // 10. Update Local Cache File (if filesystem is writable)
    try {
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
      console.log(`Updated local cache at ${dataPath}`);
    } catch (fsErr) {
      console.log("Filesystem not writable (expected in serverless/readonly environments).");
    }

    console.log("Sync completed successfully!");

  } catch (error) {
    console.error("Sync Failed:", error);
    process.exit(1);
  }
}

runSync();
