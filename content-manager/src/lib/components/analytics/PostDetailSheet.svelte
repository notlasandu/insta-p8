<script lang="ts">
  import BottomSheet from "./BottomSheet.svelte";

  let {
    isOpen = $bindable(false),
    post = null
  }: {
    isOpen: boolean;
    post: any;
  } = $props();

  let copied = $state(false);

  async function copyCaption() {
    if (post?.caption) {
      await navigator.clipboard.writeText(post.caption);
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }
</script>

<BottomSheet bind:isOpen title="Post Details & Insights">
  {#if post}
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span class="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full {post.platform === 'facebook' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}">
          {post.platform}
        </span>
        <span>{new Date(post.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl relative">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Caption Copy</span>
          <button onclick={copyCaption} class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p class="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
          {post.caption || 'No caption text'}
        </p>
      </div>

      <a 
        href={post.permalink} 
        target="_blank" 
        rel="noopener noreferrer"
        class="w-full min-h-[46px] rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md {post.platform === 'facebook' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95'} active:scale-98 transition-transform">
        <span>Open on {post.platform === 'facebook' ? 'Facebook' : 'Instagram'}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </a>
    </div>
  {/if}
</BottomSheet>
