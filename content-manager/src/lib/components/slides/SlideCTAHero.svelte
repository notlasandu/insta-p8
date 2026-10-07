<script lang="ts">
  import type { SlideCTAHero } from '$lib/types/slide';
  let { image, headline, subheadline, callToAction }: SlideCTAHero = $props();
</script>

<div class="absolute top-[120px] left-0 right-[80px] h-[600px] rounded-r-[56px] overflow-hidden shadow-md">
  <img src={image} class="w-full h-full object-cover" alt="" />
</div>
<div class="absolute top-[780px] left-[80px] right-[80px]">
  <h1 class="text-[84px] leading-[1.05] font-bold text-[#2D2D35] tracking-[-0.04em]">
    {headline}
  </h1>
  <div class="mt-8 text-[44px] leading-[1.3] font-medium text-[#2D2D35] tracking-[-0.02em]">
    {#if subheadline}
      <p>{subheadline}</p>
    {/if}
    {#if callToAction}
      <p class="mt-1">
        <!-- We will just inject the CTA text, it can contain HTML or we just parse basic markup. -->
        {@html callToAction.replace(/"([^"]+)"/g, '<span class="font-bold text-[#818090]">"$1"</span>')}
      </p>
    {/if}
  </div>
</div>
