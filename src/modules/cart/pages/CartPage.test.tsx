import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartPage } from './CartPage';
import { restfulApi } from '../../../shared/services/api';
import { saveAddress } from '../../../shared/utils/addressBook';
import { claimVoucher } from '../../../shared/utils/voucherWallet';

const mockUser = {
  username: 'customer1',
  role: 'user' as const,
  displayName: 'สมชาย รักดี',
  phone: '0812345678',
  address: '123 ถนนสีลม กทม.'
};

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    updateProfile: vi.fn()
  })
}));

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

describe('CartPage Address Book Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(restfulApi.get).mockImplementation(async (url: string) => {
      if (url === '/api/cart') {
        return {
          data: [
            {
              productId: 'p-1',
              name: 'ข้าวหอมมะลิ 5 กก.',
              price: 250,
              quantity: 1,
              imageUrl: 'https://example.com/rice.jpg',
              stock: 10,
              category: 'ข้าวสาร'
            }
          ],
          error: null,
          status: 200
        };
      }
      return { data: null, error: null, status: 200 };
    });
  });

  it('displays saved address selector chips when user has saved addresses', async () => {
    saveAddress(
      {
        label: 'ที่ทำงาน',
        recipientName: 'สมชาย ออฟฟิศ',
        phone: '0891112222',
        addressLine: '99 อาคารสุขุมวิท กทม.',
        isDefault: true
      },
      'customer1'
    );

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('เลือกจากสมุดที่อยู่ของคุณ')).toBeInTheDocument();
      expect(screen.getByText('ที่ทำงาน')).toBeInTheDocument();
    });
  });

  it('populates recipient name, phone, and address when selecting an address', async () => {
    saveAddress(
      {
        label: 'บ้าน',
        recipientName: 'สมชาย',
        phone: '0811111111',
        addressLine: 'บ้านเลขที่ 1 สุขุมวิท กทม.',
        isDefault: true
      },
      'customer1'
    );
    saveAddress(
      {
        label: 'คอนโด',
        recipientName: 'สมชาย คอนโด',
        phone: '0822222222',
        addressLine: 'คอนโดห้อง 999 ถนนเพชรบุรี กทม.',
        isDefault: false
      },
      'customer1'
    );

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('คอนโด')).toBeInTheDocument();
    });

    const condoBtn = screen.getByText('คอนโด').closest('button')!;
    fireEvent.click(condoBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('สมชาย คอนโด')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0822222222')).toBeInTheDocument();
      expect(screen.getByDisplayValue('คอนโดห้อง 999 ถนนเพชรบุรี กทม.')).toBeInTheDocument();
    });
  });

  it('renders "บันทึกที่อยู่นี้ลงในสมุดที่อยู่" checkbox for logged-in users', async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('บันทึกที่อยู่นี้ลงในสมุดที่อยู่สำหรับครั้งต่อไป')).toBeInTheDocument();
    });
  });
});

describe('CartPage Voucher Wallet Integration', () => {
  const mockActivePromotions = [
    {
      id: 'promo-1',
      code: 'SAVE10',
      name: 'ส่วนลด 10% สำหรับยอด 200+',
      description: 'ลด 10%',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 200,
      isActive: true,
      startDate: '2025-01-01',
      endDate: '2027-12-31',
      type: 'COUPON'
    },
    {
      id: 'promo-2',
      code: 'BIG500',
      name: 'ลด 500 บาท สำหรับยอด 1,000+',
      description: 'ลด 500 บาท',
      discountType: 'FIXED',
      discountValue: 500,
      minPurchase: 1000,
      isActive: true,
      startDate: '2025-01-01',
      endDate: '2027-12-31',
      type: 'COUPON'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(restfulApi.get).mockImplementation(async (url: string) => {
      if (url === '/api/cart') {
        return {
          data: [
            {
              productId: 'p-1',
              name: 'ข้าวหอมมะลิ 5 กก.',
              price: 250,
              quantity: 1,
              imageUrl: 'https://example.com/rice.jpg',
              stock: 10,
              category: 'ข้าวสาร'
            }
          ],
          error: null,
          status: 200
        };
      }
      if (url === '/api/promotions') {
        return {
          data: mockActivePromotions,
          error: null,
          status: 200
        };
      }
      if (url === '/api/promotions/validate/SAVE10') {
        return {
          data: mockActivePromotions[0],
          error: null,
          status: 200
        };
      }
      return { data: null, error: null, status: 200 };
    });
  });

  it('renders voucher wallet button and opens modal showing empty state when no vouchers claimed', async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('open-voucher-wallet-btn')).toHaveTextContent('กระเป๋าคูปอง (0)');
      expect(screen.getByTestId('select-my-vouchers-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('select-my-vouchers-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('voucher-modal')).toBeInTheDocument();
      expect(screen.getByText('คุณยังไม่มีคูปองที่เก็บไว้ในกระเป๋า')).toBeInTheDocument();
      expect(screen.getByText('ไปที่ศูนย์รวมคูปอง')).toBeInTheDocument();
    });
  });

  it('displays claimed vouchers in modal with eligibility check against cart subtotal', async () => {
    claimVoucher('SAVE10');
    claimVoucher('BIG500');

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('open-voucher-wallet-btn')).toHaveTextContent('กระเป๋าคูปอง (2)');
    });

    fireEvent.click(screen.getByTestId('open-voucher-wallet-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('voucher-modal')).toBeInTheDocument();
      // SAVE10 is eligible (250 >= 200)
      expect(screen.getByTestId('apply-voucher-btn-SAVE10')).toHaveTextContent('ใช้คูปองนี้');
      // BIG500 is ineligible (250 < 1000)
      expect(screen.getByText(/ขาดอีก 750 บาท/)).toBeInTheDocument();
      expect(screen.getByText('ยอดไม่ถึงเกณฑ์')).toBeInTheDocument();
    });
  });

  it('allows 1-click apply of eligible voucher and recalculates total discount', async () => {
    claimVoucher('SAVE10');

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('select-my-vouchers-btn')).toBeInTheDocument();
    });

    // Open voucher modal
    fireEvent.click(screen.getByTestId('select-my-vouchers-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('apply-voucher-btn-SAVE10')).toBeInTheDocument();
    });

    // 1-click apply
    fireEvent.click(screen.getByTestId('apply-voucher-btn-SAVE10'));

    await waitFor(() => {
      // Modal closed
      expect(screen.queryByTestId('voucher-modal')).not.toBeInTheDocument();
      // Coupon applied in summary (10% of 250 = 25)
      expect(screen.getAllByText(/SAVE10/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/-25 บาท/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('ใช้คูปองส่วนลดสำเร็จแล้วค่ะ!')).toBeInTheDocument();
    });
  });
});
