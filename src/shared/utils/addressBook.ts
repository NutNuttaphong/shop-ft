export interface DeliveryAddress {
  id: string;
  label: 'บ้าน' | 'ที่ทำงาน' | 'คอนโด' | 'อื่นๆ' | string;
  recipientName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
  createdAt: string;
}

export const ADDRESS_LABELS = ['บ้าน', 'ที่ทำงาน', 'คอนโด', 'อื่นๆ'] as const;

function getStorageKey(username?: string): string {
  const user = username && username.trim() ? username.trim() : 'guest';
  return `app_user_addresses_${user}`;
}

/**
 * Retrieve saved delivery addresses from localStorage.
 * If empty and legacy fallback info exists, creates an initial default address.
 */
export function getSavedAddresses(
  username?: string,
  fallbackUserAddress?: { name?: string; phone?: string; address?: string }
): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  const key = getStorageKey(username);

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Seed from legacy profile address if available
    if (fallbackUserAddress && fallbackUserAddress.address && fallbackUserAddress.address.trim()) {
      const initial: DeliveryAddress = {
        id: `addr-${Date.now()}`,
        label: 'บ้าน',
        recipientName: fallbackUserAddress.name || 'ผู้รับสินค้า',
        phone: fallbackUserAddress.phone || '',
        addressLine: fallbackUserAddress.address.trim(),
        isDefault: true,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify([initial]));
      return [initial];
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Save an address (Create new or Update existing).
 */
export function saveAddress(
  address: {
    id?: string;
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    isDefault?: boolean;
  },
  username?: string
): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  const key = getStorageKey(username);
  const current = getSavedAddresses(username);

  const shouldBeDefault = address.isDefault ?? current.length === 0;

  let updatedList: DeliveryAddress[];

  if (address.id) {
    // Update existing
    updatedList = current.map(item => {
      if (item.id === address.id) {
        return {
          ...item,
          label: address.label,
          recipientName: address.recipientName,
          phone: address.phone,
          addressLine: address.addressLine,
          isDefault: shouldBeDefault ? true : item.isDefault
        };
      }
      return shouldBeDefault ? { ...item, isDefault: false } : item;
    });
  } else {
    // Add new
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine: address.addressLine,
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString()
    };

    if (shouldBeDefault) {
      updatedList = [newAddr, ...current.map(a => ({ ...a, isDefault: false }))];
    } else {
      updatedList = [...current, newAddr];
    }
  }

  // Ensure at least one is default if list not empty
  if (updatedList.length > 0 && !updatedList.some(a => a.isDefault)) {
    updatedList[0].isDefault = true;
  }

  try {
    localStorage.setItem(key, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('addresses-updated', { detail: { username } }));
  } catch {
    // Ignore error
  }

  return updatedList;
}

/**
 * Delete an address by ID.
 */
export function deleteAddress(id: string, username?: string): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  const key = getStorageKey(username);
  const current = getSavedAddresses(username);

  const target = current.find(a => a.id === id);
  const filtered = current.filter(a => a.id !== id);

  // If deleted item was default, promote the first remaining item
  if (target?.isDefault && filtered.length > 0) {
    filtered[0].isDefault = true;
  }

  try {
    localStorage.setItem(key, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('addresses-updated', { detail: { username } }));
  } catch {
    // Ignore error
  }

  return filtered;
}

/**
 * Set a specific address as default.
 */
export function setDefaultAddress(id: string, username?: string): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  const key = getStorageKey(username);
  const current = getSavedAddresses(username);

  const updated = current.map(item => ({
    ...item,
    isDefault: item.id === id
  }));

  try {
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('addresses-updated', { detail: { username } }));
  } catch {
    // Ignore error
  }

  return updated;
}

/**
 * Get default address for a user.
 */
export function getDefaultAddress(username?: string): DeliveryAddress | null {
  const addresses = getSavedAddresses(username);
  return addresses.find(a => a.isDefault) || (addresses.length > 0 ? addresses[0] : null);
}
