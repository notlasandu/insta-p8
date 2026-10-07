<script lang="ts">
  import type { PageData } from './$types';
  import { resolve } from '$app/paths';

  let { data }: { data: PageData } = $props();
  let accounts = $derived(data.accounts || []);
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Accounts Hub</h1>
      </div>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-6 py-12">
    <div class="mb-10 text-center">
      <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Select an Account</h2>
      <p class="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Choose a social media account below to view its historical analytics, insights, and content pipeline.</p>
    </div>

    {#if accounts.length === 0}
      <div class="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No Accounts Configured</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6">There are no accounts set up in the registry yet. All account configuration is managed via the codebase.</p>
        <div class="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-800">
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">How to add an account:</p>
          <ol class="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
            <li>Open the project in your IDE.</li>
            <li>Create a new directory: <code>src/lib/data/accounts/your_account_id/</code></li>
            <li>Add the required JSON files (e.g. <code>posts.json</code>, <code>analytics_raw.json</code>) inside it.</li>
            <li>Register the account by adding an entry to <code>src/lib/data/accounts_registry.json</code>.</li>
          </ol>
          <p class="text-xs text-slate-500 mt-4 italic">See the .agents/ACCOUNT_SETUP_GUIDE.md for detailed instructions.</p>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each accounts as account}
          <a href={resolve(`/a/${account.id}`)} class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col items-center text-center">
            <img src={account.avatar_url} alt={account.name} class="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-sm mb-4 group-hover:scale-105 transition-transform" />
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{account.name}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{account.description}</p>
          </a>
        {/each}
      </div>
    {/if}
  </main>
</div>
