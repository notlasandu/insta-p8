<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let passcode = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  let rawRedirect = $derived(page.url.searchParams.get('redirect') || '/');
  let redirectPath = $derived(
    rawRedirect.startsWith('/api') || rawRedirect.startsWith('/gate') ? '/a/berl_view' : rawRedirect
  );

  async function handleUnlock(e: Event) {
    e.preventDefault();
    if (!passcode.trim() || loading) return;

    loading = true;
    error = null;

    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        goto(redirectPath);
      } else {
        error = data.error || 'Incorrect passcode';
      }
    } catch {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4">
  <div class="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
    <div class="mb-6 flex flex-col items-center text-center">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>
      <h1 class="text-xl font-bold tracking-tight">Protected Content Suite</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Enter the access passcode to view this dashboard.
      </p>
    </div>

    <form onsubmit={handleUnlock} class="space-y-4">
      <div class="space-y-1.5">
        <input
          type="password"
          placeholder="Enter passcode..."
          bind:value={passcode}
          oninput={() => error = null}
          class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-center text-lg tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {#if error}
          <p class="text-center text-xs font-medium text-rose-500">
            {error}
          </p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={loading || !passcode.trim()}
        class="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {#if loading}
          <svg class="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Unlocking...</span>
        {:else}
          <span>Unlock Dashboard</span>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        {/if}
      </button>
    </form>

    <div class="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <svg class="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
      <span>Passcode session persists for 30 days</span>
    </div>
  </div>
</div>
