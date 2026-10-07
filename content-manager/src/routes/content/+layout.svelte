<script lang="ts">
  import { page } from '$app/state';
  import { onMount, type Snippet } from 'svelte';
  
  let { children }: { children: Snippet } = $props();

  let isExport = $derived(page.url.searchParams.has('export'));
  let scrollContainer: HTMLElement | undefined = $state();

  onMount(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        if (scrollContainer) {
          scrollContainer.scrollLeft += e.deltaY;
        }
      }
    };
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  });
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<button onclick="{isExport ? window.location.href='?' : window.location.href='?export=true'}" 
   class="fixed top-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 font-medium transition-colors text-sm flex items-center gap-2">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
  {isExport ? 'Exit Export Mode' : 'Figma Export Mode (1:1)'}
</button>

<div bind:this={scrollContainer} class="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-start p-8 overflow-x-auto overflow-y-hidden">
  <div class="w-max flex gap-12 mx-auto">
    {@render children()}
  </div>
</div>
