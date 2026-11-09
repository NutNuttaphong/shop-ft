export const CLAIMED_VOUCHERS_KEY = 'app_claimed_vouchers';

/**
 * Retrieve list of claimed voucher codes from localStorage
 */
export const getClaimedVouchers = (): string[] => {
  try {
    const raw = localStorage.getItem(CLAIMED_VOUCHERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(c => String(c).trim().toUpperCase()).filter(Boolean);
  } catch (err) {
    console.error('Failed to parse claimed vouchers from localStorage:', err);
    return [];
  }
};

/**
 * Check if a voucher code has already been claimed
 */
export const isVoucherClaimed = (code: string): boolean => {
  if (!code || !code.trim()) return false;
  const list = getClaimedVouchers();
  return list.includes(code.trim().toUpperCase());
};

/**
 * Claim a voucher code and store it in localStorage
 * @returns true if successfully claimed, false if already claimed or invalid
 */
export const claimVoucher = (code: string): boolean => {
  if (!code || !code.trim()) return false;
  const normalized = code.trim().toUpperCase();
  const list = getClaimedVouchers();

  if (list.includes(normalized)) {
    return false;
  }

  const updated = [...list, normalized];
  try {
    localStorage.setItem(CLAIMED_VOUCHERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('voucher-wallet-updated', { detail: { code: normalized } }));
    return true;
  } catch (err) {
    console.error('Failed to save claimed voucher to localStorage:', err);
    return false;
  }
};

/**
 * Remove a claimed voucher from the wallet
 */
export const removeClaimedVoucher = (code: string): boolean => {
  if (!code || !code.trim()) return false;
  const normalized = code.trim().toUpperCase();
  const list = getClaimedVouchers();
  const updated = list.filter(c => c !== normalized);

  if (updated.length === list.length) {
    return false;
  }

  try {
    localStorage.setItem(CLAIMED_VOUCHERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('voucher-wallet-updated', { detail: { code: normalized } }));
    return true;
  } catch (err) {
    console.error('Failed to update claimed vouchers in localStorage:', err);
    return false;
  }
};

/**
 * Clear all claimed vouchers from localStorage
 */
export const clearClaimedVouchers = (): void => {
  try {
    localStorage.removeItem(CLAIMED_VOUCHERS_KEY);
    window.dispatchEvent(new CustomEvent('voucher-wallet-updated'));
  } catch (err) {
    console.error('Failed to clear claimed vouchers:', err);
  }
};
