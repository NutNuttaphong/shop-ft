import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from './OrderDetailPage';
import { getCarrierTrackingUrl } from '../../../shared/utils/tracking';
import { restfulApi, RawOrder } from '../../../shared/services/api';

const stableUser = { username: 'testuser', role: 'user', displayName: 'Test User' };
vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: stableUser,
    isAuthenticated: true,
  })),
}));

const mockRawOrder: RawOrder = {
  id: 'ord-999',
  orderNo: 'FS-20261104-999',
  createdAt: '2026-11-04T12:00:00Z',
  items: [
    {
      productId: 'p-1',
      name: 'Organic Jasmine Rice 5kg',
      price: 250,
      quantity: 2,
      imageUrl: 'https://example.com/rice.jpg',
      category: 'ข้าวสาร',
    },
  ],
  total: 450,
  discount: 50,
  coinsUsed: 0,
  promoCode: 'DISCOUNT50',
  customer: {
    name: 'สมชาย รักดี',
    phone: '0812345678',
    address: '123/45 ถนนสุขุมวิท กรุงเทพฯ 10110',
  },
  paymentMethod: 'qr',
  status: 'SHIPPED',
  trackingNumber: 'TH1234567890',
  carrier: 'Flash Express',
};

describe('OrderDetailPage & Tracking Timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCarrierTrackingUrl', () => {
    it('returns null if no tracking number is provided', () => {
      expect(getCarrierTrackingUrl('Flash Express', undefined)).toBeNull();
      expect(getCarrierTrackingUrl('Kerry', '')).toBeNull();
    });

    it('generates Flash Express URL', () => {
      const url = getCarrierTrackingUrl('Flash Express', 'TH12345');
      expect(url).toContain('flashexpress.co.th');
      expect(url).toContain('TH12345');
    });

    it('generates Kerry Express URL', () => {
      const url = getCarrierTrackingUrl('Kerry Express', 'KEX12345');
      expect(url).toContain('kerryexpress.com');
      expect(url).toContain('KEX12345');
    });

    it('generates J&T Express URL', () => {
      const url = getCarrierTrackingUrl('J&T Express', 'JT9999');
      expect(url).toContain('jtexpress.co.th');
      expect(url).toContain('JT9999');
    });

    it('generates Thailand Post URL', () => {
      const url = getCarrierTrackingUrl('ไปรษณีย์ไทย EMS', 'ED123456789TH');
      expect(url).toContain('thailandpost.co.th');
      expect(url).toContain('ED123456789TH');
    });
  });

  describe('OrderDetailPage Component', () => {
    it('renders error message when order is not found', async () => {
      vi.spyOn(restfulApi, 'get').mockResolvedValue({
        data: [],
        error: null,
        status: 200,
      });

      render(
        <MemoryRouter initialEntries={['/orders/not-found-id']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ไม่พบข้อมูลคำสั่งซื้อดังกล่าว')).toBeInTheDocument();
      });
    });

    it('renders order details, tracking timeline, shipping address, and tracking link', async () => {
      vi.spyOn(restfulApi, 'get').mockResolvedValue({
        data: [mockRawOrder],
        error: null,
        status: 200,
      });

      render(
        <MemoryRouter initialEntries={['/orders/ord-999']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/FS-20261104-999/)).toBeInTheDocument();
      });

      // Stepper and Status
      expect(screen.getByText('สินค้าได้รับการจัดส่งเรียบร้อยแล้ว')).toBeInTheDocument();
      expect(screen.getByText('จัดส่งแล้ว')).toBeInTheDocument();

      // Tracking info and carrier check link
      expect(screen.getByText('Flash Express')).toBeInTheDocument();
      expect(screen.getByText('TH1234567890')).toBeInTheDocument();
      expect(screen.getByText('เช็คสถานะที่เว็บขนส่ง')).toBeInTheDocument();

      // Delivery Address
      expect(screen.getByText(/สมชาย รักดี/)).toBeInTheDocument();
      expect(screen.getByText(/123\/45 ถนนสุขุมวิท/)).toBeInTheDocument();

      // Payment & Financial Summary
      expect(screen.getByText('QR พร้อมเพย์')).toBeInTheDocument();
      expect(screen.getByText('฿450')).toBeInTheDocument();
      expect(screen.getByText('-฿50')).toBeInTheDocument();

      // Order Items
      expect(screen.getByText('Organic Jasmine Rice 5kg')).toBeInTheDocument();
    });

    it('handles copying tracking number', async () => {
      vi.spyOn(restfulApi, 'get').mockResolvedValue({
        data: [mockRawOrder],
        error: null,
        status: 200,
      });

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      render(
        <MemoryRouter initialEntries={['/orders/ord-999']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('TH1234567890')).toBeInTheDocument();
      });

      const copyBtn = screen.getByTitle('คัดลอกเลขพัสดุ');
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('TH1234567890');
      expect(await screen.findByText('คัดลอกแล้ว')).toBeInTheDocument();
    });
  });
});
