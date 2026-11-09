import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from './ProductDetailPage';
import { restfulApi, Product } from '../../../shared/services/api';

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { username: 'testuser', displayName: 'คุณทดสอบ', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
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
    },
    logVisitorVisit: vi.fn()
  };
});

const mockProduct: Product = {
  id: 'prod-test-01',
  name: 'เมล่อนฮอกไกโดเกรดพรีเมียม',
  price: 390,
  stock: 25,
  category: 'ผลไม้',
  imageUrl: 'https://example.com/melon.jpg',
  description: 'เมล่อนหอมหวาน ฉ่ำ สดส่งตรงจากฟาร์ม',
  videoUrl: ''
};

const mockBackendReviews = [
  {
    id: 'rev-1',
    username: 'คุณสมชาย',
    rating: 5,
    comment: 'หวานหอม อร่อยมาก บรรจุกล่องมาอย่างดีครับ',
    createdAt: '2026-11-05T10:00:00Z'
  },
  {
    id: 'rev-2',
    username: 'คุณวิภา',
    rating: 4,
    comment: 'ลูกใหญ่สดใหม่ แต่การส่งช้าไปนิดนึง โดยรวมดีค่ะ',
    createdAt: '2026-11-06T12:00:00Z'
  }
];

describe('ProductDetailPage - Product Reviews & Ratings System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(restfulApi.get).mockImplementation(((url: string) => {
      if (url === '/api/products/prod-test-01') {
        return Promise.resolve({ data: mockProduct });
      }
      if (url === '/api/products/prod-test-01/reviews') {
        return Promise.resolve({ data: mockBackendReviews });
      }
      if (url === '/api/products') {
        return Promise.resolve({ data: [mockProduct] });
      }
      return Promise.resolve({ data: null });
    }) as never);

    vi.mocked(restfulApi.post).mockImplementation(((url: string, body: Record<string, unknown>) => {
      if (url.includes('/reviews')) {
        return Promise.resolve({
          data: {
            id: 'rev-new-99',
            username: (body?.username as string) || 'ผู้ซื้อทั่วไป',
            rating: (body?.rating as number) || 5,
            comment: (body?.comment as string) || '',
            createdAt: new Date().toISOString()
          }
        });
      }
      return Promise.resolve({ data: {} });
    }) as never);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/products/prod-test-01']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders product details and accurate rating header summary', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('เมล่อนฮอกไกโดเกรดพรีเมียม').length).toBeGreaterThan(0);
      expect(screen.getByText(/390/)).toBeInTheDocument();
      // Average of 5 and 4 is 4.5
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('2 เรตติ้ง')).toBeInTheDocument();
    });
  });

  it('switches to reviews tab and renders star breakdown summary and reviews', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/รีวิวและคะแนน/)).toBeInTheDocument();
    });

    const reviewsTabBtn = screen.getByText(/รีวิวและคะแนน/);
    fireEvent.click(reviewsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('คะแนนความพึงพอใจเฉลี่ย')).toBeInTheDocument();
      expect(screen.getByText('หวานหอม อร่อยมาก บรรจุกล่องมาอย่างดีครับ')).toBeInTheDocument();
      expect(screen.getByText('ลูกใหญ่สดใหม่ แต่การส่งช้าไปนิดนึง โดยรวมดีค่ะ')).toBeInTheDocument();
      expect(screen.getAllByText('ผู้ซื้อที่ยืนยันแล้ว').length).toBe(2);
    });
  });

  it('filters reviews by star rating pill', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/รีวิวและคะแนน/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/รีวิวและคะแนน/));

    await waitFor(() => {
      expect(screen.getByText('หวานหอม อร่อยมาก บรรจุกล่องมาอย่างดีครับ')).toBeInTheDocument();
    });

    // Filter by 5 stars
    const star5Btn = screen.getByRole('button', { name: /5.*\(1\)/ });
    fireEvent.click(star5Btn);

    expect(screen.getByText('หวานหอม อร่อยมาก บรรจุกล่องมาอย่างดีครับ')).toBeInTheDocument();
    expect(screen.queryByText('ลูกใหญ่สดใหม่ แต่การส่งช้าไปนิดนึง โดยรวมดีค่ะ')).not.toBeInTheDocument();

    // Reset filter
    const allBtn = screen.getByText('ทั้งหมด (2)');
    fireEvent.click(allBtn);

    expect(screen.getByText('หวานหอม อร่อยมาก บรรจุกล่องมาอย่างดีครับ')).toBeInTheDocument();
    expect(screen.getByText('ลูกใหญ่สดใหม่ แต่การส่งช้าไปนิดนึง โดยรวมดีค่ะ')).toBeInTheDocument();
  });

  it('allows upvoting a review via helpful thumbs up button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/รีวิวและคะแนน/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/รีวิวและคะแนน/));

    await waitFor(() => {
      expect(screen.getAllByText(/มีประโยชน์ \(0\)/).length).toBeGreaterThan(0);
    });

    const helpfulButtons = screen.getAllByRole('button', { name: /มีประโยชน์/ });
    fireEvent.click(helpfulButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/มีประโยชน์ \(1\)/)).toBeInTheDocument();
    });
  });

  it('submits a new review and updates review list and feedback message', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/รีวิวและคะแนน/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/รีวิวและคะแนน/));

    await waitFor(() => {
      expect(screen.getByText('เขียนรีวิวผลิตภัณฑ์นี้')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText(/บอกเล่าความรู้สึกและคุณภาพสินค้า/);
    const nameInput = screen.getByPlaceholderText(/ชื่อของคุณสำหรับแสดงบนรีวิว/);
    const submitBtn = screen.getByRole('button', { name: /ส่งรีวิวสินค้า/ });

    fireEvent.change(commentInput, { target: { value: 'รสชาติดีเลิศ สดกรอบ คุ้มเกินราคาจริงๆ' } });
    fireEvent.change(nameInput, { target: { value: 'คุณกานต์' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ส่งรีวิวและอัปเดตคะแนนผลิตภัณฑ์ของคุณสำเร็จแล้ว/)).toBeInTheDocument();
    });
  });
});
