<script lang="ts">
  import type { SlideFeatureFocus } from '$lib/types/slide';
  let { headline, subheadline, image, features }: SlideFeatureFocus = $props();
</script>

<div class="absolute top-[120px] left-[80px] right-[80px]">
  <h1 class="text-[76px] leading-[1.05] font-bold text-[#2D2D35] tracking-[-0.04em] w-[85%]">
    {headline}
  </h1>
  {#if subheadline}
    <p class="text-[40px] leading-[1.3] font-medium text-[#4A4B5A] mt-4 tracking-[-0.02em] w-[85%]">
      {subheadline}
    </p>
  {/if}
</div>

<div class="absolute top-[420px] left-[80px] right-[80px] h-[680px] flex gap-12">
  <div class="w-[55%] h-full rounded-[56px] overflow-hidden shadow-lg relative">
    <img src={image} class="w-full h-full object-cover" alt="" />
    <!-- Small tech overlay -->
    <div class="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2 rounded-[16px] shadow-sm flex items-center gap-2">
      <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
      <span class="text-[20px] font-bold text-[#2D2D35] tracking-tight">Interactive</span>
    </div>
  </div>
  <div class="w-[45%] flex flex-col justify-center gap-10 pl-6 border-l-[3px] border-[#F5F6F8]">
    {#each features as feature}
      <div>
        <h3 class="text-[36px] font-bold text-[#2D2D35] tracking-[-0.02em]">{feature.title}</h3>
        <p class="text-[28px] text-[#818090] mt-2 leading-[1.3] font-medium">{feature.description}</p>
      </div>
    {/each}
  </div>
</div>
