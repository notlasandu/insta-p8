<script lang="ts">
  import { persistDetails } from "$lib/utils/persistDetails";
  import ContentCard from "./ContentCard.svelte";
  import PostDetailModal from "./PostDetailModal.svelte";

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
  let selectedPost = $state<any>(null);
  let isModalOpen = $state(false);

  function getPostInsight(postId: string, name: string) {
    const insights = mediaInsights[postId];
    if (!insights) return null;
    return insights.find((i: any) => i.name === name);
  }

  let igItems = $derived(
    posts.map((p) => {
      const reach = getPostInsight(p.id, 'reach');
      const shares = getPostInsight(p.id, 'shares');
      const saved = getPostInsight(p.id, 'saved');
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
        shares_count: shares?.values?.[0]?.value || 0,
        saved_count: saved?.values?.[0]?.value || 0,
        reach_count: reach?.values?.[0]?.value || 0,
        platform: 'instagram' as const,
        analysis: postAnalysisData[p.id],
        rawInsightsId: reach?.id
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
      reach_count: 0,
      saved_count: 0,
      platform: 'facebook' as const,
      analysis: postAnalysisData[p.id],
      rawInsightsId: p.id
    }))
  );

  let displayedItems = $derived(
    activeTab === 'instagram' ? igItems : activeTab === 'facebook' ? fbItems : [...igItems, ...fbItems]
  );

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

  <div class="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl w-full sm:w-fit overflow-x-auto border border-slate-200 dark:border-slate-800">
    <button 
      class="px-3 sm:px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'instagram' ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}"
      onclick={() => activeTab = 'instagram'}>
      <span class="w-2 h-2 rounded-full bg-pink-500"></span>
      Instagram ({igItems.length})
    </button>
    <button 
      class="px-3 sm:px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'facebook' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}"
      onclick={() => activeTab = 'facebook'}>
      <span class="w-2 h-2 rounded-full bg-blue-600"></span>
      Facebook ({fbItems.length})
    </button>
    <button 
      class="px-3 sm:px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}"
      onclick={() => activeTab = 'all'}>
      <span class="w-2 h-2 rounded-full bg-slate-900 dark:bg-white"></span>
      All ({igItems.length + fbItems.length})
    </button>
  </div>

  <div class="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-5">
    {#each displayedItems as item (item.id)}
      <ContentCard {item} onOpenDetails={() => openDetails(item)} />
    {/each}
  </div>
</details>

<PostDetailModal bind:isOpen={isModalOpen} post={selectedPost} />
