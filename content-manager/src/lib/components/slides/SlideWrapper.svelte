<script lang="ts">
  import type { Snippet } from 'svelte';

  let { 
    children, 
    index = 0, 
    showSwipe = false, 
    showLogo = false,
    theme = "light"
  }: { 
    children: Snippet, 
    index?: number, 
    showSwipe?: boolean, 
    showLogo?: boolean,
    theme?: "light" | "minimal"
  } = $props();
</script>

<div class="w-full h-full relative overflow-hidden font-sans flex flex-col tracking-[-0.02em] {theme === 'light' ? 'bg-white text-[#2D2D35]' : 'bg-white text-[#2F2D38]'}">
  
  {#if theme === 'light'}
    <!-- Abstract Background Shapes -->
    {#if index % 2 === 0}
      <!-- Even slides - Top Left / Bottom Right -->
      <div class="absolute -top-[200px] -left-[200px] w-[800px] h-[800px] bg-[#F5F6F8] rounded-full -z-10 pointer-events-none"></div>
      <div class="absolute -bottom-[200px] -right-[200px] w-[800px] h-[800px] bg-[#F5F6F8] rounded-full -z-10 pointer-events-none"></div>
    {:else}
      <!-- Odd slides - Top Right / Bottom Left -->
      <div class="absolute -top-[200px] -right-[200px] w-[800px] h-[800px] bg-[#F5F6F8] rounded-full -z-10 pointer-events-none"></div>
      <div class="absolute -bottom-[200px] -left-[200px] w-[800px] h-[800px] bg-[#F5F6F8] rounded-full -z-10 pointer-events-none"></div>
    {/if}
  {:else if theme === 'minimal'}
    <!-- Top Left Corner Graphic -->
    <div class="absolute top-[80px] left-[110px] w-32 h-32 border-t-[2.5px] border-l-[2.5px] border-[#918F9C] rounded-tl-[3.5rem] pointer-events-none"></div>
    <!-- Bottom Right Corner Graphic -->
    <div class="absolute top-[550px] right-[110px] w-32 h-32 border-b-[2.5px] border-r-[2.5px] border-[#918F9C] rounded-br-[3.5rem] pointer-events-none"></div>
  {/if}

  <!-- Slide Content Layer -->
  <div class="relative z-10 w-full h-full">
    {@render children()}

    <!-- Footers -->
    {#if showLogo}
      <div class="absolute bottom-[80px] left-[80px] flex items-center gap-4">
        <img src="/logo.svg" alt="Logo" class="h-[38px] w-auto mix-blend-multiply" />
        <span class="text-[28px] font-semibold tracking-wide text-[#4A4B5A]">Profile</span>
      </div>
    {:else if showSwipe}
      <div class="absolute bottom-[80px] left-[80px] flex items-center gap-3 text-[#818090]">
        <span class="text-[36px] font-medium tracking-tight">Swipe</span>
        <span class="text-[36px] font-light leading-none mt-1">&rarr;</span>
      </div>
    {/if}
  </div>
</div>
