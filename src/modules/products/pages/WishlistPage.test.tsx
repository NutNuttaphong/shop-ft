import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WishlistPage } from './WishlistPage';
import { toggleWishlist } from '../../../shared/utils/wishlist';
import { Product } from '../../../shared/services/api';

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
}));

const sampleProduct: Product = {
  id: 'w-1',
  name: 'Organic Jasmine Rice',
  price: 180,
  description: 'Premium rice',
  category: 'ข้าวสาร',
  imageUrl: 'https://example.com/rice.jpg',
  stock: 15,
};

describe('WishlistPage component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders empty wishlist state initially', () => {
    render(
      <MemoryRouter>
        <WishlistPage />
      </MemoryRouter>
    );

    expect(screen.getByText('ยังไม่มีสินค้าที่ถูกใจ')).toBeInTheDocument();
    expect(screen.getByText('0 รายการ')).toBeInTheDocument();
  });

  it('renders product cards when items are present in wishlist', () => {
    toggleWishlist(sampleProduct);

    render(
      <MemoryRouter>
        <WishlistPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Organic Jasmine Rice')).toBeInTheDocument();
    expect(screen.getByText('฿180')).toBeInTheDocument();
    expect(screen.getByText('1 รายการ')).toBeInTheDocument();
    expect(screen.getByText('ย้ายลงตะกร้า')).toBeInTheDocument();
  });

  it('removes item from wishlist when clicking the trash button', () => {
    toggleWishlist(sampleProduct);

    render(
      <MemoryRouter>
        <WishlistPage />
      </MemoryRouter>
    );

    const deleteBtn = screen.getByTitle('ลบออกจากรายการถูกใจ');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('ยังไม่มีสินค้าที่ถูกใจ')).toBeInTheDocument();
  });
});
