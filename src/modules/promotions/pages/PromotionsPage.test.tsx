import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PromotionsPage } from './PromotionsPage';
import { restfulApi, Promotion } from '../../../shared/services/api';
import { claimVoucher, getClaimedVouchers } from '../../../shared/utils/voucherWallet';

const mockPromotions: Promotion[] = [
  {
    id: 'promo-001',
    code: 'SAVE10',
    name: 'คูปองลด 10%',
    description: 'ลดทันที 10% เมื่อซื้อครบ 200 บาท',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchase: 200,
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    type: 'COUPON',
    imageUrl: 'https://example.com/promo1.jpg'
  },
  {
    id: 'promo-002',
    code: 'SAVE50',
    name: 'คูปองลด 50 บาท',
    description: 'ลดทันที 50 บาท',
    discountType: 'FIXED',
    discountValue: 50,
    minPurchase: 0,
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    type: 'COUPON',
    imageUrl: 'https://example.com/promo2.jpg'
  }
];

vi.mock('../../../shared/services/api', async () => {
  const actual = await vi.importActual('../../../shared/services/api');
  return {
    ...actual,
    restfulApi: {
      get: vi.fn()
    },
    logVisitorVisit: vi.fn()
  };
});

describe('PromotionsPage - Voucher Center & Wallet', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    vi.mocked(restfulApi.get).mockImplementation(async (url: string) => {
      if (url === '/api/promotions') {
        return { data: mockPromotions, error: null, status: 200 };
      }
      if (url === '/api/products') {
        return { data: [], error: null, status: 200 };
      }
      return { data: null, error: null, status: 200 };
    });
  });

  it('renders promotions list and voucher wallet badge', async () => {
    render(
      <MemoryRouter>
        <PromotionsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('คูปองลด 10%')).toBeInTheDocument();
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
      expect(screen.getByTestId('voucher-wallet-badge')).toHaveTextContent('กระเป๋าคูปองของฉัน: 0 ใบ');
    });
  });

  it('allows user to claim a voucher with visual feedback and toast notification', async () => {
    render(
      <MemoryRouter>
        <PromotionsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('claim-btn-SAVE10')).toBeInTheDocument();
    });

    // Click claim button
    fireEvent.click(screen.getByTestId('claim-btn-SAVE10'));

    await waitFor(() => {
      // Button changes to "เก็บแล้ว"
      expect(screen.getByTestId('claimed-badge-SAVE10')).toHaveTextContent('เก็บแล้ว');
      // Toast appears
      expect(screen.getByTestId('claimed-toast')).toHaveTextContent('SAVE10');
      // Wallet counter updates
      expect(screen.getByTestId('voucher-wallet-badge')).toHaveTextContent('กระเป๋าคูปองของฉัน: 1 ใบ');
      // Stored in localStorage
      expect(getClaimedVouchers()).toContain('SAVE10');
    });
  });

  it('displays "เก็บแล้ว" for pre-claimed vouchers upon initial render', async () => {
    claimVoucher('SAVE10');

    render(
      <MemoryRouter>
        <PromotionsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('claimed-badge-SAVE10')).toBeInTheDocument();
      expect(screen.getByTestId('claim-btn-SAVE50')).toBeInTheDocument();
      expect(screen.getByTestId('voucher-wallet-badge')).toHaveTextContent('กระเป๋าคูปองของฉัน: 1 ใบ');
    });
  });

  it('allows copying voucher code to clipboard', async () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(
      <MemoryRouter>
        <PromotionsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
    });

    const copyBtns = screen.getAllByTitle('คัดลอกโค้ดนี้');
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('SAVE10');
      expect(screen.getByText(/คัดลอกรหัสโค้ด "SAVE10" สำเร็จแล้ว/)).toBeInTheDocument();
    });
  });
});
