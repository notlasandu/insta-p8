<script lang="ts">
  import type { SlideDualImage } from '$lib/types/slide';
  let { images, tagline, headline, subheadline }: SlideDualImage = $props();
</script>

<div class="absolute top-[120px] left-0 w-full h-[580px] flex gap-5">
  <!-- Left Image -->
  <div class="w-1/2 h-full rounded-r-[48px] overflow-hidden shadow-md relative">
    <img src={images?.[0]} class="w-full h-full object-cover" alt="" />
    <div class="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md p-3 rounded-[20px] shadow-sm flex items-center justify-center">
      <span class="material-icons text-[#2D2D35] text-[32px]">360</span>
    </div>
  </div>
  <!-- Right Image -->
  <div class="w-1/2 h-full rounded-l-[48px] overflow-hidden shadow-md relative">
    <img src={images?.[1]} class="w-full h-full object-cover" alt="" />
  </div>
</div>

<div class="absolute top-[760px] left-[80px] right-[80px]">
  {#if tagline}
    <span class="text-[28px] text-[#A0A0AA] font-medium border-b border-[#D0D0D5] pb-1 inline-block">
      {tagline}
    </span>
  {/if}
  <h1 class="text-[88px] leading-[1.05] font-bold text-[#2D2D35] tracking-[-0.04em] mt-3">
    {headline}
  </h1>
  {#if subheadline}
    <p class="text-[44px] leading-[1.3] font-medium text-[#4A4B5A] mt-4 tracking-[-0.02em]">
      {subheadline}
    </p>
  {/if}
</div>
