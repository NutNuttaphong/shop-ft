import { Product } from '../services/api';

function getStorageKey(): string {
  try {
    const session = localStorage.getItem('app_auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.username) {
        return `app_wishlist_${parsed.username}`;
      }
    }
  } catch {
    // ignore parse error
  }
  return 'app_wishlist_guest';
}

export function getWishlist(): Product[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse wishlist from storage', err);
  }
  return [];
}

export function isProductInWishlist(productId: string): boolean {
  const list = getWishlist();
  return list.some((item) => item.id === productId);
}

export function toggleWishlist(product: Product): boolean {
  const current = getWishlist();
  const exists = current.some((item) => item.id === product.id);
  let updated: Product[];

  if (exists) {
    updated = current.filter((item) => item.id !== product.id);
  } else {
    updated = [product, ...current];
  }

  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  } catch (err) {
    console.error('Failed to save wishlist', err);
  }

  return !exists;
}

export function removeFromWishlist(productId: string): void {
  const current = getWishlist();
  const updated = current.filter((item) => item.id !== productId);
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  } catch (err) {
    console.error('Failed to remove item from wishlist', err);
  }
}
