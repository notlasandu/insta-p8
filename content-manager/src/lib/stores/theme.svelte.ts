import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

class ThemeManager {
  current = $state<Theme>('light');

  constructor() {
    if (browser) {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        this.current = stored;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.current = 'dark';
      }
      this.apply();
    }
  }

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    this.apply();
  }

  setTheme(theme: Theme) {
    this.current = theme;
    this.apply();
  }

  private apply() {
    if (!browser) return;
    if (this.current === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}

export const themeManager = new ThemeManager();
