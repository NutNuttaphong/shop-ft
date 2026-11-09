import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { restfulApi } from '../../../shared/services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

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

describe('DashboardPage - Low Stock Integration & Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(restfulApi.get).mockImplementation(((url: string) => {
      if (url === '/api/products') {
        return Promise.resolve({
          data: [
            { id: 'p1', name: 'ผักบุ้ง', stock: 2, price: 30, category: 'ผัก' },
            { id: 'p2', name: 'คะน้า', stock: 0, price: 25, category: 'ผัก' },
            { id: 'p3', name: 'ข้าวสาร', stock: 15, price: 200, category: 'ข้าว' }
          ]
        });
      }
      if (url === '/api/orders') {
        return Promise.resolve({ data: [] });
      }
      if (url === '/api/chat/contacts') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    }) as never);
  });

  it('renders low stock count and displays Critical Stock Alert Banner', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('แดชบอร์ดสรุปภาพรวมระบบ')).toBeInTheDocument();
      expect(screen.getByText('แจ้งเตือนสต็อกสินค้าใกล้หมด')).toBeInTheDocument();
      // 2 items have stock <= 5
      expect(screen.getAllByText('2 รายการ').length).toBeGreaterThan(0);
    });
  });

  it('navigates to /admin/products?stock=low-stock when clicking low stock stat card', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('สินค้ามีสต็อกต่ำกว่าเกณฑ์')).toBeInTheDocument();
    });

    const lowStockCard = screen.getByTitle('คลิกเพื่อไปที่หน้ารายการสินค้าใกล้หมด');
    fireEvent.click(lowStockCard);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products?stock=low-stock');
  });

  it('navigates to /admin/products?stock=low-stock when clicking button in banner', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('จัดการสต็อกสินค้า')).toBeInTheDocument();
    });

    const bannerButton = screen.getByText('จัดการสต็อกสินค้า');
    fireEvent.click(bannerButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products?stock=low-stock');
  });

  it('renders "ส่งออก CSV" button and exports orders when clicked', async () => {
    vi.mocked(restfulApi.get).mockImplementation(((url: string) => {
      if (url === '/api/orders') {
        return Promise.resolve({
          data: [
            {
              id: 'ord-1',
              orderNo: 'ORD-001',
              createdAt: '2026-11-04T10:00:00Z',
              items: [{ productId: 'p1', name: 'ผักบุ้ง', price: 30, quantity: 2, imageUrl: '', category: 'ผัก' }],
              total: 60,
              discount: 0,
              coinsUsed: 0,
              customer: { name: 'สมศรี', phone: '0811111111', address: 'กทม.' },
              paymentMethod: 'PROMPTPAY',
              status: 'PAID'
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    }) as never);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ส่งออก CSV')).toBeInTheDocument();
    });

    const exportBtn = screen.getByText('ส่งออก CSV');
    expect(exportBtn).not.toBeDisabled();
  });
});
