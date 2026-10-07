import fs from 'fs/promises';
import path from 'path';

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
const API_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

if (!IG_ACCESS_TOKEN || !IG_ACCOUNT_ID) {
  console.error("Missing IG_ACCESS_TOKEN or IG_ACCOUNT_ID environment variables.");
  process.exit(1);
}

async function fetchFromIG(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append('access_token', IG_ACCESS_TOKEN);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instagram API Error: ${response.status} ${response.statusText}\n${errorText}`);
  }
  return response.json();
}

async function runSync() {
  console.log("Starting Instagram Sync...");
  
  const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'analytics_raw.json');
  let data = {};
  
  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (e) {
    console.log("No existing analytics_raw.json found. Creating a fresh one.");
    data = {
      historical_stats: []
    };
  }

  // Ensure historical_stats array exists
  if (!data.historical_stats) {
    data.historical_stats = [];
  }

  try {
    // 1. Fetch Profile Info
    console.log("Fetching profile info...");
    const profileInfo = await fetchFromIG(IG_ACCOUNT_ID, {
      fields: 'name,username,profile_picture_url,biography,website,followers_count,follows_count,media_count'
    });
    data.profile_info = profileInfo;

    // 2. Fetch Account Insights (Day period)
    console.log("Fetching account insights...");
    // Some metrics might not be supported depending on account type, but these are standard for business
    let accountInsights = [];
    try {
      const insightsRes = await fetchFromIG(`${IG_ACCOUNT_ID}/insights`, {
        metric: 'reach,accounts_engaged,profile_views,website_clicks',
        metric_type: 'total_value',
        period: 'day'
      });
      accountInsights = insightsRes.data || [];
    } catch (e) {
      console.warn("Failed to fetch some account insights. They might not be supported for this account type.", e.message);
    }
    data.account_insights = accountInsights;

    // Accumulate Historical Stats
    const today = new Date().toISOString().split('T')[0];
    
    // Extract totals for today
    const extractTotal = (name) => {
      const metric = accountInsights.find(i => i.name === name);
      return metric?.total_value?.value || 0;
    };

    const todayStats = {
      date: today,
      reach: extractTotal('reach'),
      engaged: extractTotal('accounts_engaged'),
      views: extractTotal('profile_views'),
      clicks: extractTotal('website_clicks'),
      followers: profileInfo.followers_count || 0
    };

    // Replace if same day, otherwise append
    const existingIndex = data.historical_stats.findIndex(s => s.date === today);
    if (existingIndex >= 0) {
      data.historical_stats[existingIndex] = todayStats;
    } else {
      data.historical_stats.push(todayStats);
    }

    // 3. Fetch Media Posts
    console.log("Fetching media posts...");
    const mediaRes = await fetchFromIG(`${IG_ACCOUNT_ID}/media`, {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
    });
    data.media_posts = mediaRes.data || [];

    // 4. Fetch Media Insights (Limit to recent posts to avoid rate limits)
    console.log("Fetching media insights...");
    data.media_insights = data.media_insights || {};
    
    // Only fetch insights for the last 10 posts
    const recentPosts = data.media_posts.slice(0, 10);
    for (const post of recentPosts) {
      try {
        let metrics = 'reach,saved,shares';
        
        const insightsRes = await fetchFromIG(`${post.id}/insights`, { metric: metrics });
        // Normalize names for UI consistency (e.g., carousel_album_reach -> reach)
        const normalizedInsights = (insightsRes.data || []).map(i => {
          if (i.name === 'carousel_album_reach') i.name = 'reach';
          return i;
        });
        
        data.media_insights[post.id] = normalizedInsights;
      } catch (e) {
        console.warn(`Failed to fetch insights for post ${post.id}:`, e.message);
      }
    }

    // Save back to file
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    console.log(`Successfully updated ${dataPath}`);

  } catch (error) {
    console.error("Sync Failed:", error);
    process.exit(1);
  }
}

runSync();
