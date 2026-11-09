import { Product } from '../services/api';

export const LOW_STOCK_THRESHOLD = 5;
export const OUT_OF_STOCK_THRESHOLD = 0;

export type StockFilterType = 'all' | 'low-stock' | 'out-of-stock' | 'in-stock';

export interface StockCounts {
  total: number;
  lowStock: number;
  outOfStock: number;
  inStock: number;
}

/**
 * Check if a product has low stock (<= 5 and > 0).
 */
export function isLowStock(stock: number): boolean {
  return stock > OUT_OF_STOCK_THRESHOLD && stock <= LOW_STOCK_THRESHOLD;
}

/**
 * Check if a product is completely out of stock (<= 0).
 */
export function isOutOfStock(stock: number): boolean {
  return stock <= OUT_OF_STOCK_THRESHOLD;
}

/**
 * Get category status of product stock.
 */
export function getStockStatus(stock: number): 'out-of-stock' | 'low-stock' | 'in-stock' {
  if (isOutOfStock(stock)) return 'out-of-stock';
  if (isLowStock(stock)) return 'low-stock';
  return 'in-stock';
}

/**
 * Count total, low stock, out of stock, and normal in-stock products.
 */
export function countStockStatus(products: Product[]): StockCounts {
  let lowStock = 0;
  let outOfStock = 0;
  let inStock = 0;

  for (const p of products) {
    const s = p.stock ?? 0;
    if (isOutOfStock(s)) {
      outOfStock++;
    } else if (isLowStock(s)) {
      lowStock++;
    } else {
      inStock++;
    }
  }

  return {
    total: products.length,
    lowStock,
    outOfStock,
    inStock
  };
}

/**
 * Filter products list by stock status.
 */
export function filterProductsByStock(products: Product[], filter: StockFilterType): Product[] {
  switch (filter) {
    case 'low-stock':
      return products.filter(p => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD);
    case 'out-of-stock':
      return products.filter(p => isOutOfStock(p.stock ?? 0));
    case 'in-stock':
      return products.filter(p => (p.stock ?? 0) > LOW_STOCK_THRESHOLD);
    case 'all':
    default:
      return products;
  }
}
