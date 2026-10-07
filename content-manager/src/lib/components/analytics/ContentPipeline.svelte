<script lang="ts">
  import { resolve } from "$app/paths";
  import type { ContentItem } from "$lib/types/content";

  let { posts = [], mediaPosts = [] }: { posts: ContentItem[], mediaPosts: any[] } = $props();

  let filter = $state<string>('ALL');
  
  let filteredPosts = $derived(
    filter === 'ALL' ? posts : posts.filter(p => p.status === filter)
  );

  function getPublishedData(post: ContentItem) {
    if (post.status !== 'POSTED' || !post.scheduledDate) return null;
    const targetDate = new Date(post.scheduledDate);
    return mediaPosts.find(mp => {
      const pDate = new Date(mp.timestamp);
      return Math.abs(pDate.getTime() - targetDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'IDEA': return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      case 'IN_PROGRESS': return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
      case 'READY': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300';
      case 'POSTED': return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
      case 'NEEDS_REVISION': return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300';
      case 'SCRAPPED': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  }

  const statusOptions = ['ALL', 'IDEA', 'IN_PROGRESS', 'READY', 'POSTED', 'NEEDS_REVISION', 'SCRAPPED'];
</script>

<details open class="mb-12 group [&::-webkit-details-marker]:hidden">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <div class="flex items-center justify-between flex-1 pr-6">
      <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        Content Pipeline
      </h2>
      <div 
        class="flex gap-2 overflow-x-auto pb-2 -mb-2" 
        role="toolbar"
        tabindex="0"
        aria-label="Filter by content status"
        onclick={(e) => e.preventDefault()}
        onkeydown={(e) => e.stopPropagation()}
      >
        <div class="flex gap-2" role="presentation" onclick={(e) => e.stopPropagation()}>
          {#each statusOptions as opt}
            <button 
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap {filter === opt ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}"
              onclick={() => filter = opt}>
              {opt.replace('_', ' ')}
            </button>
          {/each}
        </div>
      </div>
    </div>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
    {#if filteredPosts.length === 0}
      <div class="p-8 text-center text-slate-500 dark:text-slate-400">No content found for this filter.</div>
    {/if}

    {#each filteredPosts as post (post.id)}
      {@const publishedMatch = getPublishedData(post)}
      <div class="group flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div class="md:w-1/4 shrink-0 flex flex-col items-start gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full {getStatusColor(post.status)}">
            {post.status.replace('_', ' ')}
          </span>
          <div class="font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{post.title}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString() : 'Unscheduled'}
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-2">
          {#if post.description}
            <div class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{post.description}</div>
          {/if}
          
          {#if post.status === 'IDEA' || post.status === 'IN_PROGRESS'}
            <div class="bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-md p-2 flex gap-2 items-start text-xs text-indigo-800 dark:text-indigo-300 mt-1">
              <span class="shrink-0 mt-0.5">💡</span>
              <p>Consider producing this as a <strong>Video/Reel</strong>. Based on recent analytics, videos generate 15x more engagement than carousels for venue walkthroughs.</p>
            </div>
          {/if}
        </div>

        <div class="md:w-1/4 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t border-slate-100 dark:border-slate-800 md:border-0 pt-3 md:pt-0">
          {#if publishedMatch}
            <div class="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-900/60 font-bold text-sm">
              <div class="flex items-center gap-1" title="Likes">
                <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {publishedMatch.like_count}
              </div>
              <div class="flex items-center gap-1" title="Comments">
                <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                {publishedMatch.comments_count}
              </div>
            </div>
          {:else}
            <a href={resolve(`/content/${post.id}`)} class="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-4 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/60">
              Open Design
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</details>

