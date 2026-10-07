<script lang="ts">
  import type { SlideData } from '$lib/types/slide';
  import SlideWrapper from './slides/SlideWrapper.svelte';
  
  import SlideHeroImageText from './slides/SlideHeroImageText.svelte';
  import SlideTextOverGrid from './slides/SlideTextOverGrid.svelte';
  import SlideOverlappingReveal from './slides/SlideOverlappingReveal.svelte';
  import SlideDualImage from './slides/SlideDualImage.svelte';
  import SlideCTAHero from './slides/SlideCTAHero.svelte';
  import SlideQuoteMinimal from './slides/SlideQuoteMinimal.svelte';
  import SlideChecklist from './slides/SlideChecklist.svelte';
  import SlideFeatureFocus from './slides/SlideFeatureFocus.svelte';
  import SlideTextMessages from './slides/SlideTextMessages.svelte';

  let { slide, index }: { slide: SlideData, index: number } = $props();
</script>

{#if slide.layout === 'hero-image-text'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideHeroImageText {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'text-over-grid'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideTextOverGrid {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'overlapping-reveal'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideOverlappingReveal {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'dual-image'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideDualImage {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'cta-hero'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideCTAHero {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'quote-minimal'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo} theme="minimal">
    <SlideQuoteMinimal {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'checklist'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideChecklist {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'feature-focus'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideFeatureFocus {...slide} />
  </SlideWrapper>
{:else if slide.layout === 'text-message-hook'}
  <SlideWrapper {index} showSwipe={slide.showSwipe} showLogo={slide.showLogo}>
    <SlideTextMessages {...slide} />
  </SlideWrapper>
{/if}
