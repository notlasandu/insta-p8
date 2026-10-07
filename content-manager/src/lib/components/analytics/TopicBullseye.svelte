<script lang="ts">
  let { mediaPosts, bullseyeData } = $props<{
    mediaPosts: any[];
    bullseyeData: { rings: Array<{ ring: number; audience: string; post_ids: string[] }> };
  }>();

  let postRingMap = $derived.by(() => {
    const map = new Map<string, number>();
    bullseyeData.rings.forEach((r) => {
      r.post_ids.forEach((id: string) => {
        map.set(id, r.ring);
      });
    });
    return map;
  });

  let dots = $derived(mediaPosts.map(post => {
    const ring = postRingMap.get(post.id);
    if (!ring) return null;
    
    const angle = Math.random() * Math.PI * 2;
    const minR = (ring - 1) * 0.2 + 0.05;
    const maxR = ring * 0.2 - 0.05;
    const r = minR + Math.random() * (maxR - minR);
    
    const x = 50 + (r * Math.cos(angle) * 50);
    const y = 50 + (r * Math.sin(angle) * 50);
    
    return { ...post, ring, x, y };
  }).filter(Boolean));

  let selectedPost = $state<any>(null);
  let hoveredRing = $state<number | null>(null);
  let mousePos = $state<{ x: number; y: number } | null>(null);

  let activeRingInfo = $derived(
    hoveredRing !== null ? bullseyeData.rings.find(r => r.ring === hoveredRing) : null
  );

  function handleMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePos = { x, y };

    const radius = rect.width / 2;
    const dist = Math.hypot(x - radius, y - radius);
    const norm = dist / radius;

    if (norm <= 0.20) hoveredRing = 1;
    else if (norm <= 0.40) hoveredRing = 2;
    else if (norm <= 0.60) hoveredRing = 3;
    else if (norm <= 0.80) hoveredRing = 4;
    else if (norm <= 1.00) hoveredRing = 5;
    else hoveredRing = null;
  }

  function handleMouseLeave() {
    hoveredRing = null;
    mousePos = null;
  }
</script>

<details open class="mb-12 group [&::-webkit-details-marker]:hidden" id="bullseye">
  <summary class="cursor-pointer select-none flex items-center justify-between mb-6 outline-none">
    <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>
      Topic Bullseye Strategy
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 mb-8">
    <div class="bg-slate-900 dark:bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
      
      {#if activeRingInfo && mousePos}
        <div 
          class="absolute z-40 pointer-events-none transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-full pb-3"
          style="left: {mousePos.x}px; top: {mousePos.y}px;"
        >
          <div class="bg-slate-900/95 text-white px-3.5 py-2 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs whitespace-nowrap backdrop-blur-md">
            <span class="px-2 py-0.5 rounded font-black text-white" style="background-color: {
              activeRingInfo.ring === 1 ? '#EF4444' :
              activeRingInfo.ring === 2 ? '#F97316' :
              activeRingInfo.ring === 3 ? '#F59E0B' :
              activeRingInfo.ring === 4 ? '#38BDF8' :
              '#1E3A5F'
            }">Ring {activeRingInfo.ring}</span>
            <span class="font-medium text-slate-200">{activeRingInfo.audience}</span>
          </div>
        </div>
      {/if}

      <div 
        class="relative w-full max-w-[540px] aspect-square rounded-full shadow-lg flex items-center justify-center cursor-crosshair select-none"
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
        role="presentation"
      >
        <div class="pointer-events-none absolute inset-0 rounded-full bg-[#1E3A5F] transition-all {hoveredRing === 5 ? 'ring-4 ring-white/50' : ''}"></div>
        <div class="pointer-events-none absolute w-[80%] h-[80%] rounded-full bg-[#38BDF8] transition-all {hoveredRing === 4 ? 'ring-4 ring-white/60' : ''}"></div>
        <div class="pointer-events-none absolute w-[60%] h-[60%] rounded-full bg-[#F59E0B] transition-all {hoveredRing === 3 ? 'ring-4 ring-white/70' : ''}"></div>
        <div class="pointer-events-none absolute w-[40%] h-[40%] rounded-full bg-[#F97316] transition-all {hoveredRing === 2 ? 'ring-4 ring-white/80' : ''}"></div>
        <div class="pointer-events-none absolute w-[20%] h-[20%] rounded-full bg-[#EF4444] flex items-center justify-center transition-all {hoveredRing === 1 ? 'ring-4 ring-white' : ''}">
          <span class="text-xl sm:text-2xl select-none">🎯</span>
        </div>

        {#each dots as dot}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div 
            class="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white cursor-pointer transition-transform hover:scale-150 z-30 {dot.ring === 5 ? 'bg-red-600 animate-pulse' : 'bg-white'} {selectedPost === dot ? 'scale-150 ring-4 ring-white ring-offset-2 ring-offset-slate-900' : ''}"
            style="left: {dot.x}%; top: {dot.y}%"
            onclick={(e) => { e.stopPropagation(); selectedPost = dot; }}
          ></div>
        {/each}
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[600px] overflow-y-auto">
      <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex-shrink-0">Selected Post</h3>
      {#if selectedPost}
        <div class="flex-1">
          <div class="font-bold text-slate-800 dark:text-slate-100 mb-1">Ring {selectedPost.ring}</div>
          <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <span>❤️ {selectedPost.like_count}</span>
            <span>💬 {selectedPost.comments_count}</span>
          </div>
          {#if selectedPost.thumbnail_url || selectedPost.media_url}
            <img src={selectedPost.thumbnail_url || selectedPost.media_url} alt="Post thumbnail" class="w-full aspect-[4/5] object-cover rounded-lg mb-4" />
          {/if}
          <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{selectedPost.caption}</p>
        </div>
      {:else}
        <div class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center">
          <svg class="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
          Click a dot on the bullseye<br/>to view the post
        </div>
      {/if}
    </div>
  </div>
</details>

