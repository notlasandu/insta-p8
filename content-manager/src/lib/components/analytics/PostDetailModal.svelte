<script lang="ts">
  let {
    isOpen = $bindable(false),
    post = null
  }: {
    isOpen: boolean;
    post: any;
  } = $props();

  let copied = $state(false);

  function close() {
    isOpen = false;
  }

  async function copyCaption() {
    if (post?.caption) {
      await navigator.clipboard.writeText(post.caption);
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }
</script>

{#if isOpen && post}
  <div 
    class="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm transition-opacity"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="0"
    aria-label="Close modal">
  </div>

  <div class="fixed z-60 inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-4xl lg:max-w-5xl h-[92vh] md:h-[620px] bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl border-t md:border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
    <div class="md:hidden pt-2.5 pb-1 flex justify-center shrink-0">
      <div class="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
    </div>

    <div class="w-full md:w-1/2 lg:w-[54%] bg-slate-950 flex items-center justify-center shrink-0 relative overflow-hidden h-56 sm:h-72 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
      {#if post.thumbnail_url || post.media_url}
        <img src={post.thumbnail_url || post.media_url} alt="Post preview" class="w-full h-full object-contain" />
      {:else}
        <div class="text-xs text-slate-500 font-semibold">No Media Preview</div>
      {/if}

      <div class="absolute top-3 left-3 flex items-center gap-1.5 md:hidden">
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur {post.platform === 'facebook' ? 'bg-blue-600 text-white' : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white'}">
          {post.platform}
        </span>
      </div>

      <a 
        href={post.permalink} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label={`Open on ${post.platform === 'facebook' ? 'Facebook' : 'Instagram'}`}
        title={`Open on ${post.platform === 'facebook' ? 'Facebook' : 'Instagram'}`}
        class="absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg text-white {post.platform === 'facebook' ? 'bg-blue-600/90 hover:bg-blue-600' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95'} backdrop-blur active:scale-95 transition-all flex items-center justify-center cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </a>
    </div>

    <div class="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 min-w-0">
      <div class="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <span class="hidden md:inline-flex text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full {post.platform === 'facebook' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'}">
            {post.platform}
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {new Date(post.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </span>
        </div>
        <button 
          onclick={close}
          aria-label="Close"
          class="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5">
        <div class="shrink-0 flex items-center justify-around bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
          <div><div class="text-[11px] text-slate-400 font-medium">Likes</div><div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">{post.like_count}</div></div>
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <div><div class="text-[11px] text-slate-400 font-medium">Comments</div><div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">{post.comments_count}</div></div>
          {#if typeof post.reach_count === 'number' && post.reach_count > 0}
            <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <div><div class="text-[11px] text-slate-400 font-medium">Reach</div><div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">{post.reach_count.toLocaleString()}</div></div>
          {/if}
          {#if typeof post.views_count === 'number' && post.views_count > 0}
            <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <div><div class="text-[11px] text-slate-400 font-medium">Views</div><div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">{post.views_count.toLocaleString()}</div></div>
          {/if}
          {#if typeof post.shares_count === 'number' && post.shares_count > 0}
            <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <div><div class="text-[11px] text-slate-400 font-medium">Shares</div><div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">{post.shares_count.toLocaleString()}</div></div>
          {/if}
        </div>

        {#if post.avg_watch_time || post.clicks_count}
          <div class="shrink-0 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {#if post.avg_watch_time}
              <span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Avg Watch: {post.avg_watch_time}s</span>
            {/if}
            {#if post.clicks_count}
              <span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Clicks: {post.clicks_count}</span>
            {/if}
          </div>
        {/if}

        {#if post.analysis}
          <div class="shrink-0 p-3.5 {post.platform === 'facebook' ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40' : 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40'} rounded-2xl border">
            <h4 class="text-[10px] font-bold {post.platform === 'facebook' ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'} uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              Visual Analysis
            </h4>
            <p class="text-xs {post.platform === 'facebook' ? 'text-blue-950 dark:text-blue-200' : 'text-purple-950 dark:text-purple-200'} leading-relaxed">
              {post.analysis}
            </p>
          </div>
        {/if}

        <div class="flex-1 flex flex-col min-h-[220px] sm:min-h-[280px] bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
          <div class="flex items-center justify-between mb-2 shrink-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Caption</span>
            <button onclick={copyCaption} class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
              {copied ? '✓ Copied' : 'Copy Caption'}
            </button>
          </div>
          <p class="flex-1 overflow-y-auto text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pr-1">
            {post.caption || 'No caption text'}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
