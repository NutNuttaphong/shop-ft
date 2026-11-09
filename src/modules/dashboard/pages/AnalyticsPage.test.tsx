import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnalyticsPage } from './AnalyticsPage';
import { restfulApi } from '../../../shared/services/api';
import * as exportUtils from '../../../shared/utils/exportUtils';

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

const mockAnalyticsData = {
  totalSales: 89500,
  totalVisitors: 4200,
  conversionRate: 4.8,
  totalOrders: 320,
  dailySales: [
    { date: '1 พ.ย. 2026', sales: 12000, orders: 40, visitors: 600 },
    { date: '2 พ.ย. 2026', sales: 15500, orders: 55, visitors: 750 }
  ],
  categorySales: [
    { category: 'ผักสด', sales: 45000 },
    { category: 'ผลไม้', sales: 44500 }
  ],
  paymentMethodSales: [
    { method: 'พร้อมเพย์ QR Code', sales: 60000, count: 200 }
  ],
  topProducts: [
    { name: 'ผักกาดขาวอินทรีย์', category: 'ผักสด', quantitySold: 250, revenue: 12500, imageUrl: '' },
    { name: 'กล้วยหอมทอง', category: 'ผลไม้', quantitySold: 180, revenue: 14400, imageUrl: '' }
  ]
};

describe('AnalyticsPage - Sales Report Export Tests', () => {
  let downloadCSVSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    downloadCSVSpy = vi.spyOn(exportUtils, 'downloadCSV').mockReturnValue(true);

    vi.mocked(restfulApi.get).mockImplementation(((url: string) => {
      if (url === '/api/analytics/overview') {
        return Promise.resolve({ data: mockAnalyticsData });
      }
      if (url === '/api/orders') {
        return Promise.resolve({
          data: [
            {
              id: 'ord-101',
              orderNo: 'ORD-101',
              createdAt: '2026-11-04T12:00:00Z',
              items: [{ productId: 'p1', name: 'ผักกาดขาว', price: 50, quantity: 2, imageUrl: '', category: 'ผักสด' }],
              total: 100,
              discount: 0,
              coinsUsed: 0,
              customer: { name: 'คุณมานี', phone: '0899999999', address: 'กรุงเทพฯ' },
              paymentMethod: 'PROMPTPAY',
              status: 'COMPLETED'
            }
          ]
        });
      }
      return Promise.resolve({ data: null });
    }) as never);
  });

  it('renders analytics dashboard with overview numbers correctly', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('วิเคราะห์และสถิติร้านค้า')).toBeInTheDocument();
      expect(screen.getByText('89,500')).toBeInTheDocument();
      expect(screen.getByText('4,200')).toBeInTheDocument();
      expect(screen.getByText('4.8%')).toBeInTheDocument();
    });
  });

  it('toggles export dropdown menu when clicking "ส่งออกรายงาน"', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ส่งออกรายงาน')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('ส่งออกรายงาน');
    fireEvent.click(exportButton);

    expect(screen.getByText('สรุปยอดขายรายวัน (CSV)')).toBeInTheDocument();
    expect(screen.getByText('สินค้าขายดี 5 อันดับ (CSV)')).toBeInTheDocument();
    expect(screen.getByText('รายการคำสั่งซื้อทั้งหมด (CSV)')).toBeInTheDocument();
  });

  it('exports daily sales report from dropdown menu', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ส่งออกรายงาน')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ส่งออกรายงาน'));
    const exportDailyButton = screen.getByText('สรุปยอดขายรายวัน (CSV)');
    fireEvent.click(exportDailyButton);

    expect(downloadCSVSpy).toHaveBeenCalled();
    const [filename, content] = downloadCSVSpy.mock.calls[0];
    expect(filename).toContain('frist-shop-daily-sales');
    expect(content).toContain('วันที่ (Date)');
    expect(content).toContain('1 พ.ย. 2026');

    await waitFor(() => {
      expect(screen.getByText('ดาวน์โหลดรายงานสรุปยอดขายรายวัน (CSV) สำเร็จ')).toBeInTheDocument();
    });
  });

  it('exports top products report from dropdown menu', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ส่งออกรายงาน')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ส่งออกรายงาน'));
    const exportTopProductsButton = screen.getByText('สินค้าขายดี 5 อันดับ (CSV)');
    fireEvent.click(exportTopProductsButton);

    expect(downloadCSVSpy).toHaveBeenCalled();
    const [filename, content] = downloadCSVSpy.mock.calls[0];
    expect(filename).toContain('frist-shop-top-products');
    expect(content).toContain('ผักกาดขาวอินทรีย์');

    await waitFor(() => {
      expect(screen.getByText('ดาวน์โหลดรายงานสินค้าขายดี (CSV) สำเร็จ')).toBeInTheDocument();
    });
  });

  it('exports all orders report by fetching orders list', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ส่งออกรายงาน')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ส่งออกรายงาน'));
    const exportOrdersButton = screen.getByText('รายการคำสั่งซื้อทั้งหมด (CSV)');
    fireEvent.click(exportOrdersButton);

    await waitFor(() => {
      expect(downloadCSVSpy).toHaveBeenCalled();
      const [filename, content] = downloadCSVSpy.mock.calls[0];
      expect(filename).toContain('frist-shop-all-orders');
      expect(content).toContain('ORD-101');
      expect(content).toContain('คุณมานี');
      expect(screen.getByText(/ดาวน์โหลดรายการคำสั่งซื้อ 1 รายการ \(CSV\) สำเร็จ/)).toBeInTheDocument();
    });
  });

  it('downloads daily sales directly from table button', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ดาวน์โหลดตาราง CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ดาวน์โหลดตาราง CSV'));

    expect(downloadCSVSpy).toHaveBeenCalled();
    const [filename] = downloadCSVSpy.mock.calls[0];
    expect(filename).toContain('frist-shop-daily-sales');
  });
});
