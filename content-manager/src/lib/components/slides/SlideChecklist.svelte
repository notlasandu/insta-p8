<script lang="ts">
  import type { SlideChecklist } from '$lib/types/slide';
  let { headline, questions, image }: SlideChecklist = $props();
</script>

<div class="absolute top-[120px] left-[80px] right-[80px] h-[1000px] flex gap-12">
  <div class="w-[55%] flex flex-col justify-center gap-12">
    <h1 class="text-[64px] leading-[1.1] font-bold text-[#2D2D35] tracking-[-0.03em] mb-4">
      {headline}
    </h1>
    <div class="flex flex-col gap-10">
      {#each questions as q, i}
        <div class="flex gap-6 items-start">
          <div class="flex-shrink-0 mt-1 w-12 h-12 rounded-full bg-[#F5F6F8] border border-[#D0D0D5] flex items-center justify-center text-[24px] font-bold text-[#4A4B5A]">
            {i + 1}
          </div>
          <div>
            <h2 class="text-[36px] font-bold text-[#2D2D35] leading-tight tracking-[-0.02em]">{q.question}</h2>
            {#if q.description}
              <p class="text-[28px] text-[#818090] mt-2 leading-[1.3] font-medium">{q.description}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="w-[45%] h-full py-8">
    <div class="w-full h-full rounded-[48px] overflow-hidden shadow-lg border border-gray-100">
      <img src={image} class="w-full h-full object-cover" alt="" />
    </div>
  </div>
</div>
