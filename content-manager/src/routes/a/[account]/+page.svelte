<script lang="ts">
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import type { ContentItem } from "$lib/types/content";
  import type { PageData } from './$types';
  
  import ProfileHero from "$lib/components/analytics/ProfileHero.svelte";
  import AccountInsights from "$lib/components/analytics/AccountInsights.svelte";
  import Suggestions from "$lib/components/analytics/Suggestions.svelte";
  import TopicBullseye from "$lib/components/analytics/TopicBullseye.svelte";
  import ContentGrid from "$lib/components/analytics/ContentGrid.svelte";
  import CalendarSidebar from "$lib/components/analytics/CalendarSidebar.svelte";
  import HistoricalChart from "$lib/components/analytics/HistoricalChart.svelte";
  import BottomNav from "$lib/components/analytics/BottomNav.svelte";
  import AccountHeader from "$lib/components/analytics/AccountHeader.svelte";
  import PageNavAside from "$lib/components/analytics/PageNavAside.svelte";

  let { data }: { data: PageData } = $props();

  let postsData = $derived(data.postsData);
  let rawData = $derived(data.rawData);
  let bullseyeData = $derived(data.bullseyeData);
  let postAnalysisData = $derived(data.postAnalysisData);

  let posts = $derived(postsData as ContentItem[]);
  let isCalendarOpen = $state(false);
  let isSyncing = $state(false);
  let lastUpdated = $state<string | null>(null);

  $effect(() => {
    lastUpdated = rawData?.last_updated || null;
  });

  async function triggerSync() {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: data.account, force: false })
      });
      const result = await res.json();
      if (result.success && result.updated) {
        lastUpdated = result.last_updated;
        await invalidateAll();
      }
    } catch {
    } finally {
      isSyncing = false;
    }
  }

  onMount(() => {
    if (!lastUpdated) {
      triggerSync();
      return;
    }
    const diffMs = Date.now() - new Date(lastUpdated).getTime();
    if (diffMs > 60 * 60 * 1000) {
      triggerSync();
    }
  });

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
  <AccountHeader
    title={profileInfo.name}
    {lastUpdated}
    {isSyncing}
    onOpenCalendar={() => isCalendarOpen = true}
  />

  <div class="max-w-[90rem] mx-auto px-3 sm:px-6 py-4 sm:py-8 flex items-start gap-8">
    <PageNavAside hasTrends={historicalStats.length > 0} />

    <main class="flex-1 min-w-0 pb-20 lg:pb-8">
      <div id="profile" class="scroll-mt-20">
        <ProfileHero 
          igProfile={profileInfo} 
          fbProfile={facebookProfileInfo} 
          fbPostsCount={facebookPosts.length} 
        />
      </div>
      
      <div id="insights" class="scroll-mt-20">
        <AccountInsights 
          igProfile={profileInfo} 
          fbProfile={facebookProfileInfo} 
          todayStats={latestStats} 
        />
      </div>

      {#if historicalStats.length > 0}
        <div id="reach" class="scroll-mt-20">
          <HistoricalChart data={historicalStats} />
        </div>
      {/if}

      <div id="suggestions" class="scroll-mt-20">
        <Suggestions posts={mediaPosts} />
      </div>

      <div id="bullseye" class="scroll-mt-20">
        <TopicBullseye {mediaPosts} bullseyeData={safeBullseyeData} />
      </div>
      
      <div id="recent" class="scroll-mt-20">
        <ContentGrid posts={mediaPosts} {facebookPosts} {mediaInsights} {postAnalysisData} />
      </div>
    </main>
  </div>

  <BottomNav />
</div>
