import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getWishlist, isProductInWishlist, toggleWishlist, removeFromWishlist } from './wishlist';
import { Product } from '../services/api';

const mockProduct: Product = {
  id: 'prod-101',
  name: 'Organic Honey',
  price: 250,
  description: 'Pure forest honey',
  category: 'Food',
  imageUrl: 'https://example.com/honey.jpg',
  stock: 20,
};

describe('wishlist utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with an empty wishlist', () => {
    expect(getWishlist()).toEqual([]);
    expect(isProductInWishlist('prod-101')).toBe(false);
  });

  it('toggles product into wishlist and dispatches event', () => {
    const eventSpy = vi.fn();
    window.addEventListener('wishlist-updated', eventSpy);

    const isAdded = toggleWishlist(mockProduct);

    expect(isAdded).toBe(true);
    expect(isProductInWishlist('prod-101')).toBe(true);
    expect(getWishlist()).toHaveLength(1);
    expect(getWishlist()[0].name).toBe('Organic Honey');
    expect(eventSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('wishlist-updated', eventSpy);
  });

  it('toggles product out of wishlist when already present', () => {
    toggleWishlist(mockProduct);
    expect(isProductInWishlist('prod-101')).toBe(true);

    const isAdded = toggleWishlist(mockProduct);

    expect(isAdded).toBe(false);
    expect(isProductInWishlist('prod-101')).toBe(false);
    expect(getWishlist()).toHaveLength(0);
  });

  it('removes product from wishlist via removeFromWishlist', () => {
    toggleWishlist(mockProduct);
    expect(getWishlist()).toHaveLength(1);

    removeFromWishlist('prod-101');
    expect(getWishlist()).toHaveLength(0);
    expect(isProductInWishlist('prod-101')).toBe(false);
  });

  it('stores wishlist under user-specific key when logged in', () => {
    localStorage.setItem(
      'app_auth_session',
      JSON.stringify({ username: 'somchai_user', token: 'mock-token' })
    );

    toggleWishlist(mockProduct);

    const userStored = localStorage.getItem('app_wishlist_somchai_user');
    expect(userStored).not.toBeNull();
    expect(JSON.parse(userStored || '[]')[0].id).toBe('prod-101');
  });
});
