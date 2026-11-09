import { describe, it, expect } from 'vitest';
import { filterAndSortProducts, PRICE_PRESETS } from './productFilters';
import { Product } from '../services/api';

const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'ข้าวหอมมะลิสุรินทร์ 5 กก.',
    price: 250,
    description: 'ข้าวหอมมะลิคัดพิเศษ หอมนุ่ม หุงขึ้นหม้อ',
    category: 'ข้าวสาร',
    imageUrl: 'https://example.com/jasmine.jpg',
    stock: 25,
  },
  {
    id: 'prod-002',
    name: 'ผักสลัดกรีนโอ๊คออร์แกนิก',
    price: 45,
    description: 'ผักสดใหม่ ปลูกระบบไฮโดรโปนิกส์ ไร้สารเคมี',
    category: 'ผักสด',
    imageUrl: 'https://example.com/greenoak.jpg',
    stock: 0, // out of stock
  },
  {
    id: 'prod-003',
    name: 'ส้มสายน้ำผึ้งเกรดพรีเมียม 1 กก.',
    price: 120,
    description: 'ส้มสายน้ำผึ้งรสหวานอมเปรี้ยว สดชื่น วิตามินซีสูง',
    category: 'ผลไม้',
    imageUrl: 'https://example.com/orange.jpg',
    stock: 15,
  },
  {
    id: 'prod-004',
    name: 'น้ำผึ้งป่าแท้เดือน 5 (750 มล.)',
    price: 450,
    description: 'น้ำผึ้งแท้ 100% จากเกสรดอกไม้ป่าธรรมชาติ',
    category: 'เครื่องดื่ม',
    imageUrl: 'https://example.com/honey.jpg',
    stock: 8,
  },
  {
    id: 'prod-005',
    name: 'ชุดของขวัญผักและผลไม้รวมพรีเมียม',
    price: 990,
    description: 'รวมสุดยอดผลไม้และผักสุขภาพดี เหมาะสำหรับมอบเป็นของขวัญ',
    category: 'ผลไม้',
    imageUrl: 'https://example.com/giftset.jpg',
    stock: 5,
  }
];

describe('productFilters utility', () => {
  it('returns all products when no filter options are provided', () => {
    const result = filterAndSortProducts(mockProducts);
    expect(result.length).toBe(mockProducts.length);
  });

  describe('Search Filtering', () => {
    it('filters products matching name', () => {
      const result = filterAndSortProducts(mockProducts, { searchTerm: 'ข้าวหอม' });
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('ข้าวหอมมะลิ');
    });

    it('filters products matching description', () => {
      const result = filterAndSortProducts(mockProducts, { searchTerm: 'วิตามินซีสูง' });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('prod-003');
    });

    it('returns empty array when search has no matches', () => {
      const result = filterAndSortProducts(mockProducts, { searchTerm: 'ไอโฟน 16' });
      expect(result.length).toBe(0);
    });
  });

  describe('Category Filtering', () => {
    it('filters products matching specific category', () => {
      const result = filterAndSortProducts(mockProducts, { category: 'ผลไม้' });
      expect(result.length).toBe(2);
      expect(result.every(p => p.category === 'ผลไม้')).toBe(true);
    });

    it('returns all products when category is "ทั้งหมด"', () => {
      const result = filterAndSortProducts(mockProducts, { category: 'ทั้งหมด' });
      expect(result.length).toBe(mockProducts.length);
    });
  });

  describe('Price Range Filtering', () => {
    it('filters by minPrice only', () => {
      const result = filterAndSortProducts(mockProducts, { minPrice: 300 });
      expect(result.length).toBe(2);
      expect(result.every(p => p.price >= 300)).toBe(true);
    });

    it('filters by maxPrice only', () => {
      const result = filterAndSortProducts(mockProducts, { maxPrice: 150 });
      expect(result.length).toBe(2);
      expect(result.every(p => p.price <= 150)).toBe(true);
    });

    it('filters by both minPrice and maxPrice range', () => {
      const result = filterAndSortProducts(mockProducts, { minPrice: 100, maxPrice: 300 });
      expect(result.length).toBe(2);
      expect(result.map(p => p.id).sort()).toEqual(['prod-001', 'prod-003']);
    });

    it('works with PRICE_PRESETS correctly', () => {
      const preset = PRICE_PRESETS.find(p => p.id === '100-300')!;
      const result = filterAndSortProducts(mockProducts, {
        minPrice: preset.minPrice,
        maxPrice: preset.maxPrice
      });
      expect(result.length).toBe(2);
    });
  });

  describe('Stock Availability Filtering', () => {
    it('excludes out-of-stock items when onlyInStock is true', () => {
      const result = filterAndSortProducts(mockProducts, { onlyInStock: true });
      expect(result.length).toBe(4);
      expect(result.find(p => p.id === 'prod-002')).toBeUndefined();
    });
  });

  describe('Rating Filtering', () => {
    it('filters products by minimum rating', () => {
      // All mock products in mockData have average rating >= 4.0
      const result = filterAndSortProducts(mockProducts, { minRating: 4.0 });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Sorting Logic', () => {
    it('sorts by price-asc (lowest to highest)', () => {
      const result = filterAndSortProducts(mockProducts, { sortBy: 'price-asc' });
      const prices = result.map(p => p.price);
      expect(prices).toEqual([45, 120, 250, 450, 990]);
    });

    it('sorts by price-desc (highest to lowest)', () => {
      const result = filterAndSortProducts(mockProducts, { sortBy: 'price-desc' });
      const prices = result.map(p => p.price);
      expect(prices).toEqual([990, 450, 250, 120, 45]);
      expect(prices[0]).toBe(990);
      expect(prices[prices.length - 1]).toBe(45);
    });

    it('sorts by name-asc (Thai locale sorting)', () => {
      const result = filterAndSortProducts(mockProducts, { sortBy: 'name-asc' });
      expect(result.length).toBe(mockProducts.length);
      expect(result[0].name.startsWith('ข้าว')).toBe(true);
    });

    it('sorts by rating-desc', () => {
      const result = filterAndSortProducts(mockProducts, { sortBy: 'rating-desc' });
      expect(result.length).toBe(mockProducts.length);
    });

    it('sorts by popular', () => {
      const result = filterAndSortProducts(mockProducts, { sortBy: 'popular' });
      expect(result.length).toBe(mockProducts.length);
    });
  });
});
