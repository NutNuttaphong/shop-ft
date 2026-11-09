import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ManageProductsPage } from './ManageProductsPage';
import { restfulApi, Product } from '../../../shared/services/api';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'ผักบุ้งจีนออร์แกนิก',
    price: 30,
    stock: 2, // low stock <= 5
    category: 'ผักสด',
    imageUrl: 'https://example.com/veg.jpg',
    description: 'ผักสดใหม่'
  },
  {
    id: 'prod-2',
    name: 'ข้าวเหนียวเขี้ยวงู 5 กก.',
    price: 220,
    stock: 0, // out of stock
    category: 'ข้าวสาร',
    imageUrl: 'https://example.com/rice.jpg',
    description: 'ข้าวเหนียวคัดพิเศษ'
  },
  {
    id: 'prod-3',
    name: 'กล้วยหอมทองเกรดส่งออก',
    price: 80,
    stock: 35, // in stock > 5
    category: 'ผลไม้',
    imageUrl: 'https://example.com/banana.jpg',
    description: 'กล้วยหอมหวาน'
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
    }
  };
});

describe('ManageProductsPage - Low Stock Alerts & Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(restfulApi.get).mockResolvedValue({
      data: mockProducts,
      error: null,
      status: 200
    });
    vi.mocked(restfulApi.put).mockResolvedValue({
      data: { ...mockProducts[0], stock: 12 },
      error: null,
      status: 200
    });
  });

  it('renders products and displays Critical Stock Alert Banner when low stock exists', async () => {
    render(
      <MemoryRouter>
        <ManageProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('จัดการรายการสินค้า')).toBeInTheDocument();
      expect(screen.getByText(/แจ้งเตือนคลังสินค้าที่ต้องเติมด่วน/)).toBeInTheDocument();
      expect(screen.getByText(/^หมด 1 รายการ$/)).toBeInTheDocument();
      expect(screen.getByText(/^ใกล้หมด 1 รายการ$/)).toBeInTheDocument();
    });
  });

  it('filters by "ใกล้หมดสต็อก" tab to display only items <= 5 stock', async () => {
    render(
      <MemoryRouter>
        <ManageProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ผักบุ้งจีนออร์แกนิก')).toBeInTheDocument();
    });

    const lowStockTab = screen.getByRole('button', { name: /ใกล้หมดสต็อก/ });
    fireEvent.click(lowStockTab);

    await waitFor(() => {
      expect(screen.getByText('ผักบุ้งจีนออร์แกนิก')).toBeInTheDocument(); // 2
      expect(screen.getByText('ข้าวเหนียวเขี้ยวงู 5 กก.')).toBeInTheDocument(); // 0
      expect(screen.queryByText('กล้วยหอมทองเกรดส่งออก')).not.toBeInTheDocument(); // 35 (in stock)
    });
  });

  it('filters by "สินค้าหมด" tab to display only 0 stock items', async () => {
    render(
      <MemoryRouter>
        <ManageProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ข้าวเหนียวเขี้ยวงู 5 กก.')).toBeInTheDocument();
    });

    const outOfStockTab = screen.getByRole('button', { name: /สินค้าหมด/ });
    fireEvent.click(outOfStockTab);

    await waitFor(() => {
      expect(screen.getByText('ข้าวเหนียวเขี้ยวงู 5 กก.')).toBeInTheDocument(); // 0
      expect(screen.queryByText('ผักบุ้งจีนออร์แกนิก')).not.toBeInTheDocument(); // 2
      expect(screen.queryByText('กล้วยหอมทองเกรดส่งออก')).not.toBeInTheDocument(); // 35
    });
  });

  it('performs Quick Stock Add (+10) directly from product row', async () => {
    render(
      <MemoryRouter>
        <ManageProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ผักบุ้งจีนออร์แกนิก')).toBeInTheDocument();
    });

    const add10Buttons = screen.getAllByTitle('เติมสต็อก +10 ชิ้น');
    fireEvent.click(add10Buttons[0]);

    await waitFor(() => {
      expect(restfulApi.put).toHaveBeenCalledWith(
        '/api/products/prod-1',
        expect.objectContaining({ stock: 12 })
      );
      expect(screen.getByText(/เติมสต็อก "ผักบุ้งจีนออร์แกนิก" \+10 ชิ้น สำเร็จ!/)).toBeInTheDocument();
    });
  });
});
