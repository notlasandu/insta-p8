export type SlideLayout = 
  | 'hero-image-text'
  | 'text-over-grid'
  | 'overlapping-reveal'
  | 'dual-image'
  | 'cta-hero'
  | 'quote-minimal'
  | 'checklist'
  | 'feature-focus'
  | 'text-message-hook';

export interface SlideBase {
  id?: number;
  layout: SlideLayout;
  showSwipe?: boolean;
  showLogo?: boolean;
}

export interface SlideHeroImageText extends SlideBase {
  layout: 'hero-image-text';
  image: string;
  headline: string;
  subheadline?: string;
}

export interface SlideTextOverGrid extends SlideBase {
  layout: 'text-over-grid';
  headline: string;
  images: Array<{ src: string; label: string }>;
}

export interface SlideOverlappingReveal extends SlideBase {
  layout: 'overlapping-reveal';
  headline: string;
  bgImage: string;
  fgImage: string;
  subheadline1?: string;
  subheadline2?: string;
}

export interface SlideDualImage extends SlideBase {
  layout: 'dual-image';
  images: string[];
  tagline?: string;
  headline: string;
  subheadline?: string;
}

export interface SlideCTAHero extends SlideBase {
  layout: 'cta-hero';
  image: string;
  headline: string;
  subheadline?: string;
  callToAction?: string;
}

export interface SlideQuoteMinimal extends SlideBase {
  layout: 'quote-minimal';
  image: string;
  text: string;
}

export interface SlideChecklist extends SlideBase {
  layout: 'checklist';
  headline: string;
  questions: Array<{ question: string; description?: string }>;
  image: string;
}

export interface SlideFeatureFocus extends SlideBase {
  layout: 'feature-focus';
  headline: string;
  subheadline?: string;
  image: string;
  features: Array<{ title: string; description: string }>;
}

export interface SlideTextMessageHook extends SlideBase {
  layout: 'text-message-hook';
  headline: string;
  messages: Array<{ sender: 'me' | 'them', text: string }>;
}

export type SlideData = 
  | SlideHeroImageText 
  | SlideTextOverGrid 
  | SlideOverlappingReveal 
  | SlideDualImage 
  | SlideCTAHero 
  | SlideQuoteMinimal
  | SlideChecklist
  | SlideFeatureFocus
  | SlideTextMessageHook;
