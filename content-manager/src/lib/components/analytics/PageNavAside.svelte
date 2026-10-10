<script lang="ts">
  let { hasTrends = false }: { hasTrends?: boolean } = $props();
</script>

<aside class="w-64 shrink-0 hidden lg:block sticky top-24">
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
    <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-3">On this page</h3>
    <nav class="space-y-1">
      <a href="#profile" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Profile</a>
      <a href="#insights" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Insights</a>
      {#if hasTrends}
        <a href="#reach" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Trends</a>
      {/if}
      <a href="#suggestions" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Suggestions</a>
      <a href="#bullseye" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Bullseye</a>
      <a href="#recent" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Posts</a>
    </nav>
  </div>
</aside>
