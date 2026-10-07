<script lang="ts">
  import type { ContentItem } from "$lib/types/content";
  import type { PageData } from './$types';
  
  import ProfileHero from "$lib/components/analytics/ProfileHero.svelte";
  import AccountInsights from "$lib/components/analytics/AccountInsights.svelte";
  import Suggestions from "$lib/components/analytics/Suggestions.svelte";
  import TopicBullseye from "$lib/components/analytics/TopicBullseye.svelte";
  import ContentGrid from "$lib/components/analytics/ContentGrid.svelte";
  import CalendarSidebar from "$lib/components/analytics/CalendarSidebar.svelte";
  import HistoricalChart from "$lib/components/analytics/HistoricalChart.svelte";

  let { data }: { data: PageData } = $props();

  let postsData = $derived(data.postsData);
  let rawData = $derived(data.rawData);
  let bullseyeData = $derived(data.bullseyeData);
  let postAnalysisData = $derived(data.postAnalysisData);

  let posts = $derived(postsData as ContentItem[]);
  let isCalendarOpen = $state(false);

  let isDataValid = $derived(rawData && !Array.isArray(rawData) && Object.keys(rawData).length > 0);
  
  let profileInfo = $derived(isDataValid && rawData.profile_info ? rawData.profile_info : {
    name: 'copiumbuilder',
    profile_picture_url: 'https://ui-avatars.com/api/?name=CB&background=random',
    biography: '',
    username: 'copiumbuilder',
    media_count: 0,
    followers_count: 0,
    id: 'unknown',
    website: '',
    follows_count: 0
  });

  let facebookProfileInfo = $derived(isDataValid && rawData.facebook_profile_info ? rawData.facebook_profile_info : {
    name: 'Facebook Page',
    followers_count: 0
  });

  let accountInsights = $derived(isDataValid && rawData.account_insights ? rawData.account_insights : []);
  let facebookAccountInsights = $derived(isDataValid && rawData.facebook_account_insights ? rawData.facebook_account_insights : []);
  let historicalStats = $derived(isDataValid && rawData.historical_stats ? rawData.historical_stats : []);
  let mediaPosts = $derived(isDataValid && rawData.media_posts ? rawData.media_posts : []);
  let facebookPosts = $derived(isDataValid && rawData.facebook_posts ? rawData.facebook_posts : []);
  let mediaInsights = $derived(isDataValid && rawData.media_insights ? rawData.media_insights : {});
  let latestStats = $derived(historicalStats.length > 0 ? historicalStats[historicalStats.length - 1] : undefined);
  
  let safeBullseyeData = $derived(Object.keys(bullseyeData).length > 0 && bullseyeData.rings ? bullseyeData : {
    rings: [
      { ring: 1, audience: "Audience 1", post_ids: [] },
      { ring: 2, audience: "Audience 2", post_ids: [] },
      { ring: 3, audience: "Audience 3", post_ids: [] },
      { ring: 4, audience: "Audience 4", post_ids: [] },
      { ring: 5, audience: "Audience 5", post_ids: [] }
    ]
  });
</script>

<CalendarSidebar bind:isOpen={isCalendarOpen} {posts} />

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{profileInfo.name || 'Content Studio'}</h1>
      </div>

      <div class="flex items-center gap-2">
        <button 
          title="Content Calendar"
          class="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2"
          onclick={() => isCalendarOpen = true}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-sm font-medium hidden sm:block">Calendar</span>
        </button>
      </div>
    </div>
  </header>

  <div class="max-w-[90rem] mx-auto px-6 py-8 flex items-start gap-8">
    <aside class="w-64 shrink-0 hidden lg:block sticky top-24">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-3">On this page</h3>
        <nav class="space-y-1">
          <a href="#profile" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Profile</a>
          <a href="#insights" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Account Insights</a>
          {#if historicalStats.length > 0}
            <a href="#reach" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Reach Over Time</a>
          {/if}
          <a href="#suggestions" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Suggestions</a>
          <a href="#bullseye" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Topic Bullseye</a>
          <a href="#recent" class="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">Recent Posts</a>
        </nav>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <div id="profile" class="scroll-mt-24">
        <ProfileHero 
          igProfile={profileInfo} 
          fbProfile={facebookProfileInfo} 
          fbPostsCount={facebookPosts.length} 
        />
      </div>
      
      <div id="insights" class="scroll-mt-24">
        <AccountInsights 
          igProfile={profileInfo} 
          fbProfile={facebookProfileInfo} 
          todayStats={latestStats} 
        />
      </div>

      {#if historicalStats.length > 0}
        <div id="reach" class="scroll-mt-24">
          <HistoricalChart data={historicalStats} />
        </div>
      {/if}

      <div id="suggestions" class="scroll-mt-24">
        <Suggestions posts={mediaPosts} />
      </div>

      <div class="scroll-mt-24">
        <TopicBullseye {mediaPosts} bullseyeData={safeBullseyeData} />
      </div>
      
      <div id="recent" class="scroll-mt-24">
        <ContentGrid posts={mediaPosts} {facebookPosts} {mediaInsights} {postAnalysisData} />
      </div>
    </main>
  </div>
</div>
