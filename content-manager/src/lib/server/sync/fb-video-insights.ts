import { fetchMetaEndpoint } from './meta-client';

export async function fetchFbVideoInsights(videoId: string, token: string) {
  try {
    const res = await fetchMetaEndpoint(`${videoId}/video_insights`, {}, token);
    const items = res.data || [];
    const retention = items.find((i: any) => i.name === 'post_video_retention_graph')?.values?.[0]?.value;
    const replays = items.find((i: any) => i.name === 'fb_reels_replay_count')?.values?.[0]?.value;
    const avgWatch = items.find((i: any) => i.name === 'post_video_avg_time_watched')?.values?.[0]?.value;
    return {
      retention_graph: retention || null,
      replays_count: typeof replays === 'number' ? replays : 0,
      avg_watch_time: typeof avgWatch === 'number' ? Math.round(avgWatch / 1000) : 0
    };
  } catch {
    return null;
  }
}
