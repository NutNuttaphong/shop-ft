import { describe, it, expect } from 'vitest';
import {
  isLowStock,
  isOutOfStock,
  getStockStatus,
  countStockStatus,
  filterProductsByStock
} from './stockUtils';
import { Product } from '../services/api';

const mockProducts: Product[] = [
  { id: '1', name: 'Item A', price: 100, stock: 0, description: '', category: 'A', imageUrl: '' },
  { id: '2', name: 'Item B', price: 200, stock: 2, description: '', category: 'A', imageUrl: '' },
  { id: '3', name: 'Item C', price: 300, stock: 5, description: '', category: 'A', imageUrl: '' },
  { id: '4', name: 'Item D', price: 400, stock: 6, description: '', category: 'B', imageUrl: '' },
  { id: '5', name: 'Item E', price: 500, stock: 50, description: '', category: 'B', imageUrl: '' },
];

describe('stockUtils', () => {
  describe('isLowStock and isOutOfStock', () => {
    it('identifies out of stock', () => {
      expect(isOutOfStock(0)).toBe(true);
      expect(isOutOfStock(-1)).toBe(true);
      expect(isOutOfStock(1)).toBe(false);
    });

    it('identifies low stock (<= 5 and > 0)', () => {
      expect(isLowStock(1)).toBe(true);
      expect(isLowStock(5)).toBe(true);
      expect(isLowStock(0)).toBe(false);
      expect(isLowStock(6)).toBe(false);
    });

    it('returns correct stock status category', () => {
      expect(getStockStatus(0)).toBe('out-of-stock');
      expect(getStockStatus(3)).toBe('low-stock');
      expect(getStockStatus(15)).toBe('in-stock');
    });
  });

  describe('countStockStatus', () => {
    it('accurately tallies products across all stock categories', () => {
      const counts = countStockStatus(mockProducts);
      expect(counts.total).toBe(5);
      expect(counts.outOfStock).toBe(1); // Item A (0)
      expect(counts.lowStock).toBe(2);   // Item B (2), Item C (5)
      expect(counts.inStock).toBe(2);    // Item D (6), Item E (50)
    });
  });

  describe('filterProductsByStock', () => {
    it('returns all products when filter is all', () => {
      expect(filterProductsByStock(mockProducts, 'all').length).toBe(5);
    });

    it('filters low stock products (including 0 items <= 5)', () => {
      const low = filterProductsByStock(mockProducts, 'low-stock');
      expect(low.length).toBe(3); // 0, 2, 5
    });

    it('filters out of stock products', () => {
      const out = filterProductsByStock(mockProducts, 'out-of-stock');
      expect(out.length).toBe(1);
      expect(out[0].id).toBe('1');
    });

    it('filters regular in-stock products', () => {
      const regular = filterProductsByStock(mockProducts, 'in-stock');
      expect(regular.length).toBe(2);
      expect(regular.map(p => p.id)).toEqual(['4', '5']);
    });
  });
});
