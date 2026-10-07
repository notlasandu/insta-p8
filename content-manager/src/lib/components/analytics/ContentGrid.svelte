<script lang="ts">
  let { posts, mediaInsights, postAnalysisData = {} } = $props<{
    posts: any[];
    mediaInsights: Record<string, any[]>;
    postAnalysisData: Record<string, string>;
  }>();

  function getPostInsight(postId: string, name: string) {
    const insights = mediaInsights[postId];
    if (!insights) return null;
    return insights.find(i => i.name === name);
  }
</script>

<details open class="mb-12 group/section [&::-webkit-details-marker]:hidden">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
      Published Content Performance
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open/section:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each posts as post}
      {@const reach = getPostInsight(post.id, 'reach')}
      {@const shares = getPostInsight(post.id, 'shares')}
      {@const saved = getPostInsight(post.id, 'saved')}
      
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group/card relative h-full max-h-[700px]">
        <a href={post.permalink} target="_blank" rel="noopener noreferrer" class="relative aspect-square block shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img 
            src={post.thumbnail_url || post.media_url} 
            alt="Post Thumbnail" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
          <div class="absolute top-3 right-3 z-10">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/50 backdrop-blur text-white rounded shadow-sm">
              {post.media_type.replace('_', ' ')}
            </span>
          </div>
          
          <div class="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 pointer-events-none z-10">
            <div class="flex items-center gap-3 flex-wrap text-white text-[11px] drop-shadow-md">
              <div class="flex items-center gap-1 font-bold" title="Likes">
                <svg class="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {post.like_count}
              </div>
              <div class="flex items-center gap-1 font-bold" title="Comments">
                <svg class="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {post.comments_count}
              </div>
              {#if shares}
                <div class="flex items-center gap-1 font-bold" title="Shares">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  {shares.values[0]?.value || 0}
                </div>
              {/if}
              {#if saved}
                <div class="flex items-center gap-1 font-bold" title="Saves">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                  {saved.values[0]?.value || 0}
                </div>
              {/if}
            </div>

            {#if reach}
              <div class="flex items-center gap-1 font-bold text-white/90 text-[10px] drop-shadow-md" title="Reach">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                {(reach.values[0]?.value || 0).toLocaleString()} Reach
              </div>
            {/if}
          </div>

          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center z-20">
            <span class="text-white text-xs font-bold flex items-center gap-1.5 bg-black/60 px-4 py-2 rounded-full backdrop-blur">
              View on Instagram
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </span>
          </div>
        </a>

        <div class="p-4 bg-purple-50/50 dark:bg-purple-950/30 flex-1 overflow-y-auto min-h-[100px]">
          <h4 class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Visual Analysis
          </h4>
          <p class="text-sm text-purple-900 dark:text-purple-200 leading-snug">
            {postAnalysisData[post.id] || "No analysis available."}
          </p>
        </div>

        <details class="group/details [&::-webkit-details-marker]:hidden bg-white dark:bg-slate-900 shrink-0 mt-auto border-t border-slate-100 dark:border-slate-800">
          <summary class="p-4 cursor-pointer text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-1 select-none outline-none">
            <svg class="w-4 h-4 transform transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            View Caption & Details
          </summary>
          
          <div class="absolute inset-0 z-40 bg-white dark:bg-slate-900 flex flex-col rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <div class="p-4 flex-1 overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/50">
              <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.caption}</p>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Posted: {new Date(post.timestamp).toLocaleString()}
              </div>
              
              <div class="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                <p class="font-medium text-slate-500 dark:text-slate-400 mb-2">Developer API Metadata</p>
                <div class="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg font-mono space-y-1.5 overflow-hidden shadow-sm">
                  <p class="truncate"><strong>ID:</strong> {post.id}</p>
                  {#if post.media_url}<p class="truncate"><strong>URL:</strong> <a href={post.media_url} class="text-indigo-500 dark:text-indigo-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Link</a></p>{/if}
                  {#if reach}<p class="truncate"><strong>Reach ID:</strong> {reach.id || 'N/A'}</p>{/if}
                </div>
              </div>
            </div>

            <button 
              class="w-full p-4 cursor-pointer text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-1 select-none outline-none bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0"
              onclick={(e) => { e.preventDefault(); (e.currentTarget.closest('details') as HTMLDetailsElement).open = false; }}
            >
              <svg class="w-4 h-4 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              Hide Caption & Details
            </button>
          </div>
        </details>
      </div>
    {/each}
  </div>
</details>

