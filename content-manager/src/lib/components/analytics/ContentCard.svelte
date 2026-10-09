<script lang="ts">
  let { item, onOpenDetails } = $props<{
    item: {
      id: string;
      caption: string;
      timestamp: string;
      media_type: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink: string;
      like_count: number;
      comments_count: number;
      shares_count?: number;
      reach_count?: number;
      saved_count?: number;
      platform: 'instagram' | 'facebook';
      analysis?: string;
      rawInsightsId?: string;
    };
    onOpenDetails?: () => void;
  }>();

  function formatCount(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(num);
  }
</script>

<button
  type="button"
  onclick={onOpenDetails}
  class="group relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
  aria-label={`View post details from ${item.platform}`}>
  
  {#if item.thumbnail_url || item.media_url}
    <img
      src={item.thumbnail_url || item.media_url}
      alt="Post preview"
      loading="lazy"
      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  {:else}
    <div class="w-full h-full flex items-center justify-center p-2 text-center text-[10px] font-semibold text-slate-400">
      No Preview
    </div>
  {/if}

  <div class="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10">
    <span 
      class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg backdrop-blur flex items-center justify-center text-white shadow-xs {item.platform === 'facebook' ? 'bg-blue-600/90' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'}"
      title={item.platform === 'facebook' ? 'Facebook' : 'Instagram'}>
      {#if item.platform === 'facebook'}
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      {:else}
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      {/if}
    </span>
  </div>

  <div class="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10">
    <span 
      class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/60 backdrop-blur flex items-center justify-center text-white/95 shadow-xs"
      title={item.media_type}>
      {#if item.media_type === 'VIDEO' || item.media_type === 'REEL'}
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5.14v14c0 .86.94 1.39 1.68.94l11-7a1.09 1.09 0 000-1.88l-11-7A1.1 1.1 0 008 5.14z"/></svg>
      {:else if item.media_type === 'CAROUSEL_ALBUM'}
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="13" height="13" rx="2" stroke-width="2"/><path d="M8 21h10a2 2 0 002-2V9" stroke-width="2" stroke-linecap="round"/></svg>
      {:else}
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      {/if}
    </span>
  </div>

  <div class="absolute inset-x-0 bottom-0 pt-8 pb-1.5 px-1.5 sm:pb-2.5 sm:px-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between text-white text-[10px] sm:text-xs font-semibold z-10">
    <div class="flex items-center gap-1.5 sm:gap-2.5 drop-shadow">
      <span class="flex items-center gap-0.5">
        <svg class="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        {formatCount(item.like_count)}
      </span>
      <span class="flex items-center gap-0.5">
        <svg class="w-3 h-3 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        {formatCount(item.comments_count)}
      </span>
    </div>

    {#if typeof item.reach_count === 'number' && item.reach_count > 0}
      <span class="hidden sm:flex items-center gap-0.5 text-[10px] text-emerald-300 drop-shadow">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        {formatCount(item.reach_count)}
      </span>
    {/if}
  </div>
</button>
