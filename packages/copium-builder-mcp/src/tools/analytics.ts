import { supabase, getDefaultUser } from '../db.js';
import { z } from 'zod';

export const analyticsTools = [
  {
    name: 'get_account_overview',
    description: 'Get profile details, follower counts, and account metadata across Instagram and Facebook.',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account ID or handle (defaults to active user account)' }
      }
    }
  },
  {
    name: 'get_historical_analytics',
    description: 'Fetch daily time-series analytics (reach, impressions, engagement, views, followers) across Instagram and Facebook.',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account ID (default: berl_view)' },
        startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
        limit: { type: 'number', description: 'Maximum days of historical data to retrieve (default: 30)' }
      }
    }
  },
  {
    name: 'get_top_posts',
    description: 'Retrieve published posts ranked by engagement, likes, comments, or reach.',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account ID (default: berl_view)' },
        sortBy: {
          type: 'string',
          enum: ['likes', 'comments', 'shares'],
          description: 'Metric to rank by (default: likes)'
        },
        limit: { type: 'number', description: 'Max number of posts to return (default: 10, max: 50)' }
      }
    }
  },
  {
    name: 'get_growth_summary',
    description: 'Calculate recent audience growth, reach momentum, and engagement rate deltas.',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account ID (default: berl_view)' }
      }
    }
  }
];

export async function handleAnalyticsTools(name: string, args: any) {
  const accountId = args?.accountId || 'berl_view';

  if (name === 'get_account_overview') {
    const user = await getDefaultUser();
    const { data: latestDaily } = await supabase
      .from('account_daily_analytics')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            user: {
              id: user?.id,
              username: user?.username,
              page_id: user?.page_id,
              business_account_id: user?.business_account_id,
              ai_reply_enabled: user?.groq_auto_reply_enabled
            },
            latest_metrics: latestDaily || null
          }, null, 2)
        }
      ]
    };
  }

  if (name === 'get_historical_analytics') {
    let query = supabase
      .from('account_daily_analytics')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: true });

    if (args?.startDate) {
      query = query.gte('date', args.startDate);
    }
    if (args?.endDate) {
      query = query.lte('date', args.endDate);
    }
    const limit = Math.min(Number(args?.limit) || 30, 365);
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ count: data?.length || 0, historical_stats: data || [] }, null, 2)
        }
      ]
    };
  }

  if (name === 'get_top_posts') {
    const sortBy = args?.sortBy || 'likes';
    const limit = Math.min(Number(args?.limit) || 10, 50);

    const { data, error } = await supabase
      .from('content_posts')
      .select('*')
      .eq('account_id', accountId)
      .order(sortBy, { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ count: data?.length || 0, top_posts: data || [] }, null, 2)
        }
      ]
    };
  }

  if (name === 'get_growth_summary') {
    const { data, error } = await supabase
      .from('account_daily_analytics')
      .select('date, reach, engaged, views, followers')
      .eq('account_id', accountId)
      .order('date', { ascending: false })
      .limit(14);

    if (error) throw new Error(error.message);
    const records = data || [];
    const latest = records[0];
    const previous = records[1];

    const summary = {
      current_date: latest?.date || null,
      current_followers: latest?.followers || 0,
      follower_growth_24h: latest && previous ? (latest.followers || 0) - (previous.followers || 0) : 0,
      current_reach_24h: latest?.reach || 0,
      reach_delta_24h: latest && previous ? (latest.reach || 0) - (previous.reach || 0) : 0,
      total_days_recorded: records.length
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(summary, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown analytics tool: ${name}`);
}
