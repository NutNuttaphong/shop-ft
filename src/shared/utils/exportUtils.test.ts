import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  escapeCSV,
  formatOrderStatusThai,
  formatPaymentMethodThai,
  generateDailySalesCSV,
  generateOrdersCSV,
  generateTopProductsCSV,
  downloadCSV,
  DailySalesItem,
  TopProductItem
} from './exportUtils';
import { RawOrder } from '../services/api';

describe('exportUtils Unit Tests', () => {
  describe('escapeCSV', () => {
    it('handles null and undefined', () => {
      expect(escapeCSV(null)).toBe('""');
      expect(escapeCSV(undefined)).toBe('""');
    });

    it('escapes standard strings and quotes', () => {
      expect(escapeCSV('hello')).toBe('"hello"');
      expect(escapeCSV('say "hi"')).toBe('"say ""hi"""');
      expect(escapeCSV('comma, separated')).toBe('"comma, separated"');
    });

    it('neutralizes CSV formula injection starting with =, +, -, @', () => {
      expect(escapeCSV('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
      expect(escapeCSV('+12345')).toBe('"\'+12345"');
      expect(escapeCSV('-999')).toBe('"\' -999"'.replace(' ', ''));
      expect(escapeCSV('@evil')).toBe('"\'@evil"');
    });

    it('handles numeric input', () => {
      expect(escapeCSV(1250)).toBe('"1250"');
      expect(escapeCSV(0)).toBe('"0"');
    });
  });

  describe('formatters', () => {
    it('formats order status in Thai', () => {
      expect(formatOrderStatusThai('PENDING')).toBe('รอตรวจสอบ');
      expect(formatOrderStatusThai('PAID')).toBe('ชำระเงินแล้ว');
      expect(formatOrderStatusThai('PROCESSING')).toBe('กำลังเตรียมจัดส่ง');
      expect(formatOrderStatusThai('SHIPPED')).toBe('จัดส่งแล้ว');
      expect(formatOrderStatusThai('COMPLETED')).toBe('สำเร็จแล้ว');
      expect(formatOrderStatusThai('CANCELLED')).toBe('ยกเลิกคำสั่งซื้อ');
      expect(formatOrderStatusThai('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
    });

    it('formats payment methods in Thai', () => {
      expect(formatPaymentMethodThai('PROMPTPAY')).toBe('พร้อมเพย์ QR Code');
      expect(formatPaymentMethodThai('CREDIT_CARD')).toBe('บัตรเครดิต/เดบิต');
      expect(formatPaymentMethodThai('COD')).toBe('เก็บเงินปลายทาง');
      expect(formatPaymentMethodThai('TRUE_MONEY')).toBe('ทรูมันนี่ วอลเล็ท');
      expect(formatPaymentMethodThai('TRANSFER')).toBe('TRANSFER');
    });
  });

  describe('generateDailySalesCSV', () => {
    it('generates properly formatted CSV string with headers and calculated AOV', () => {
      const mockDailySales: DailySalesItem[] = [
        { date: '4 พ.ย. 2026', visitors: 150, orders: 10, sales: 5000 },
        { date: '5 พ.ย. 2026', visitors: 200, orders: 0, sales: 0 }
      ];

      const csv = generateDailySalesCSV(mockDailySales);
      expect(csv).toContain('วันที่ (Date)');
      expect(csv).toContain('ยอดเฉลี่ยต่อออเดอร์ AOV (THB)');
      expect(csv).toContain('"4 พ.ย. 2026","150","10","5000","500"');
      expect(csv).toContain('"5 พ.ย. 2026","200","0","0","0"');
    });
  });

  describe('generateOrdersCSV', () => {
    it('generates orders report with customer, items, and shipping info', () => {
      const mockOrders: RawOrder[] = [
        {
          id: 'ord-1',
          orderNo: 'ORD-20261104-001',
          createdAt: '2026-11-04T10:00:00Z',
          items: [
            {
              productId: 'p1',
              name: 'ข้าวหอมมะลิ 5 กก.',
              price: 250,
              quantity: 2,
              imageUrl: '',
              category: 'ข้าว'
            }
          ],
          total: 500,
          discount: 50,
          coinsUsed: 10,
          customer: {
            name: 'สมชาย ใจดี',
            phone: '0812345678',
            address: '123 ถ.สุขุมวิท กทม.'
          },
          paymentMethod: 'PROMPTPAY',
          status: 'SHIPPED',
          carrier: 'Flash Express',
          trackingNumber: 'TH0123456789'
        }
      ];

      const csv = generateOrdersCSV(mockOrders);
      expect(csv).toContain('เลขที่คำสั่งซื้อ (Order No)');
      expect(csv).toContain('ข้าวหอมมะลิ 5 กก. (2 ชิ้น @ 250 บ.)');
      expect(csv).toContain('สมชาย ใจดี');
      expect(csv).toContain('พร้อมเพย์ QR Code');
      expect(csv).toContain('จัดส่งแล้ว');
      expect(csv).toContain('Flash Express');
      expect(csv).toContain('TH0123456789');
    });
  });

  describe('generateTopProductsCSV', () => {
    it('generates ranked product list CSV', () => {
      const topProducts: TopProductItem[] = [
        { name: 'ผักบุ้งจีน', category: 'ผักสด', quantitySold: 120, revenue: 3600 },
        { name: 'กล้วยหอม', category: 'ผลไม้', quantitySold: 90, revenue: 7200 }
      ];

      const csv = generateTopProductsCSV(topProducts);
      expect(csv).toContain('อันดับ (Rank)');
      expect(csv).toContain('"1","ผักบุ้งจีน","ผักสด","120","3600"');
      expect(csv).toContain('"2","กล้วยหอม","ผลไม้","90","7200"');
    });
  });

  describe('downloadCSV', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('creates Blob and triggers download via object URL in browser environment', () => {
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      globalThis.URL.createObjectURL = createObjectURLMock;
      globalThis.URL.revokeObjectURL = revokeObjectURLMock;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

      const success = downloadCSV('test.csv', 'col1,col2\r\nval1,val2');

      expect(success).toBe(true);
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
