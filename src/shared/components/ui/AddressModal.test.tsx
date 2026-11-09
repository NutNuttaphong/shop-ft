import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressModal } from './AddressModal';

describe('AddressModal Component', () => {
  const handleClose = vi.fn();
  const handleSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <AddressModal
        isOpen={false}
        onClose={handleClose}
        onSave={handleSave}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with default values when opened', () => {
    render(
      <AddressModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        defaultRecipientName="สมศรี รวยทรัพย์"
        defaultPhone="0899999999"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มที่อยู่จัดส่งใหม่')).toBeInTheDocument();
    expect(screen.getByDisplayValue('สมศรี รวยทรัพย์')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0899999999')).toBeInTheDocument();
  });

  it('validates required fields on submit', () => {
    render(
      <AddressModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'เพิ่มที่อยู่' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('กรุณาระบุชื่อ-นามสกุลผู้รับ')).toBeInTheDocument();
    expect(screen.getByText('กรุณาระบุเบอร์โทรศัพท์ผู้รับ')).toBeInTheDocument();
    expect(screen.getByText('กรุณาระบุที่อยู่จัดส่งอย่างละเอียด')).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('submits valid data when filled properly', () => {
    render(
      <AddressModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('ชื่อ-นามสกุล'), {
      target: { value: 'วีระชัย มีชัย' }
    });
    fireEvent.change(screen.getByPlaceholderText('เช่น 0812345678'), {
      target: { value: '0812345678' }
    });
    fireEvent.change(screen.getByPlaceholderText(/บ้านเลขที่/), {
      target: { value: '123/45 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500' }
    });

    const submitBtn = screen.getByRole('button', { name: 'เพิ่มที่อยู่' });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith({
      id: undefined,
      label: 'บ้าน',
      recipientName: 'วีระชัย มีชัย',
      phone: '0812345678',
      addressLine: '123/45 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
      isDefault: false
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('loads initialData when editing', () => {
    const existing = {
      id: 'addr-test',
      label: 'ที่ทำงาน',
      recipientName: 'กานต์ ประเสริฐ',
      phone: '0867890123',
      addressLine: '999 อาคารเพชร ถนนพระราม 9 ห้วยขวาง กทม. 10310',
      isDefault: true,
      createdAt: '2026-11-04T12:00:00Z'
    };

    render(
      <AddressModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        initialData={existing}
      />
    );

    expect(screen.getByText('แก้ไขที่อยู่จัดส่ง')).toBeInTheDocument();
    expect(screen.getByDisplayValue('กานต์ ประเสริฐ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0867890123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('999 อาคารเพชร ถนนพระราม 9 ห้วยขวาง กทม. 10310')).toBeInTheDocument();
  });
});
