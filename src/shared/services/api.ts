/**
 * RESTful API Service
 * Wraps fetch for GET and POST requests.
 * Includes a built-in localStorage mock engine to simulate server responses and state persistence.
 */

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
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  isActive: boolean;
  imageUrl?: string;
  startDate: string;
  endDate: string;
}

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'ข้าวหอมมะลิแท้ 100% (5 กิโลกรัม)',
    price: 220,
    description: 'ข้าวหอมมะลิคัดพิเศษ หอม นุ่ม เมล็ดเรียงสวย หุงขึ้นหม้อ ทานอร่อยตลอดปี',
    category: 'อาหารแห้งและเครื่องปรุง',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    stock: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'น้ำมันพืชตราดาวเด่น (1 ลิตร)',
    price: 55,
    description: 'น้ำมันพืชผ่านกรรมวิธี สะอาด ปราศจากกลิ่นหืน เหมาะสำหรับผัดและทอดอาหารทุกชนิด',
    category: 'อาหารแห้งและเครื่องปรุง',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    stock: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'นมยูเอชที รสจืด (แพ็ค 6 กล่อง)',
    price: 78,
    description: 'นมโคแท้ 100% แคลเซียมสูง มีวิตามินบี 2 บี 12 และฟอสฟอรัส รสชาติเข้มข้น ดื่มง่าย',
    category: 'เครื่องดื่ม',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    stock: 80,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'ไข่ไก่สด เบอร์ 2 (แผง 30 ฟอง)',
    price: 135,
    description: 'ไข่ไก่สดจากฟาร์มมาตรฐาน สะอาด ปลอดภัย อุดมด้วยโปรตีนสูง คัดสรรคุณภาพทุกฟอง',
    category: 'อาหารสด',
    imageUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80',
    stock: 30,
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    code: 'SABAIDEE10',
    name: 'ส่วนลดต้อนรับเปิดร้านใหม่',
    description: 'รับส่วนลด 10% สำหรับการสั่งซื้อทุกรายการ ไม่มีขั้นต่ำ',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 0,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    startDate: '2026-05-01',
    endDate: '2026-12-31'
  },
  {
    id: 'promo-2',
    code: 'MIDYEAR50',
    name: 'ลดกระหน่ำกลางปีคุ้มค่าสุดๆ',
    description: 'ลดทันที 50 บาท เมื่อสั่งซื้อสินค้าขั้นต่ำ 300 บาทขึ้นไป',
    discountType: 'fixed',
    discountValue: 50,
    minPurchase: 300,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    startDate: '2026-06-01',
    endDate: '2026-07-31'
  },
  {
    id: 'promo-3',
    code: 'HEALTHY20',
    name: 'รักสุขภาพรักครอบครัว',
    description: 'รับส่วนลด 20% เมื่อซื้อสินค้าอาหารสดหรือเครื่องดื่มเพื่อสุขภาพ ครบ 200 บาทขึ้นไป',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 200,
    isActive: false,
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
    startDate: '2026-05-15',
    endDate: '2026-06-15'
  }
];

