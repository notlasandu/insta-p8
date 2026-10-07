<script lang="ts">
  import type { SlideHeroImageText } from '$lib/types/slide';
  let { image, headline, subheadline }: SlideHeroImageText = $props();
</script>

<div class="absolute top-[120px] left-[80px] right-[80px] h-[680px] rounded-[56px] overflow-hidden shadow-lg border border-gray-100">
  <img src={image} class="w-full h-full object-cover" alt="" />
  <div class="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3 rounded-[20px] shadow-md flex items-center justify-center">
    <span class="material-icons text-[#2D2D35] text-[32px]">360</span>
  </div>
</div>
<div class="absolute top-[860px] left-[80px] right-[80px]">
  <h1 class="text-[76px] leading-[1.05] font-bold text-[#2D2D35] tracking-[-0.04em]">
    {headline}
  </h1>
  {#if subheadline}
    <p class="text-[48px] leading-[1.25] font-medium text-[#4A4B5A] mt-4 tracking-[-0.02em]">
      {subheadline}
    </p>
  {/if}
</div>
