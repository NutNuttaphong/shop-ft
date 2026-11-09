import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory
} from './searchHistory';

describe('searchHistory utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no history exists', () => {
    expect(getSearchHistory()).toEqual([]);
  });

  it('adds items to history and prioritizes the newest item', () => {
    addSearchHistory('ผักกาด');
    addSearchHistory('แตงโม');

    const history = getSearchHistory();
    expect(history).toEqual(['แตงโม', 'ผักกาด']);
  });

  it('moves existing items to the top without duplicates', () => {
    addSearchHistory('ผักกาด');
    addSearchHistory('แตงโม');
    addSearchHistory('ผักกาด'); // duplicate

    const history = getSearchHistory();
    expect(history).toEqual(['ผักกาด', 'แตงโม']);
  });

  it('caps history at maximum 10 items', () => {
    for (let i = 1; i <= 15; i++) {
      addSearchHistory(`Item ${i}`);
    }

    const history = getSearchHistory();
    expect(history.length).toBe(10);
    expect(history[0]).toBe('Item 15');
    expect(history[9]).toBe('Item 6');
  });

  it('ignores empty or whitespace queries', () => {
    addSearchHistory('   ');
    expect(getSearchHistory()).toEqual([]);
  });

  it('removes a specific item from history', () => {
    addSearchHistory('ส้ม');
    addSearchHistory('แอปเปิ้ล');
    addSearchHistory('กล้วย');

    removeSearchHistory('แอปเปิ้ล');
    expect(getSearchHistory()).toEqual(['กล้วย', 'ส้ม']);
  });

  it('clears all history items', () => {
    addSearchHistory('ส้ม');
    addSearchHistory('กล้วย');

    clearSearchHistory();
    expect(getSearchHistory()).toEqual([]);
  });

  it('gracefully handles corrupted localStorage data', () => {
    localStorage.setItem('app_search_history', 'INVALID_JSON{');
    expect(getSearchHistory()).toEqual([]);
  });
});
