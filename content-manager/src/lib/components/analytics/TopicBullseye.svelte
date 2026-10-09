<script lang="ts">
  import { persistDetails } from "$lib/utils/persistDetails";

  let { mediaPosts, bullseyeData } = $props<{
    mediaPosts: any[];
    bullseyeData: { rings: Array<{ ring: number; audience: string; post_ids: string[] }> };
  }>();

  let postRingMap = $derived.by(() => {
    const map = new Map<string, number>();
    bullseyeData.rings.forEach(r => r.post_ids.forEach((id: string) => map.set(id, r.ring)));
    return map;
  });

  let dots = $derived(mediaPosts.map(post => {
    const ring = postRingMap.get(post.id);
    if (!ring) return null;
    const angle = Math.random() * Math.PI * 2;
    const minR = (ring - 1) * 0.2 + 0.05;
    const maxR = ring * 0.2 - 0.05;
    const r = minR + Math.random() * (maxR - minR);
    return { ...post, ring, x: 50 + (r * Math.cos(angle) * 50), y: 50 + (r * Math.sin(angle) * 50) };
  }).filter(Boolean));

  let selectedPost = $state<any>(null);
  let hoveredRing = $state<number | null>(null);
  let activeRingInfo = $derived(hoveredRing !== null ? bullseyeData.rings.find(r => r.ring === hoveredRing) : null);

  function ringColor(r: number) {
    return r === 1 ? '#EF4444' : r === 2 ? '#F97316' : r === 3 ? '#F59E0B' : r === 4 ? '#38BDF8' : '#1E3A5F';
  }

  function updateCoords(clientX: number, clientY: number, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const radius = rect.width / 2;
    const norm = Math.hypot(x - radius, y - radius) / radius;
    hoveredRing = norm <= 0.20 ? 1 : norm <= 0.40 ? 2 : norm <= 0.60 ? 3 : norm <= 0.80 ? 4 : norm <= 1.00 ? 5 : null;
  }

  function handleTouch(e: TouchEvent) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updateCoords(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
    }
  }
</script>

<details open use:persistDetails={'topic_bullseye'} class="mb-12 group [&::-webkit-details-marker]:hidden" id="bullseye">
  <summary class="cursor-pointer select-none flex items-center justify-between gap-2 mb-6 outline-none">
    <h2 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>
      <span>Bullseye</span>
    </h2>
    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 transform transition-transform group-open:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </summary>

  <div class="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mb-8">
    <div class="bg-slate-900 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[360px] sm:min-h-[500px]">
      <div class="w-full flex items-center justify-center min-h-[44px] mb-3 sm:mb-4 px-2 z-10">
        {#if activeRingInfo}
          <div class="bg-slate-800/95 text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg max-w-full text-center">
            <span class="px-2 py-0.5 rounded font-black text-white text-[11px] shrink-0" style="background-color: {ringColor(activeRingInfo.ring)}">Ring {activeRingInfo.ring}</span>
            <span class="font-medium text-slate-200 text-left line-clamp-2 break-words">{activeRingInfo.audience}</span>
          </div>
        {:else}
          <span class="text-xs text-slate-400 font-medium">Hover or tap any ring to inspect audience</span>
        {/if}
      </div>

      <div 
        class="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[460px] aspect-square rounded-full shadow-lg flex items-center justify-center cursor-crosshair select-none touch-none"
        onmousemove={(e) => updateCoords(e.clientX, e.clientY, e.currentTarget)}
        onmouseleave={() => { hoveredRing = null; }}
        ontouchstart={handleTouch}
        ontouchmove={handleTouch}
        role="presentation">
        <div class="pointer-events-none absolute inset-0 rounded-full bg-[#1E3A5F] transition-all {hoveredRing === 5 ? 'ring-4 ring-white/50' : ''}"></div>
        <div class="pointer-events-none absolute w-[80%] h-[80%] rounded-full bg-[#38BDF8] transition-all {hoveredRing === 4 ? 'ring-4 ring-white/60' : ''}"></div>
        <div class="pointer-events-none absolute w-[60%] h-[60%] rounded-full bg-[#F59E0B] transition-all {hoveredRing === 3 ? 'ring-4 ring-white/70' : ''}"></div>
        <div class="pointer-events-none absolute w-[40%] h-[40%] rounded-full bg-[#F97316] transition-all {hoveredRing === 2 ? 'ring-4 ring-white/80' : ''}"></div>
        <div class="pointer-events-none absolute w-[20%] h-[20%] rounded-full bg-[#EF4444] flex items-center justify-center transition-all {hoveredRing === 1 ? 'ring-4 ring-white' : ''}">
          <span class="text-base sm:text-2xl select-none">🎯</span>
        </div>

        {#each dots as dot}
          <button 
            type="button"
            aria-label="Inspect post in Ring {dot.ring}"
            class="absolute w-5 h-5 sm:w-5 sm:h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white cursor-pointer transition-transform hover:scale-150 z-30 {dot.ring === 5 ? 'bg-red-600 animate-pulse' : 'bg-white'} {selectedPost === dot ? 'scale-150 ring-4 ring-white ring-offset-2 ring-offset-slate-900' : ''}"
            style="left: {dot.x}%; top: {dot.y}%"
            onclick={(e) => { e.stopPropagation(); selectedPost = dot; }}>
          </button>
        {/each}
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[500px] overflow-y-auto">
      <h3 class="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 shrink-0">Selected Post</h3>
      {#if selectedPost}
        <div class="flex-1">
          <div class="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">Ring {selectedPost.ring}</div>
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span>❤️ {selectedPost.like_count}</span>
            <span>💬 {selectedPost.comments_count}</span>
          </div>
          {#if selectedPost.thumbnail_url || selectedPost.media_url}
            <img src={selectedPost.thumbnail_url || selectedPost.media_url} alt="Post thumbnail" class="w-full aspect-[4/5] object-cover rounded-lg mb-3" />
          {/if}
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{selectedPost.caption}</p>
        </div>
      {:else}
        <div class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm text-center py-6">
          <svg class="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
          Tap a ring or dot on the bullseye<br/>to inspect post details
        </div>
      {/if}
    </div>
  </div>
</details>
