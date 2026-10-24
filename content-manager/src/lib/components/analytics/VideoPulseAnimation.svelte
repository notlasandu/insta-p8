<script lang="ts">
  let {
    action = 'play',
    pulseKey = 0
  }: {
    action: 'play' | 'pause';
    pulseKey: number;
  } = $props();
</script>

{#key pulseKey}
  <div class="anim-pulse absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-30 shadow-2xl">
    {#if action === 'pause'}
      <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
    {:else}
      <svg class="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    {/if}
  </div>
{/key}

<style>
  @keyframes instagramPulse {
    0% {
      opacity: 0;
      transform: scale(0.65);
    }
    30% {
      opacity: 1;
      transform: scale(1.15);
    }
    60% {
      opacity: 0.9;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.25);
    }
  }

  .anim-pulse {
    animation: instagramPulse 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