// Setup localStorage database if empty
const initMockDb = () => {
  if (!localStorage.getItem('app_products')) {
    localStorage.setItem('app_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('app_promotions')) {
    localStorage.setItem('app_promotions', JSON.stringify(INITIAL_PROMOTIONS));
  }
};
initMockDb();

/**
 * RESTful API Client Wrapper class
 */
class RestClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Simulate server response delay
  private delay(ms: number = 400): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * HTTP GET Request
   */
  async get<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    // Intercept mock API paths
    if (path.startsWith('/api/products')) {
      await this.delay();
      const productsStr = localStorage.getItem('app_products') || '[]';
      const products = JSON.parse(productsStr) as Product[];

      // Handle individual product search: /api/products/:id
      const matches = path.match(/\/api\/products\/([a-zA-Z0-9-]+)/);
      if (matches && matches[1]) {
        const prod = products.find(p => p.id === matches[1]);
        if (prod) {
          return { data: prod as unknown as T, error: null, status: 200 };
        }
        return { data: null, error: 'ไม่พบข้อมูลสินค้า', status: 404 };
      }

      return { data: products as unknown as T, error: null, status: 200 };
    }

    if (path.startsWith('/api/promotions')) {
      await this.delay();
      const promotionsStr = localStorage.getItem('app_promotions') || '[]';
      const promotions = JSON.parse(promotionsStr) as Promotion[];

      // Handle individual promotion search: /api/promotions/:id
      const matches = path.match(/\/api\/promotions\/([a-zA-Z0-9-]+)/);
      if (matches && matches[1]) {
        const promo = promotions.find(p => p.id === matches[1]);
        if (promo) {
          return { data: promo as unknown as T, error: null, status: 200 };
        }
        return { data: null, error: 'ไม่พบข้อมูลโปรโมชั่น', status: 404 };
      }

      return { data: promotions as unknown as T, error: null, status: 200 };
    }

    // Actual Network Fetch for non-mock paths
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `เกิดข้อผิดพลาดในการดึงข้อมูล (Status: ${response.status})`);
      }
      return { data, error: null, status: response.status };
    } catch (err: any) {
      return { data: null, error: err.message || 'เครือข่ายขัดข้อง กรุณาลองใหม่อีกครั้ง', status: 500 };
    }
  }

  /**
   * HTTP POST Request
   */
  async post<T>(path: string, body: any, options?: RequestInit): Promise<ApiResponse<T>> {
    // Intercept mock API paths
    if (path === '/api/products') {
      await this.delay(600);
      const productsStr = localStorage.getItem('app_products') || '[]';
      const products = JSON.parse(productsStr) as Product[];

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: body.name || 'สินค้าใหม่',
        price: Number(body.price) || 0,
        description: body.description || '',
        category: body.category || 'อื่นๆ',
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        stock: Number(body.stock) || 0,
        createdAt: new Date().toISOString(),
      };

      products.unshift(newProduct); // Add to the top
      localStorage.setItem('app_products', JSON.stringify(products));
      return { data: newProduct as unknown as T, error: null, status: 201 };
    }

    // Intercept mock products edit/delete
    if (path.startsWith('/api/products/edit')) {
      await this.delay(500);
      const productsStr = localStorage.getItem('app_products') || '[]';
      let products = JSON.parse(productsStr) as Product[];
      const id = path.split('/').pop();

      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          ...body,
          id: products[index].id, // protect ID
        };
        localStorage.setItem('app_products', JSON.stringify(products));
        return { data: products[index] as unknown as T, error: null, status: 200 };
      }
      return { data: null, error: 'ไม่พบสินค้าที่ต้องการแก้ไข', status: 404 };
    }

    if (path.startsWith('/api/products/delete')) {
      await this.delay(400);
      const productsStr = localStorage.getItem('app_products') || '[]';
      let products = JSON.parse(productsStr) as Product[];
      const id = path.split('/').pop();

      const filtered = products.filter(p => p.id !== id);
      localStorage.setItem('app_products', JSON.stringify(filtered));
      return { data: { success: true } as unknown as T, error: null, status: 200 };
    }

    // Intercept mock promotions API paths
    if (path === '/api/promotions') {
      await this.delay(600);
      const promotionsStr = localStorage.getItem('app_promotions') || '[]';
      const promotions = JSON.parse(promotionsStr) as Promotion[];

      const newPromo: Promotion = {
        id: `promo-${Date.now()}`,
        code: (body.code || '').trim().toUpperCase(),
        name: body.name || 'โปรโมชั่นใหม่',
        description: body.description || '',
        discountType: body.discountType || 'percentage',
        discountValue: Number(body.discountValue) || 0,
        minPurchase: Number(body.minPurchase) || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
        startDate: body.startDate || new Date().toISOString().split('T')[0],
        endDate: body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      // Check duplicate code
      if (promotions.some(p => p.code === newPromo.code)) {
        return { data: null, error: 'รหัสโปรโมชั่นนี้มีอยู่ในระบบแล้ว', status: 400 };
      }

      promotions.unshift(newPromo);
      localStorage.setItem('app_promotions', JSON.stringify(promotions));
      return { data: newPromo as unknown as T, error: null, status: 201 };
    }

    if (path.startsWith('/api/promotions/edit')) {
      await this.delay(500);
      const promotionsStr = localStorage.getItem('app_promotions') || '[]';
      let promotions = JSON.parse(promotionsStr) as Promotion[];
      const id = path.split('/').pop();

      const index = promotions.findIndex(p => p.id === id);
      if (index !== -1) {
        const updatedPromo = {
          ...promotions[index],
          ...body,
          code: (body.code || promotions[index].code).trim().toUpperCase(),
          id: promotions[index].id, // protect ID
        };

        // Check duplicate code excluding current editing promotion
        if (promotions.some((p, i) => p.code === updatedPromo.code && i !== index)) {
          return { data: null, error: 'รหัสโปรโมชั่นนี้มีอยู่ในระบบแล้ว', status: 400 };
        }

        promotions[index] = updatedPromo;
        localStorage.setItem('app_promotions', JSON.stringify(promotions));
        return { data: promotions[index] as unknown as T, error: null, status: 200 };
      }
      return { data: null, error: 'ไม่พบโปรโมชั่นที่ต้องการแก้ไข', status: 404 };
    }

    if (path.startsWith('/api/promotions/delete')) {
      await this.delay(400);
      const promotionsStr = localStorage.getItem('app_promotions') || '[]';
      let promotions = JSON.parse(promotionsStr) as Promotion[];
      const id = path.split('/').pop();

      const filtered = promotions.filter(p => p.id !== id);
      localStorage.setItem('app_promotions', JSON.stringify(filtered));
      return { data: { success: true } as unknown as T, error: null, status: 200 };
    }

    // Actual Network Fetch for non-mock paths
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `เกิดข้อผิดพลาดในการส่งข้อมูล (Status: ${response.status})`);
      }
      return { data, error: null, status: response.status };
    } catch (err: any) {
      return { data: null, error: err.message || 'เครือข่ายขัดข้อง กรุณาลองใหม่อีกครั้ง', status: 500 };
    }
  }
}

export const restfulApi = new RestClient();
