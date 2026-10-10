<script lang="ts">
  import { persistDetails } from "$lib/utils/persistDetails";
  import ContentCard from "./ContentCard.svelte";
  import PostDetailModal from "./PostDetailModal.svelte";
  import PostPlatformDropdown from "./PostPlatformDropdown.svelte";
  import PostSortDropdown from "./PostSortDropdown.svelte";

  let {
    posts = [],
    facebookPosts = [],
    mediaInsights = {},
    postAnalysisData = {}
  } = $props<{
    posts: any[];
    facebookPosts?: any[];
    mediaInsights?: Record<string, any[]>;
    postAnalysisData?: Record<string, string>;
  }>();

  let activeTab = $state<'instagram' | 'facebook' | 'all'>('instagram');
  let sortBy = $state<'date' | 'reach'>('date');
  let selectedPost = $state<any>(null);
  let isModalOpen = $state(false);

  function getInsightVal(postId: string, name: string) {
    return mediaInsights[postId]?.find((i: any) => i.name === name)?.values?.[0]?.value;
  }

  let igItems = $derived(
    posts.map((p) => {
      const skipRate = getInsightVal(p.id, 'reels_skip_rate');
      const avgWatch = getInsightVal(p.id, 'ig_reels_avg_watch_time');
      return {
        id: p.id,
        caption: p.caption,
        timestamp: p.timestamp,
        media_type: p.media_type || 'POST',
        media_url: p.media_url,
        thumbnail_url: p.thumbnail_url || p.media_url,
        permalink: p.permalink,
        like_count: p.like_count || 0,
        comments_count: p.comments_count || 0,
        shares_count: getInsightVal(p.id, 'shares') || 0,
        saved_count: getInsightVal(p.id, 'saved') || 0,
        reach_count: getInsightVal(p.id, 'reach') || 0,
        views_count: getInsightVal(p.id, 'views') || 0,
        skip_rate: typeof skipRate === 'number' ? skipRate : undefined,
        avg_watch_time: typeof avgWatch === 'number' ? Math.round(avgWatch / 1000) : undefined,
        platform: 'instagram' as const,
        analysis: postAnalysisData[p.id]
      };
    })
  );

  let fbItems = $derived(
    facebookPosts.map((p) => ({
      id: p.id,
      caption: p.caption || '',
      timestamp: p.timestamp || p.created_time,
      media_type: p.media_type || 'POST',
      media_url: p.media_url,
      thumbnail_url: p.thumbnail_url || p.media_url,
      permalink: p.permalink,
      like_count: p.like_count || 0,
      comments_count: p.comments_count || 0,
      shares_count: p.shares_count || 0,
      reach_count: p.reach_count || p.views_count || 0,
      views_count: p.views_count || 0,
      clicks_count: p.clicks_count || 0,
      avg_watch_time: p.avg_watch_time || 0,
      video_views: p.video_views || 0,
      complete_views: p.complete_views || 0,
      retention_graph: p.retention_graph || null,
      replays_count: p.replays_count || 0,
      saved_count: 0,
      platform: 'facebook' as const,
      analysis: postAnalysisData[p.id]
    }))
  );

  function sortItems(items: any[]) {
    return [...items].sort((a, b) => {
      if (sortBy === 'reach' && (b.reach_count || 0) !== (a.reach_count || 0)) {
        return (b.reach_count || 0) - (a.reach_count || 0);
      }
      return (new Date(b.timestamp || 0).getTime()) - (new Date(a.timestamp || 0).getTime());
    });
  }

  let displayedItems = $derived.by(() => {
    const raw = activeTab === 'instagram' ? igItems : activeTab === 'facebook' ? fbItems : [...igItems, ...fbItems];
    return sortItems(raw);
  });

  function openDetails(item: any) {
    selectedPost = item;
    isModalOpen = true;
  }
</script>

<details open use:persistDetails={'published_content'} class="mb-12 group/section [&::-webkit-details-marker]:hidden" id="recent">
  <summary class="cursor-pointer select-none flex items-center justify-between gap-2 mb-4 sm:mb-6 outline-none">
    <h2 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
      <span>Posts</span>
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open/section:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="grid grid-cols-2 gap-2 w-full sm:hidden mb-4">
    <PostPlatformDropdown bind:activeTab igCount={igItems.length} fbCount={fbItems.length} />
    <PostSortDropdown bind:activeSort={sortBy} />
  </div>

  <div class="hidden sm:flex items-center justify-between gap-3 mb-6">
    <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
      <button 
        class="px-3 sm:px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'instagram' ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'}"
        onclick={() => activeTab = 'instagram'}>
        <span class="w-2 h-2 rounded-full bg-pink-500"></span>
        Instagram ({igItems.length})
      </button>
      <button 
        class="px-3 sm:px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'facebook' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'}"
        onclick={() => activeTab = 'facebook'}>
        <span class="w-2 h-2 rounded-full bg-blue-600"></span>
        Facebook ({fbItems.length})
      </button>
      <button 
        class="px-3 sm:px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'}"
        onclick={() => activeTab = 'all'}>
        <span class="w-2 h-2 rounded-full bg-slate-900 dark:bg-white"></span>
        All ({igItems.length + fbItems.length})
      </button>
    </div>

    <PostSortDropdown bind:activeSort={sortBy} />
  </div>

  <div class="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-5">
    {#each displayedItems as item (item.id)}
      <ContentCard {item} onOpenDetails={() => openDetails(item)} />
    {/each}
  </div>
</details>

<PostDetailModal bind:isOpen={isModalOpen} post={selectedPost} />
