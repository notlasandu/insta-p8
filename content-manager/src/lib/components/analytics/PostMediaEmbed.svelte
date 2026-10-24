<script lang="ts">
  import VideoControlsBar from "./VideoControlsBar.svelte";
  import VideoPulseAnimation from "./VideoPulseAnimation.svelte";

  let {
    mediaUrl = '',
    thumbnailUrl = '',
    isVideo = false
  }: {
    mediaUrl?: string;
    thumbnailUrl?: string;
    isVideo?: boolean;
  } = $props();

  let videoEl = $state<HTMLVideoElement | null>(null);
  let isPlaying = $state(false);
  let isMuted = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let hasVideoError = $state(false);
  let showProgress = $state(false);
  let isHovering = $state(false);
  let hideProgressTimer: any = null;
  let animAction = $state<'play' | 'pause' | null>(null);
  let animKey = $state(0);

  let progressPercent = $derived(duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0);

  function triggerAnimation(action: 'play' | 'pause') {
    animAction = action;
    animKey += 1;
  }

  function togglePlay() {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      isPlaying = true;
      triggerAnimation('play');
    } else {
      videoEl.pause();
      isPlaying = false;
      triggerAnimation('pause');
    }
  }

  function toggleMute(e: MouseEvent) {
    e.stopPropagation();
    if (videoEl) isMuted = videoEl.muted = !videoEl.muted;
  }

  function handleSeek(e: MouseEvent) {
    if (!duration || !videoEl) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    currentTime = videoEl.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  }

  function handleMouseMove() {
    isHovering = true;
    showProgress = true;
    if (hideProgressTimer) clearTimeout(hideProgressTimer);
    hideProgressTimer = setTimeout(() => showProgress = false, 2000);
  }

  function handleMouseLeave() {
    isHovering = false;
    showProgress = false;
    if (hideProgressTimer) clearTimeout(hideProgressTimer);
  }
</script>

<div
  class="w-full md:w-1/2 lg:w-[54%] bg-slate-950 flex items-center justify-center shrink-0 relative overflow-hidden h-72 sm:h-96 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 select-none group"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  role="region"
  aria-label="Media preview and video player"
>
  {#if isVideo && mediaUrl && !hasVideoError}
    <video
      bind:this={videoEl}
      src={mediaUrl}
      poster={thumbnailUrl || undefined}
      playsinline
      loop
      preload="metadata"
      class="w-full h-full object-contain bg-black cursor-pointer"
      onclick={togglePlay}
      ontimeupdate={() => videoEl && (currentTime = videoEl.currentTime)}
      onloadedmetadata={() => videoEl && (duration = videoEl.duration, isMuted = videoEl.muted)}
      onerror={() => hasVideoError = true}
    >
      <track kind="captions" />
    </video>

    {#if !isPlaying && currentTime === 0}
      <button
        type="button"
        onclick={togglePlay}
        aria-label="Start video"
        class="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl z-20 cursor-pointer"
      >
        <svg class="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>

      <button
        type="button"
        onclick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        class="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 hover:text-white shadow-lg active:scale-95 transition-all z-20 cursor-pointer"
      >
        {#if isMuted}
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        {:else}
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        {/if}
      </button>
    {/if}

    {#if animAction}
      <VideoPulseAnimation action={animAction} pulseKey={animKey} />
    {/if}

    {#if isPlaying || currentTime > 0}
      <VideoControlsBar
        {currentTime}
        {duration}
        {progressPercent}
        {isMuted}
        show={showProgress && isHovering}
        onSeek={handleSeek}
        onToggleMute={toggleMute}
      />
    {/if}
  {:else if thumbnailUrl || mediaUrl}
    <img src={thumbnailUrl || mediaUrl} alt="Post preview" class="w-full h-full object-contain" />
  {:else}
    <div class="text-xs text-slate-500 font-semibold">No Media Preview</div>
  {/if}
</div>
