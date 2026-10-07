<script lang="ts">
  import type { SlideQuoteMinimal } from '$lib/types/slide';
  let { image, text }: SlideQuoteMinimal = $props();

  // Process the text to match the design's typographic split
  // Assumes two sentences separated by ". "
  let s1_part1 = $state(''), s1_part2 = $state(''), s1_lastWord = $state('');
  let s2_part1 = $state(''), s2_part2 = $state(''), s2_part3 = $state('');

  $effect(() => {
    const sentences = (text || '').split('. ').map(s => s.trim());
    const sentence1 = sentences[0] || '';
    const sentence2 = (sentences[1] || '').replace(/\.$/, '');

    const words1 = sentence1.split(' ');
    s1_lastWord = words1.length > 0 ? words1.pop() + '.' : '';
    s1_part1 = words1.slice(0, 2).join(' ');
    s1_part2 = words1.slice(2).join(' ');

    const words2 = sentence2.split(' ');
    s2_part1 = words2.slice(0, 3).join(' ');
    s2_part2 = words2[3] || '';
    s2_part3 = words2.slice(4).join(' ') + (words2.length > 4 ? '.' : '');
  });
</script>

<!-- Typography -->
<div class="absolute top-[160px] left-[150px] right-[100px] z-10 flex flex-col gap-14">
  <!-- First Sentence Block -->
  <div class="flex flex-col gap-1">
    <h1 class="text-[#2F2D38] font-black text-[5.5rem] leading-[1.05] tracking-[-0.05em]">
      <div class="mb-1">{s1_part1}</div>
      <div class="flex items-center gap-4">
        <span>{s1_part2}</span>
        {#if s1_lastWord !== '.' && s1_lastWord !== ''}
          <span class="bg-[#32313D] text-[#E2E0F6] italic px-6 py-1 rounded-[1.2rem] font-bold pb-2 inline-block shadow-sm">
            {s1_lastWord}
          </span>
        {/if}
      </div>
    </h1>
  </div>

  <!-- Second Sentence Block -->
  <div class="flex flex-col gap-1 mt-2">
    <h2 class="text-[#848293] font-medium text-[4.5rem] leading-[1.05] tracking-[-0.04em]">
      <div class="mb-1">{s2_part1}</div>
      <div>
        <span>{s2_part2}</span> <span class="italic">{s2_part3}</span>
      </div>
    </h2>
  </div>
</div>

<!-- Image Element (Bottom 45%) -->
<div class="absolute bottom-[80px] left-[110px] right-[110px] h-[42%] z-20">
  <div class="w-full h-full relative overflow-hidden rounded-[2.5rem]">
    <img src={image} alt="Atmospheric Architecture" class="absolute inset-0 w-full h-full object-cover" />
  </div>
</div>
