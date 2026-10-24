<script lang="ts">
  import RetentionChart from "./RetentionChart.svelte";
  import PostMediaEmbed from "./PostMediaEmbed.svelte";

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

  let isVideo = $derived(
    post?.media_type === 'VIDEO' || 
    Boolean(post?.retention_graph) || 
    Boolean(post?.video_id) || 
    post?.permalink?.includes('/reel/')
  );
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

    <PostMediaEmbed
      mediaUrl={post.media_url}
      thumbnailUrl={post.thumbnail_url}
      platform={post.platform}
      {isVideo}
    />

    <div class="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 min-w-0">
      <div class="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          {#if post.permalink}
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open on ${post.platform === 'facebook' ? 'Facebook' : 'Instagram'}`}
              title={`Open on ${post.platform === 'facebook' ? 'Facebook' : 'Instagram'}`}
              class="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer {post.platform === 'facebook' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95'}"
            >
              {#if post.platform === 'facebook'}
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              {:else}
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              {/if}
            </a>
          {/if}
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

        {#if post.retention_graph || post.skip_rate !== undefined}
          <RetentionChart retentionGraph={post.retention_graph} skipRate={post.skip_rate} avgWatchTime={post.avg_watch_time} replaysCount={post.replays_count} />
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

        <div class="flex-1 flex flex-col min-h-[160px] bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
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
