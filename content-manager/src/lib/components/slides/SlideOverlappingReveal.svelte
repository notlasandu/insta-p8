<script lang="ts">
  import type { SlideOverlappingReveal } from '$lib/types/slide';
  let { headline, bgImage, fgImage, subheadline1, subheadline2 }: SlideOverlappingReveal = $props();
</script>

<div class="absolute top-[120px] left-[80px] right-[80px]">
  <h1 class="text-[84px] leading-[1.05] font-bold text-[#2D2D35] tracking-[-0.04em]">
    {headline}
  </h1>
</div>
<div class="absolute top-[280px] left-[80px] right-[80px] h-[520px]">
  <!-- Background Image (Point Cloud) -->
  <div class="absolute top-0 -right-[140px] w-[86%] h-[85%] rounded-[48px] overflow-hidden border border-gray-300 shadow-sm relative">
    <img src={bgImage} class="w-full h-full object-cover bg-white" alt="" />
    <!-- Progress Overlay -->
    <div class="absolute bottom-10 left-[48%] -translate-x-1/2 flex flex-col items-center">
      <span class="text-[52px] leading-none font-bold text-black tracking-tight">63%</span>
      <span class="text-[20px] font-bold text-black mt-1">Reconstructing</span>
      <div class="w-[200px] h-[14px] bg-gray-200 rounded-full mt-3 overflow-hidden shadow-inner">
        <div class="w-[63%] h-full bg-black rounded-full"></div>
      </div>
    </div>
  </div>
  
  <!-- Curved Arrow SVG -->
  <div class="absolute bottom-[20px] left-[42%] w-[120px] h-[60px]">
    <svg viewBox="0 0 100 50" fill="none" stroke="#6b7280" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full overflow-visible opacity-80">
      <path d="M 0,45 Q 60,35 85,10" />
      <path d="M 60,10 L 90,5 L 85,35" />
    </svg>
  </div>

  <!-- Foreground Image (BTS) -->
  <div class="absolute bottom-0 -left-[20px] w-[40%] h-[100%] rounded-[40px] overflow-hidden shadow-2xl">
    <img src={fgImage} class="w-full h-full object-cover" alt="" />
  </div>
</div>
<div class="absolute top-[840px] left-[80px] right-[80px]">
  {#if subheadline1}
    <p class="text-[44px] leading-[1.3] font-medium text-[#2D2D35] tracking-[-0.02em]">
      {subheadline1}
    </p>
  {/if}
  {#if subheadline2}
    <p class="text-[44px] leading-[1.3] font-medium text-[#2D2D35] tracking-[-0.02em]">
      {subheadline2}
    </p>
  {/if}
</div>
