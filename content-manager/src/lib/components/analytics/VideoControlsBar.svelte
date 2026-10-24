<script lang="ts">
  let {
    currentTime = 0,
    duration = 0,
    progressPercent = 0,
    isMuted = false,
    show = false,
    onSeek,
    onToggleMute
  }: {
    currentTime: number;
    duration: number;
    progressPercent: number;
    isMuted: boolean;
    show: boolean;
    onSeek: (e: MouseEvent) => void;
    onToggleMute: (e: MouseEvent) => void;
  } = $props();

  function formatTime(sec: number): string {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  }
</script>

<div class="absolute inset-x-0 bottom-0 px-4 pt-8 pb-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 z-20 transition-opacity duration-200 {show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}">
  <button
    type="button"
    aria-label="Seek video progress"
    onclick={onSeek}
    class="w-full py-1.5 flex items-center cursor-pointer group/bar outline-none bg-transparent border-0 p-0 text-left"
  >
    <div class="w-full h-1 group-hover/bar:h-1.5 bg-white/25 rounded-full overflow-hidden transition-all relative">
      <div class="h-full bg-white rounded-full transition-all duration-75" style="width: {progressPercent}%;"></div>
    </div>
  </button>

  <div class="flex items-center justify-between text-[11px] font-semibold text-white/90 px-0.5">
    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
    <button
      type="button"
      onclick={onToggleMute}
      aria-label={isMuted ? 'Unmute' : 'Mute'}
      class="p-1 -mr-1 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90 hover:text-white cursor-pointer"
    >
      {#if isMuted}
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
      {:else}
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      {/if}
    </button>
  </div>
</div>
