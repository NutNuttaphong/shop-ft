import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';
import { restfulApi, Product } from '../../../shared/services/api';

const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'ข้าวหอมมะลิสุรินทร์ 5 กก.',
    price: 250,
    description: 'ข้าวหอมมะลิแท้ หอม นุ่ม อร่อย',
    category: 'ข้าวสาร',
    imageUrl: 'https://example.com/jasmine.jpg',
    stock: 20
  },
  {
    id: 'prod-002',
    name: 'ผักกาดหอมสดอินทรีย์',
    price: 45,
    description: 'ผักสลัดกรอบสดใหม่ ปลอดสารเคมี',
    category: 'ผักสด',
    imageUrl: 'https://example.com/lettuce.jpg',
    stock: 0
  },
  {
    id: 'prod-003',
    name: 'ส้มสายน้ำผึ้งเกรด A',
    price: 120,
    description: 'ส้มหวานฉ่ำ สดจากสวน',
    category: 'ผลไม้',
    imageUrl: 'https://example.com/orange.jpg',
    stock: 15
  }
];

vi.mock('../../../shared/services/api', async () => {
  const actual = await vi.importActual('../../../shared/services/api');
  return {
    ...actual,
    restfulApi: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    },
    logVisitorVisit: vi.fn()
  };
});

describe('CatalogPage Component with Advanced Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(restfulApi.get).mockResolvedValue({
      data: mockProducts,
      error: null,
      status: 200
    });
  });

  it('renders products and category sidebar correctly', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).toBeInTheDocument();
      expect(screen.getByText('ผักกาดหอมสดอินทรีย์')).toBeInTheDocument();
      expect(screen.getByText('ส้มสายน้ำผึ้งเกรด A')).toBeInTheDocument();
    });

    expect(screen.getByText('หมวดหมู่สินค้า')).toBeInTheDocument();
  });

  it('filters products when clicking a category in sidebar', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).toBeInTheDocument();
    });

    // Click 'ผลไม้' category button
    const fruitButton = screen.getAllByRole('button', { name: /ผลไม้/ })[0];
    fireEvent.click(fruitButton);

    await waitFor(() => {
      expect(screen.getByText('ส้มสายน้ำผึ้งเกรด A')).toBeInTheDocument();
      expect(screen.queryByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).not.toBeInTheDocument();
    });

    // Active filter chip is displayed
    expect(screen.getByText(/หมวดหมู่: ผลไม้/)).toBeInTheDocument();
  });

  it('opens advanced filters panel and filters by price preset', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).toBeInTheDocument();
    });

    // Click "กรองสินค้าเพิ่มเติม"
    const advFiltersBtn = screen.getByRole('button', { name: /กรองสินค้าเพิ่มเติม/ });
    fireEvent.click(advFiltersBtn);

    // Click "ต่ำกว่า ฿100" preset
    const under100Preset = screen.getByRole('button', { name: 'ต่ำกว่า ฿100' });
    fireEvent.click(under100Preset);

    await waitFor(() => {
      expect(screen.getByText('ผักกาดหอมสดอินทรีย์')).toBeInTheDocument(); // ฿45
      expect(screen.queryByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).not.toBeInTheDocument(); // ฿250
    });
  });

  it('sorts products by price (low to high)', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

    await waitFor(() => {
      const productTitles = screen.getAllByRole('heading', { level: 3 });
      expect(productTitles[0]).toHaveTextContent('ผักกาดหอมสดอินทรีย์'); // 45
    });
  });

  it('resets all filters when clicking clear all filters', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).toBeInTheDocument();
    });

    // Filter by Fruit
    const fruitButton = screen.getAllByRole('button', { name: /ผลไม้/ })[0];
    fireEvent.click(fruitButton);

    expect(screen.getByText(/หมวดหมู่: ผลไม้/)).toBeInTheDocument();

    // Click "ล้างทั้งหมด"
    const clearAllBtn = screen.getByRole('button', { name: 'ล้างทั้งหมด' });
    fireEvent.click(clearAllBtn);

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิสุรินทร์ 5 กก.')).toBeInTheDocument();
      expect(screen.getByText('ผักกาดหอมสดอินทรีย์')).toBeInTheDocument();
      expect(screen.getByText('ส้มสายน้ำผึ้งเกรด A')).toBeInTheDocument();
    });
  });
});
