<script lang="ts">
  let { profileInfo } = $props<{
    profileInfo: {
      name: string;
      profile_picture_url: string;
      biography: string;
      username: string;
      media_count: number;
      followers_count: number;
      id: string;
      website: string;
      follows_count: number;
      ig_id?: string;
    }
  }>();
</script>

<div class="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 mb-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
  <div class="flex items-center gap-4 md:gap-6">
    <img 
      src={profileInfo.profile_picture_url} 
      alt={profileInfo.name}
      class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm object-cover" 
    />
    
    <div>
      <h1 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        {profileInfo.name}
        <span class="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">✓</span>
      </h1>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">@{profileInfo.username}</p>
      
      {#if profileInfo.biography || profileInfo.website}
        <div class="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-md mt-1">
          {#if profileInfo.biography}
            {profileInfo.biography.split('\n')[0]} 
          {/if}
          {#if profileInfo.website}
            <a href={profileInfo.website} class="text-blue-500 dark:text-blue-400 hover:underline ml-2" target="_blank" rel="noopener noreferrer">
              {(() => { try { return new URL(profileInfo.website).hostname.replace('www.', ''); } catch { return profileInfo.website; } })()}
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="flex items-center gap-8 text-center md:text-right shrink-0">
    <div>
      <div class="text-xl font-black text-slate-900 dark:text-white">{profileInfo.followers_count.toLocaleString()}</div>
      <div class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Followers</div>
    </div>
    <div class="hidden sm:block">
      <div class="text-xl font-black text-slate-900 dark:text-white">{profileInfo.media_count.toLocaleString()}</div>
      <div class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Posts</div>
    </div>
    
    <details class="relative group [&::-webkit-details-marker]:hidden">
      <summary class="cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors list-none outline-none">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </summary>
      <div class="absolute right-0 mt-2 w-64 p-4 bg-slate-900 dark:bg-slate-800 text-slate-300 text-xs rounded-xl shadow-xl z-50 border border-slate-700">
        <div class="font-bold text-white mb-2 pb-2 border-b border-slate-700">API Metadata</div>
        <div class="space-y-1 font-mono">
          <p><span class="text-slate-500 dark:text-slate-400">ID:</span> {profileInfo.id}</p>
          <p><span class="text-slate-500 dark:text-slate-400">Following:</span> {profileInfo.follows_count}</p>
          <p><span class="text-slate-500 dark:text-slate-400">IG ID:</span> {profileInfo.ig_id || 'N/A'}</p>
        </div>
      </div>
    </details>
  </div>
</div>
