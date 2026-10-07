<script lang="ts">
  import type { SlideTextOverGrid } from '$lib/types/slide';
  let { headline, images }: SlideTextOverGrid = $props();
</script>

<div class="absolute top-[120px] left-[80px] right-[80px]">
  <h1 class="text-[84px] leading-[1.05] font-bold text-[#2D2D35] tracking-[-0.04em]">
    {headline}
  </h1>
</div>
<div class="absolute top-[340px] left-[80px] right-[80px] h-[720px] rounded-[56px] overflow-hidden shadow-lg border border-gray-100 flex">
  {#if images && images.length === 3}
    <!-- Left half -->
    <div class="w-1/2 h-full relative border-r-2 border-white/20">
      <img src={images[0].src} class="w-full h-full object-cover" alt="" />
      <span class="absolute bottom-8 left-8 text-white text-[44px] font-bold tracking-tight drop-shadow-md">{images[0].label}</span>
    </div>
    <!-- Right half -->
    <div class="w-1/2 h-full flex flex-col">
      <div class="w-full h-1/2 relative border-b-2 border-white/20">
        <img src={images[1].src} class="w-full h-full object-cover" alt="" />
        <span class="absolute bottom-6 left-8 text-white text-[44px] font-bold tracking-tight drop-shadow-md">{images[1].label}</span>
      </div>
      <div class="w-full h-1/2 relative">
        <img src={images[2].src} class="w-full h-full object-cover" alt="" />
        <span class="absolute bottom-6 left-8 text-white text-[44px] font-bold tracking-tight drop-shadow-md">{images[2].label}</span>
      </div>
    </div>
  {:else if images && images.length > 0}
    <img src={images[0].src} class="w-full h-full object-cover" alt="" />
  {/if}
</div>
