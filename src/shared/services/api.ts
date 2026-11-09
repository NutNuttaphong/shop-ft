/**
 * RESTful API Service
 * Connects to the real Spring Boot backend at localhost:8080
 */

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (rawEnvUrl && rawEnvUrl !== 'undefined' && rawEnvUrl !== 'null') 
  ? rawEnvUrl 
  : '';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// Interface for Product
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  imageUrls?: string[];
  rawImageUrl?: string;
  videoUrl?: string;
  stock: number;
  createdAt?: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  isActive: boolean;
  active?: boolean;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  type?: string; // COUPON, FLASH_SALE, BUNDLE_DEAL, DISCOUNT_CAMPAIGN
  productIds?: string[];
  bundleQty?: number;
  targetCategory?: string;
}

// Backend wraps everything in { success, message, data, status }
interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

/**
 * Get the JWT token from localStorage
 */
export function getToken(): string | null {
  try {
    const session = localStorage.getItem('app_auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      return typeof parsed?.token === 'string' ? parsed.token : null;
    }
  } catch {
    // Ignore JSON parse or localStorage access errors
  }
  return null;
}

/**
 * Build headers with optional auth token
 */
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

interface RawPromotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType?: string;
  discountValue: number;
  minPurchase: number;
  active?: boolean;
  isActive?: boolean;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  type?: string;
  productIds?: string[];
  bundleQty?: number;
  targetCategory?: string;
}

export interface RawOrder {
  id: string;
  orderNo: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    category: string;
    variant?: string | null;
  }[];
  total: number;
  discount: number;
  coinsUsed: number;
  promoCode?: string | null;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  slipUploaded?: boolean;
  slipName?: string | null;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  returnReason?: string;
  returnDescription?: string;
  disputeOpened?: boolean;
  disputeReason?: string | null;
  disputeStatus?: string;
}

/**
 * Normalize promotion data from backend (Java enums are UPPERCASE)
 */
function normalizePromotion(p: RawPromotion): Promotion {
  return {
    ...p,
    discountType: (p.discountType || '').toLowerCase() as 'percentage' | 'fixed',
    isActive: p.active !== undefined ? p.active : !!p.isActive,
  };
}

/**
 * RESTful API Client Wrapper class
 */
class RestClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private normalizeResponseData<T>(path: string, data: unknown): T {
    if (!data) return data as T;

    const normalizeImageField = (obj: unknown) => {
      if (!obj || typeof obj !== 'object') return obj;
      const record = obj as Record<string, unknown>;
      if (typeof record.imageUrl === 'string' && record.imageUrl.includes('|')) {
        const rawImageUrl = record.imageUrl;
        const imageUrls = rawImageUrl.split('|');
        record.imageUrl = imageUrls[0] || '';
        record.imageUrls = imageUrls;
        record.rawImageUrl = rawImageUrl;
      } else if (typeof record.imageUrl === 'string') {
        record.imageUrls = record.imageUrl ? [record.imageUrl] : [];
        record.rawImageUrl = record.imageUrl;
      }
      return obj;
    };

    const deepNormalize = (val: unknown): unknown => {
      if (!val) return val;
      if (Array.isArray(val)) {
        return (val as unknown[]).map(deepNormalize);
      }
      if (typeof val === 'object') {
        normalizeImageField(val);
        const record = val as Record<string, unknown>;
        for (const key in record) {
          if (Object.prototype.hasOwnProperty.call(record, key)) {
            const childVal = record[key];
            if (Array.isArray(childVal) || (childVal && typeof childVal === 'object')) {
              record[key] = deepNormalize(childVal);
            }
          }
        }
      }
      return val;
    };

    let processed: unknown = data;
    if (path.includes('/api/promotions')) {
      if (Array.isArray(processed)) {
        processed = (processed as RawPromotion[]).map(normalizePromotion);
      } else if (processed && typeof processed === 'object') {
        processed = normalizePromotion(processed as RawPromotion);
      }
    }

    return deepNormalize(processed) as T;
  }

  /**
   * Centralized HTTP Request Handler
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const response = await fetch(`${this.baseUrl}${normalizedPath}`, {
        ...options,
        signal: controller.signal,
        headers: buildHeaders(options.headers as Record<string, string> | undefined),
      });

      let json: BackendResponse<T> | null = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          json = await response.json();
        } catch {
          json = null;
        }
      }

      if (response.status === 401) {
        if (typeof window !== 'undefined' && getToken()) {
          window.dispatchEvent(new Event('auth-unauthorized'));
        }
        return {
          data: null,
          error: json?.message || 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง (401)',
          status: 401,
        };
      }

      if (!response.ok || (json && json.success === false)) {
        return {
          data: null,
          error: json?.message || `เกิดข้อผิดพลาดในการเชื่อมต่อ (Status: ${response.status})`,
          status: response.status,
        };
      }

      const rawData = json ? json.data : null;
      const data = this.normalizeResponseData<T>(path, rawData);
      return { data, error: null, status: response.status };
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const message = isAbort
        ? 'การเชื่อมต่อหมดเวลา (Timeout) กรุณาลองใหม่อีกครั้ง'
        : err instanceof Error
        ? err.message
        : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่';
      return {
        data: null,
        error: message,
        status: isAbort ? 408 : 500,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * HTTP GET Request
   */
  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  /**
   * HTTP POST Request
   */
  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * HTTP PUT Request
   */
  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * HTTP DELETE Request
   */
  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const restfulApi = new RestClient();

export function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('app_visitor_session_id');
  if (!sessionId) {
    sessionId = 'sess-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
    sessionStorage.setItem('app_visitor_session_id', sessionId);
  }
  return sessionId;
}

export async function logVisitorVisit(pageUrl: string) {
  try {
    const sessionId = getOrCreateSessionId();
    await restfulApi.post('/api/analytics/visit', {
      sessionId,
      pageUrl
    });
  } catch (e) {
    console.error('Visitor logging failed', e);
  }
}
