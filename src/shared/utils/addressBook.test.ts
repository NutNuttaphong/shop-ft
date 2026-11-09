import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
} from './addressBook';

describe('addressBook utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no addresses exist and no fallback provided', () => {
    expect(getSavedAddresses('testuser')).toEqual([]);
  });

  it('seeds default address from fallback user profile if no addresses exist', () => {
    const list = getSavedAddresses('testuser', {
      name: 'สมชาย รักดี',
      phone: '0812345678',
      address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110'
    });

    expect(list.length).toBe(1);
    expect(list[0].label).toBe('บ้าน');
    expect(list[0].recipientName).toBe('สมชาย รักดี');
    expect(list[0].phone).toBe('0812345678');
    expect(list[0].isDefault).toBe(true);
  });

  it('saves first address as default automatically', () => {
    const list = saveAddress(
      {
        label: 'ที่ทำงาน',
        recipientName: 'สมหญิง แสนสุข',
        phone: '0898765432',
        addressLine: '99/1 อาคารสุขใจ ชั้น 15 ถนนสาทร กทม. 10120'
      },
      'testuser'
    );

    expect(list.length).toBe(1);
    expect(list[0].isDefault).toBe(true);
    expect(getDefaultAddress('testuser')?.id).toBe(list[0].id);
  });

  it('adds second address without overriding default unless specified', () => {
    saveAddress(
      {
        label: 'บ้าน',
        recipientName: 'สมชาย',
        phone: '0811111111',
        addressLine: '123 หมู่ 1 บ้านเรา'
      },
      'testuser'
    );

    const list = saveAddress(
      {
        label: 'คอนโด',
        recipientName: 'สมชาย',
        phone: '0811111111',
        addressLine: '456 คอนโดหรู ห้อง 808'
      },
      'testuser'
    );

    expect(list.length).toBe(2);
    expect(list[0].label).toBe('บ้าน');
    expect(list[0].isDefault).toBe(true);
    expect(list[1].label).toBe('คอนโด');
    expect(list[1].isDefault).toBe(false);
  });

  it('sets a new address as default and clears previous default', () => {
    saveAddress(
      {
        label: 'บ้าน',
        recipientName: 'สมชาย',
        phone: '0811111111',
        addressLine: '123 หมู่ 1 บ้านเรา'
      },
      'testuser'
    );

    const list = saveAddress(
      {
        label: 'ออฟฟิศ',
        recipientName: 'สมชาย',
        phone: '0811111111',
        addressLine: '999 ตึกสูง ชั้น 20',
        isDefault: true
      },
      'testuser'
    );

    expect(list.length).toBe(2);
    const office = list.find(a => a.label === 'ออฟฟิศ');
    const home = list.find(a => a.label === 'บ้าน');
    expect(office?.isDefault).toBe(true);
    expect(home?.isDefault).toBe(false);
    expect(getDefaultAddress('testuser')?.label).toBe('ออฟฟิศ');
  });

  it('updates an existing address by id', () => {
    const list = saveAddress(
      {
        label: 'บ้าน',
        recipientName: 'สมชาย',
        phone: '0811111111',
        addressLine: '123 หมู่ 1 บ้านเรา'
      },
      'testuser'
    );

    const originalId = list[0].id;
    const updated = saveAddress(
      {
        id: originalId,
        label: 'บ้านสวน',
        recipientName: 'สมชาย รักดี',
        phone: '0822222222',
        addressLine: '123 หมู่ 1 บ้านสวนริมน้ำ'
      },
      'testuser'
    );

    expect(updated.length).toBe(1);
    expect(updated[0].label).toBe('บ้านสวน');
    expect(updated[0].recipientName).toBe('สมชาย รักดี');
    expect(updated[0].phone).toBe('0822222222');
  });

  it('deletes an address and promotes remaining address to default if needed', () => {
    const l1 = saveAddress(
      { label: 'ที่ 1', recipientName: 'A', phone: '081', addressLine: 'ที่อยู่ 1' },
      'testuser'
    );
    const l2 = saveAddress(
      { label: 'ที่ 2', recipientName: 'B', phone: '082', addressLine: 'ที่อยู่ 2' },
      'testuser'
    );

    expect(l2.length).toBe(2);
    expect(l2[0].isDefault).toBe(true);

    const remaining = deleteAddress(l1[0].id, 'testuser');
    expect(remaining.length).toBe(1);
    expect(remaining[0].label).toBe('ที่ 2');
    expect(remaining[0].isDefault).toBe(true);
  });

  it('changes default address with setDefaultAddress', () => {
    saveAddress(
      { label: 'บ้าน', recipientName: 'A', phone: '081', addressLine: 'บ้าน' },
      'testuser'
    );
    const l = saveAddress(
      { label: 'คอนโด', recipientName: 'B', phone: '082', addressLine: 'คอนโด' },
      'testuser'
    );

    const condoId = l.find(a => a.label === 'คอนโด')!.id;
    const after = setDefaultAddress(condoId, 'testuser');

    expect(after.find(a => a.id === condoId)?.isDefault).toBe(true);
    expect(after.find(a => a.label === 'บ้าน')?.isDefault).toBe(false);
  });
});
