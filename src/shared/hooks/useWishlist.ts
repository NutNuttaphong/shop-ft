import { useState, useEffect, useCallback } from 'react';
import { Product } from '../services/api';
import { getWishlist, isProductInWishlist, toggleWishlist, removeFromWishlist } from '../utils/wishlist';

export function useWishlist() {
  const [items, setItems] = useState<Product[]>(() => getWishlist());

  const sync = useCallback(() => {
    setItems(getWishlist());
  }, []);

  useEffect(() => {
    sync();

    const handleUpdate = () => {
      sync();
    };

    window.addEventListener('wishlist-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [sync]);

  const handleToggle = useCallback((product: Product) => {
    const isAdded = toggleWishlist(product);
    sync();
    return isAdded;
  }, [sync]);

  const handleRemove = useCallback((productId: string) => {
    removeFromWishlist(productId);
    sync();
  }, [sync]);

  const checkWishlisted = useCallback((productId: string) => {
    return isProductInWishlist(productId);
  }, []);

  return {
    wishlist: items,
    wishlistCount: items.length,
    toggleWishlist: handleToggle,
    removeFromWishlist: handleRemove,
    isWishlisted: checkWishlisted,
  };
}
