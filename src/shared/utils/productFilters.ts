import { Product } from '../services/api';
import { getAverageRating } from '../../modules/products/utils/mockData';

export interface ProductFilterOptions {
  searchTerm?: string;
  category?: string;
  minPrice?: number | '';
  maxPrice?: number | '';
  onlyInStock?: boolean;
  minRating?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating-desc' | 'popular' | 'name-asc' | string;
}

export interface PricePreset {
  id: string;
  label: string;
  minPrice: number | '';
  maxPrice: number | '';
}

export const PRICE_PRESETS: PricePreset[] = [
  { id: 'under-100', label: 'ต่ำกว่า ฿100', minPrice: '', maxPrice: 100 },
  { id: '100-300', label: '฿100 - ฿300', minPrice: 100, maxPrice: 300 },
  { id: '300-500', label: '฿300 - ฿500', minPrice: 300, maxPrice: 500 },
  { id: 'over-500', label: 'มากกว่า ฿500', minPrice: 500, maxPrice: '' },
];

/**
 * Filter and sort products according to criteria.
 */
export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions = {}
): Product[] {
  const {
    searchTerm = '',
    category = 'ทั้งหมด',
    minPrice = '',
    maxPrice = '',
    onlyInStock = false,
    minRating = 0,
    sortBy = 'newest'
  } = options;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // 1. Filtering Phase
  const filtered = products.filter(product => {
    // Search text matching (name, description, category)
    if (normalizedSearch) {
      const nameMatch = product.name?.toLowerCase().includes(normalizedSearch);
      const descMatch = product.description?.toLowerCase().includes(normalizedSearch);
      const catMatch = product.category?.toLowerCase().includes(normalizedSearch);
      if (!nameMatch && !descMatch && !catMatch) return false;
    }

    // Category matching
    if (category && category !== 'ทั้งหมด' && product.category !== category) {
      return false;
    }

    // Minimum price
    if (minPrice !== '' && typeof minPrice === 'number' && product.price < minPrice) {
      return false;
    }

    // Maximum price
    if (maxPrice !== '' && typeof maxPrice === 'number' && product.price > maxPrice) {
      return false;
    }

    // Stock availability
    if (onlyInStock && product.stock <= 0) {
      return false;
    }

    // Rating filter
    if (minRating > 0) {
      const ratingInfo = getAverageRating(product.id, product.category || 'ทั่วไป');
      if (ratingInfo.rating < minRating) {
        return false;
      }
    }

    return true;
  });

  // 2. Sorting Phase
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '', 'th');
      case 'rating-desc': {
        const ratingA = getAverageRating(a.id, a.category || 'ทั่วไป').rating;
        const ratingB = getAverageRating(b.id, b.category || 'ทั่วไป').rating;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.id || '').localeCompare(a.id || '');
      }
      case 'popular': {
        const reviewsA = getAverageRating(a.id, a.category || 'ทั่วไป').totalReviews;
        const reviewsB = getAverageRating(b.id, b.category || 'ทั่วไป').totalReviews;
        if (reviewsB !== reviewsA) return reviewsB - reviewsA;
        return (b.id || '').localeCompare(a.id || '');
      }
      case 'newest':
      default:
        return (b.id || '').localeCompare(a.id || '');
    }
  });
}
