const SEARCH_HISTORY_KEY = 'app_search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Retrieve recent search queries from localStorage.
 */
export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Add a search query to search history.
 * Duplicates are moved to the top. Capped at MAX_HISTORY_ITEMS.
 */
export function addSearchHistory(query: string): string[] {
  if (typeof window === 'undefined') return [];
  const trimmed = query.trim();
  if (!trimmed) return getSearchHistory();

  try {
    const current = getSearchHistory();
    // Filter out existing occurrence (case-insensitive)
    const filtered = current.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Remove a single search query from history.
 */
export function removeSearchHistory(query: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSearchHistory();
    const updated = current.filter(item => item.toLowerCase() !== query.trim().toLowerCase());
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Clear all search history.
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // Ignore error
  }
}
