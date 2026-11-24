import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/sync';

export const GET: RequestHandler = async ({ url }) => {
  const account = url.searchParams.get('account') || 'copiumbuilder';
  const limitParam = parseInt(url.searchParams.get('limit') || '6', 10);
  const limit = Math.min(Math.max(1, isNaN(limitParam) ? 6 : limitParam), 24);
  const includeTrials = url.searchParams.get('include_trials') === 'true';

  try {
    const supabase = getServerSupabase();

    const { data: snapshot, error: dbError } = await supabase
      .from('account_latest_snapshots')
      .select('media_posts, updated_at')
      .eq('account_id', account)
      .maybeSingle();

    if (dbError) {
      return json({ success: false, error: dbError.message }, { status: 500 });
    }

    const rawPosts: any[] = snapshot?.media_posts || [];

    // Filter for videos first
    let videoPosts = rawPosts.filter((p) => p.media_type === 'VIDEO');
    if (videoPosts.length === 0) {
      videoPosts = rawPosts;
    }

    // Exclude trial reels unless explicitly requested
    // Trial reels have is_shared_to_feed: false
    const filteredPosts = includeTrials
      ? videoPosts
      : videoPosts.filter((p) => p.is_shared_to_feed !== false);

    const formattedVideos = filteredPosts.slice(0, limit).map((post) => {
      const caption = post.caption || '';
      const firstLine = caption.split('\n')[0].trim().replace(/^Video\s+\d+\s*[-–:]\s*/i, '');
      const title = firstLine.length > 0 ? firstLine : 'Instagram Reel';
      const isTrial = post.is_shared_to_feed === false;

      return {
        id: post.id,
        title,
        caption,
        permalink: post.permalink,
        thumbnail: post.thumbnail_url || post.media_url || '',
        video_url: post.media_url || '',
        likes: post.like_count ?? 0,
        comments: post.comments_count ?? 0,
        date: post.timestamp,
        is_trial: isTrial,
        is_shared_to_feed: post.is_shared_to_feed ?? true
      };
    });

    return json(
      {
        success: true,
        account,
        count: formattedVideos.length,
        last_synced: snapshot?.updated_at || null,
        videos: formattedVideos
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err: any) {
    return json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
