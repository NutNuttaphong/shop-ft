import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { saveAddress } from '../../../shared/utils/addressBook';

const mockUser = {
  username: 'somchai',
  role: 'user' as const,
  displayName: 'สมชาย ชาตรี',
  phone: '0812345678',
  address: '123/45 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500'
};

const mockUpdateProfile = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: mockUpdateProfile
  })
}));

describe('ProfilePage Address Book Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders profile and address book section', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/สมุดที่อยู่จัดส่งสินค้า/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /เพิ่มที่อยู่ใหม่/ })).toBeInTheDocument();
  });

  it('displays saved addresses with default badge', () => {
    saveAddress(
      {
        label: 'ที่ทำงาน',
        recipientName: 'สมชาย ชาตรี',
        phone: '0812345678',
        addressLine: '99 อาคารสุขุมวิททาวเวอร์ ชั้น 10 กทม. 10110',
        isDefault: true
      },
      'somchai'
    );

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText('ที่ทำงาน')).toBeInTheDocument();
    expect(screen.getByText(/99 อาคารสุขุมวิททาวเวอร์/)).toBeInTheDocument();
    expect(screen.getByText('ค่าเริ่มต้น')).toBeInTheDocument();
  });

  it('opens AddressModal when clicking "เพิ่มที่อยู่ใหม่"', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const addBtn = screen.getByRole('button', { name: /เพิ่มที่อยู่ใหม่/ });
    fireEvent.click(addBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มที่อยู่จัดส่งใหม่')).toBeInTheDocument();
  });

  it('deletes an address from the address book', async () => {
    saveAddress(
      {
        label: 'คอนโด',
        recipientName: 'สมชาย',
        phone: '0812345678',
        addressLine: '456 ถนนพหลโยธิน คอนโด A ห้อง 101 กทม. 10400'
      },
      'somchai'
    );

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText('คอนโด')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /ลบ/ });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('คอนโด')).not.toBeInTheDocument();
    });
  });

  it('sets another address as default', async () => {
    saveAddress(
      {
        label: 'บ้าน',
        recipientName: 'สมชาย',
        phone: '081',
        addressLine: 'บ้านเลขที่ 1',
        isDefault: true
      },
      'somchai'
    );
    saveAddress(
      {
        label: 'ที่ทำงาน',
        recipientName: 'สมชาย',
        phone: '082',
        addressLine: 'ตึกออฟฟิศ 2',
        isDefault: false
      },
      'somchai'
    );

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const setDefaultBtn = screen.getByRole('button', { name: 'ตั้งเป็นค่าเริ่มต้น' });
    fireEvent.click(setDefaultBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });
});
