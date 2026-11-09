import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CLAIMED_VOUCHERS_KEY,
  getClaimedVouchers,
  isVoucherClaimed,
  claimVoucher,
  removeClaimedVoucher,
  clearClaimedVouchers
} from './voucherWallet';

describe('voucherWallet utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns empty array when no vouchers have been claimed', () => {
    expect(getClaimedVouchers()).toEqual([]);
  });

  it('claims a new voucher successfully and normalizes to uppercase', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    const result = claimVoucher('frist10');
    expect(result).toBe(true);
    expect(getClaimedVouchers()).toEqual(['FRIST10']);
    expect(isVoucherClaimed('FRIST10')).toBe(true);
    expect(isVoucherClaimed('frist10')).toBe(true);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('prevents claiming duplicate voucher codes', () => {
    expect(claimVoucher('WELCOME50')).toBe(true);
    expect(claimVoucher('WELCOME50')).toBe(false);
    expect(claimVoucher('welcome50')).toBe(false);
    expect(getClaimedVouchers()).toEqual(['WELCOME50']);
  });

  it('handles empty or whitespace-only code gracefully', () => {
    expect(claimVoucher('')).toBe(false);
    expect(claimVoucher('   ')).toBe(false);
    expect(isVoucherClaimed('')).toBe(false);
    expect(getClaimedVouchers()).toEqual([]);
  });

  it('removes a claimed voucher correctly', () => {
    claimVoucher('SAVE20');
    claimVoucher('DISCOUNT5');
    expect(getClaimedVouchers()).toEqual(['SAVE20', 'DISCOUNT5']);

    const removed = removeClaimedVoucher('SAVE20');
    expect(removed).toBe(true);
    expect(getClaimedVouchers()).toEqual(['DISCOUNT5']);
    expect(isVoucherClaimed('SAVE20')).toBe(false);

    // Removing non-existent voucher
    expect(removeClaimedVoucher('NONEXISTENT')).toBe(false);
  });

  it('clears all claimed vouchers', () => {
    claimVoucher('CODE1');
    claimVoucher('CODE2');
    expect(getClaimedVouchers().length).toBe(2);

    clearClaimedVouchers();
    expect(getClaimedVouchers()).toEqual([]);
  });

  it('handles corrupted localStorage data without crashing', () => {
    localStorage.setItem(CLAIMED_VOUCHERS_KEY, '{invalid json');
    expect(getClaimedVouchers()).toEqual([]);
  });

  it('handles non-array localStorage data gracefully', () => {
    localStorage.setItem(CLAIMED_VOUCHERS_KEY, JSON.stringify({ not: 'an array' }));
    expect(getClaimedVouchers()).toEqual([]);
  });
});
