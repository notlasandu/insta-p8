import { browser } from '$app/environment';

const STORAGE_KEY = 'dashboard_collapsed_sections';

function getStoredMap(): Record<string, boolean> {
  if (!browser) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToMap(key: string, isOpen: boolean) {
  if (!browser) return;
  try {
    const map = getStoredMap();
    map[key] = isOpen;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
  }
}

export function persistDetails(node: HTMLDetailsElement, key: string) {
  if (!browser) return;

  const map = getStoredMap();
  if (key in map) {
    node.open = Boolean(map[key]);
  }

  const handleToggle = () => {
    saveToMap(key, node.open);
  };

  node.addEventListener('toggle', handleToggle);

  return {
    update(newKey: string) {
      key = newKey;
      const updatedMap = getStoredMap();
      if (key in updatedMap) {
        node.open = Boolean(updatedMap[key]);
      }
    },
    destroy() {
      node.removeEventListener('toggle', handleToggle);
    }
  };
}
