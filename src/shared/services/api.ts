/**
 * RESTful API Service
 * Connects to the real Spring Boot backend at localhost:8080
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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
      return parsed.token || null;
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

/**
 * Normalize promotion data from backend (Java enums are UPPERCASE)
 */
function normalizePromotion(p: any): Promotion {
  return {
    ...p,
    discountType: (p.discountType || '').toLowerCase() as 'percentage' | 'fixed',
    isActive: p.active !== undefined ? p.active : p.isActive,
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

  /**
   * HTTP GET Request
   */
  async get<T>(path: string, _options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: buildHeaders(),
      });

      const json: BackendResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        return {
          data: null,
          error: json.message || `เกิดข้อผิดพลาด (Status: ${response.status})`,
          status: response.status,
        };
      }

      // Normalize promotion data
      let data = json.data;
      if (path.includes('/api/promotions')) {
        if (Array.isArray(data)) {
          data = (data as any[]).map(normalizePromotion) as unknown as T;
        } else if (data && typeof data === 'object') {
          data = normalizePromotion(data) as unknown as T;
        }
      }

      return { data, error: null, status: response.status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่',
        status: 500,
      };
    }
  }

  /**
   * HTTP POST Request
   */
  async post<T>(path: string, body: any, _options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body),
      });

      const json: BackendResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        return {
          data: null,
          error: json.message || `เกิดข้อผิดพลาด (Status: ${response.status})`,
          status: response.status,
        };
      }

      return { data: json.data, error: null, status: response.status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่',
        status: 500,
      };
    }
  }

  /**
   * HTTP PUT Request
   */
  async put<T>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(body),
      });

      const json: BackendResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        return {
          data: null,
          error: json.message || `เกิดข้อผิดพลาด (Status: ${response.status})`,
          status: response.status,
        };
      }

      return { data: json.data, error: null, status: response.status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        status: 500,
      };
    }
  }

  /**
   * HTTP DELETE Request
   */
  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });

      const json: BackendResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        return {
          data: null,
          error: json.message || `เกิดข้อผิดพลาด (Status: ${response.status})`,
          status: response.status,
        };
      }

      return { data: json.data, error: null, status: response.status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        status: 500,
      };
    }
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
