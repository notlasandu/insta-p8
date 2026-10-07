<script lang="ts">
  import { exportPostsToDirectory } from '$lib/utils/export';

  let { children, id } = $props<{ children: any, id: string }>();

  let wrapperNode: HTMLElement;

  async function handleExport() {
    if (wrapperNode) {
      await exportPostsToDirectory([wrapperNode], id);
    }
  }
</script>

<div class="relative group">
  <div bind:this={wrapperNode}>
    {@render children()}
  </div>
  
  <button 
    class="absolute top-4 right-4 bg-slate-800 text-white rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-black hover:scale-105 active:scale-95"
    onclick={handleExport}
    title="Export Slide as PNG"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
  </button>
</div>
