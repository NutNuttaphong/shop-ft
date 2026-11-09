import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SmartSearchBar } from './SmartSearchBar';
import { Product } from '../../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'ข้าวหอมมะลิอินทรีย์ 5 กก.',
    price: 250,
    description: 'ข้าวหอมมะลิคุณภาพสูง ปลอดสารพิษ',
    category: 'ข้าวสาร',
    imageUrl: 'https://example.com/jasmine.jpg',
    stock: 20
  },
  {
    id: 'prod-2',
    name: 'ผักกาดหอมสดไฮโดรโปนิกส์',
    price: 45,
    description: 'ผักสลัดกรอบสดใหม่ ส่งตรงจากฟาร์ม',
    category: 'ผักสด',
    imageUrl: 'https://example.com/lettuce.jpg',
    stock: 0 // out of stock
  },
  {
    id: 'prod-3',
    name: 'ส้มสายน้ำผึ้งเกรด A 1 กก.',
    price: 90,
    description: 'ส้มหวานฉ่ำ สดจากไร่',
    category: 'ผลไม้',
    imageUrl: 'https://example.com/orange.jpg',
    stock: 15
  }
];

describe('SmartSearchBar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('renders input with default placeholder', () => {
    render(
      <MemoryRouter>
        <SmartSearchBar value="" onChange={() => {}} products={mockProducts} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('ค้นหาชื่อสินค้า หรือหมวดหมู่ที่คุณต้องการ...')).toBeInTheDocument();
  });

  it('displays popular tags and recent searches on focus when input is empty', () => {
    localStorage.setItem('app_search_history', JSON.stringify(['แตงโม']));

    render(
      <MemoryRouter>
        <SmartSearchBar value="" onChange={() => {}} products={mockProducts} />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText('ประวัติการค้นหาล่าสุด')).toBeInTheDocument();
    expect(screen.getByText('แตงโม')).toBeInTheDocument();
    expect(screen.getByText('คำค้นหายอดนิยม')).toBeInTheDocument();
    expect(screen.getByText('ผักสด')).toBeInTheDocument();
  });

  it('submits search when a popular tag is clicked', () => {
    const handleSearch = vi.fn();
    const handleChange = vi.fn();

    render(
      <MemoryRouter>
        <SmartSearchBar
          value=""
          onChange={handleChange}
          onSearch={handleSearch}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    const vegTag = screen.getByText('ผักสด');
    fireEvent.click(vegTag);

    expect(handleChange).toHaveBeenCalledWith('ผักสด');
    expect(handleSearch).toHaveBeenCalledWith('ผักสด');
    // Also saved to history
    expect(localStorage.getItem('app_search_history')).toContain('ผักสด');
  });

  it('shows real-time product matches with thumbnail, price, and stock info when query is typed', () => {
    render(
      <MemoryRouter>
        <SmartSearchBar
          value="ข้าว"
          onChange={() => {}}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText(/ผลลัพธ์ด่วน/)).toBeInTheDocument();
    expect(screen.getByText('ข้าวหอมมะลิอินทรีย์ 5 กก.')).toBeInTheDocument();
    expect(screen.getByText('฿250')).toBeInTheDocument();
    expect(screen.getByText('• มีสินค้า')).toBeInTheDocument();
  });

  it('navigates to product detail page when a product match is clicked', () => {
    render(
      <MemoryRouter>
        <SmartSearchBar
          value="ส้ม"
          onChange={() => {}}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    const orangeItem = screen.getByText('ส้มสายน้ำผึ้งเกรด A 1 กก.');
    fireEvent.click(orangeItem);

    expect(mockNavigate).toHaveBeenCalledWith('/products/prod-3');
    expect(localStorage.getItem('app_search_history')).toContain('ส้มสายน้ำผึ้งเกรด A 1 กก.');
  });

  it('displays empty state when no products match the query', () => {
    render(
      <MemoryRouter>
        <SmartSearchBar
          value="หูฟังบลูทูธ"
          onChange={() => {}}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText(/ไม่พบสินค้าที่ตรงกับ/)).toBeInTheDocument();
  });

  it('clears input when clear button (X) is clicked', () => {
    const handleChange = vi.fn();

    render(
      <MemoryRouter>
        <SmartSearchBar
          value="ข้าว"
          onChange={handleChange}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const clearButton = screen.getByLabelText('ล้างคำค้นหา');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('submits search on Enter key and closes dropdown', () => {
    const handleSearch = vi.fn();

    render(
      <MemoryRouter>
        <SmartSearchBar
          value="ข้าวหอม"
          onChange={() => {}}
          onSearch={handleSearch}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSearch).toHaveBeenCalledWith('ข้าวหอม');
    expect(screen.queryByTestId('search-suggestions-dropdown')).not.toBeInTheDocument();
  });

  it('closes dropdown on Escape key', () => {
    render(
      <MemoryRouter>
        <SmartSearchBar
          value="ข้าว"
          onChange={() => {}}
          products={mockProducts}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(screen.getByTestId('search-suggestions-dropdown')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('search-suggestions-dropdown')).not.toBeInTheDocument();
  });
});
