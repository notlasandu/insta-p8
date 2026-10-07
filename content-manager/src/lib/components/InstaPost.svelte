<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, disableScaling = false }: { children: Snippet, disableScaling?: boolean } = $props();
  
  let innerHeight = $state(1000);
  let scale = $state(1);

  $effect(() => {
    if (!disableScaling && innerHeight > 0) {
      // 1080x1350 is the standard Instagram Portrait size
      // Leave 64px padding for UI
      const targetHeight = innerHeight - 64; 
      scale = targetHeight / 1350;
    } else if (disableScaling) {
      scale = 1;
    }
  });
</script>

<svelte:window bind:innerHeight />

<div class="insta-post-wrapper flex-shrink-0 relative" 
     style="width: {disableScaling ? '1080px' : `calc(1080px * ${scale})`}; height: {disableScaling ? '1350px' : `calc(1350px * ${scale})`};">
  <div class="insta-post bg-white shadow-2xl overflow-hidden relative origin-top-left insta-export-target"
       style="transform: scale({scale}); width: 1080px; height: 1350px;">
    {@render children()}
  </div>
</div>
