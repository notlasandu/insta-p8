import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

class ThemeManager {
  current = $state<Theme>('light');

  constructor() {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get('theme') as Theme | null;
      if (urlTheme === 'dark' || urlTheme === 'light') {
        this.current = urlTheme;
      } else {
        const stored = (localStorage.getItem('theme') || localStorage.getItem('insta-p8-theme')) as Theme | null;
        if (stored === 'dark' || stored === 'light') {
          this.current = stored;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.current = 'dark';
        }
      }
      this.apply();

      window.addEventListener('message', (event) => {
        if (event.data?.type === 'THEME_CHANGE' && (event.data.theme === 'dark' || event.data.theme === 'light')) {
          this.setTheme(event.data.theme);
        }
      });

      window.addEventListener('storage', (event) => {
        if (event.key === 'insta-p8-theme' || event.key === 'theme') {
          if (event.newValue === 'dark' || event.newValue === 'light') {
            this.setTheme(event.newValue);
          }
        }
      });
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
