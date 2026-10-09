<script lang="ts">
  let {
    igProfile = { name: 'Profile', username: 'user', profile_picture_url: '', biography: '', website: '', media_count: 0 },
    fbProfile = { name: 'Facebook Page', about: '', picture: null },
    fbPostsCount = 0
  } = $props<{ igProfile?: any; fbProfile?: any; fbPostsCount?: number; }>();

  let fbPictureUrl = $derived(fbProfile?.picture?.data?.url || fbProfile?.profile_picture_url || '');
  let displayName = $derived(igProfile.name || fbProfile.name || 'Profile');
  let bioText = $derived(igProfile.biography || fbProfile.about || '');
  let websiteHost = $derived.by(() => {
    if (!igProfile.website) return '';
    try { return new URL(igProfile.website).hostname.replace('www.', ''); } catch { return igProfile.website; }
  });
</script>

{#snippet igBadge()}
  <span class="w-5 h-5 inline-flex items-center justify-center bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-full shadow-xs shrink-0" title="Instagram">
    <svg class="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  </span>
{/snippet}

{#snippet fbBadge()}
  <span class="w-5 h-5 inline-flex items-center justify-center bg-blue-600 text-white rounded-full shadow-xs shrink-0" title="Facebook">
    <svg class="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  </span>
{/snippet}

<div class="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
  <div class="md:hidden flex items-start gap-3.5">
    <div class="relative w-14 h-14 shrink-0">
      <img 
        src={igProfile.profile_picture_url || fbPictureUrl || 'https://ui-avatars.com/api/?name=Profile&background=random'} 
        alt={displayName}
        class="w-full h-full rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm object-cover" 
      />
      <div class="absolute -bottom-1 -right-1 flex items-center -space-x-1.5 z-10">
        {@render igBadge()}
        {@render fbBadge()}
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5 mb-0.5">
        <h2 class="text-base font-bold text-slate-900 dark:text-white truncate">{displayName}</h2>
        <span class="bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">✓</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
        @{igProfile.username} <span class="text-slate-300 dark:text-slate-600">•</span> Facebook Page
      </p>

      {#if bioText || websiteHost}
        <div class="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
          {bioText}
          {#if igProfile.website}
            <a href={igProfile.website} class="text-blue-500 dark:text-blue-400 hover:underline ml-1" target="_blank" rel="noopener noreferrer">{websiteHost}</a>
          {/if}
        </div>
      {/if}

      <div class="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{igProfile.media_count || 0} IG posts</span>
        <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{fbPostsCount || 0} FB posts</span>
      </div>
    </div>
  </div>

  <div class="hidden md:grid md:grid-cols-2 gap-6 divide-x divide-slate-100 dark:divide-slate-800">
    <div class="flex items-start gap-4">
      <div class="relative w-16 h-16 shrink-0">
        <img src={igProfile.profile_picture_url || 'https://ui-avatars.com/api/?name=IG&background=random'} alt={igProfile.name} class="w-full h-full rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm object-cover" />
        <div class="absolute -bottom-1 -right-1 z-10 flex">
          {@render igBadge()}
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5"><h2 class="text-lg font-bold text-slate-900 dark:text-white truncate">{igProfile.name}</h2><span class="bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">✓</span></div>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">@{igProfile.username}</p>
        {#if igProfile.biography || websiteHost}
          <div class="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
            {igProfile.biography || ''}
            {#if websiteHost}<a href={igProfile.website} class="text-blue-500 dark:text-blue-400 hover:underline ml-1" target="_blank" rel="noopener noreferrer">{websiteHost}</a>{/if}
          </div>
        {/if}
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{igProfile.media_count || 0} posts</span>
      </div>
    </div>

    <div class="flex items-start gap-4 pl-6">
      <div class="relative w-16 h-16 shrink-0">
        {#if fbPictureUrl}
          <img src={fbPictureUrl} alt={fbProfile.name} class="w-full h-full rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm object-cover" />
        {:else}
          <div class="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">FB</div>
        {/if}
        <div class="absolute -bottom-1 -right-1 z-10 flex">
          {@render fbBadge()}
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5"><h2 class="text-lg font-bold text-slate-900 dark:text-white truncate">{fbProfile.name}</h2><span class="bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">✓</span></div>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Facebook Page</p>
        {#if fbProfile.about}<div class="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">{fbProfile.about}</div>{/if}
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{fbPostsCount || 0} published posts</span>
      </div>
    </div>
  </div>
</div>
