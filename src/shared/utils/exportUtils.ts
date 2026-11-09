import { RawOrder } from '../services/api';

/**
 * Escape CSV fields according to RFC 4180 with Thai language and formula injection safety.
 */
export function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Prevent CSV Formula Injection in Excel/Sheets (=, +, -, @)
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // Double any existing double-quotes
  const escaped = str.replace(/"/g, '""');

  return `"${escaped}"`;
}

export interface DailySalesItem {
  date: string;
  sales: number;
  orders: number;
  visitors: number;
}

export interface TopProductItem {
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

/**
 * Format order status into Thai human-readable description.
 */
export function formatOrderStatusThai(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'รอตรวจสอบ';
    case 'PAID':
      return 'ชำระเงินแล้ว';
    case 'PROCESSING':
      return 'กำลังเตรียมจัดส่ง';
    case 'SHIPPED':
      return 'จัดส่งแล้ว';
    case 'COMPLETED':
      return 'สำเร็จแล้ว';
    case 'CANCELLED':
      return 'ยกเลิกคำสั่งซื้อ';
    default:
      return status || '-';
  }
}

/**
 * Format payment method into Thai readable description.
 */
export function formatPaymentMethodThai(method: string): string {
  switch (method?.toUpperCase()) {
    case 'PROMPTPAY':
    case 'QR':
      return 'พร้อมเพย์ QR Code';
    case 'CREDIT_CARD':
    case 'CARD':
      return 'บัตรเครดิต/เดบิต';
    case 'COD':
      return 'เก็บเงินปลายทาง';
    case 'TRUE_MONEY':
      return 'ทรูมันนี่ วอลเล็ท';
    default:
      return method || '-';
  }
}

/**
 * Generate CSV string for Daily Sales.
 */
export function generateDailySalesCSV(dailySales: DailySalesItem[]): string {
  const headers = [
    'วันที่ (Date)',
    'จำนวนผู้เข้าชม (Visitors)',
    'จำนวนคำสั่งซื้อ (Orders)',
    'ยอดขาย (Sales THB)',
    'ยอดเฉลี่ยต่อออเดอร์ AOV (THB)'
  ];

  const rows = dailySales.map((d) => {
    const aov = d.orders > 0 ? Math.round(d.sales / d.orders) : 0;
    return [
      escapeCSV(d.date),
      escapeCSV(d.visitors),
      escapeCSV(d.orders),
      escapeCSV(d.sales),
      escapeCSV(aov)
    ].join(',');
  });

  return [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
}

/**
 * Generate CSV string for Orders.
 */
export function generateOrdersCSV(orders: RawOrder[]): string {
  const headers = [
    'เลขที่คำสั่งซื้อ (Order No)',
    'วันที่-เวลาสั่งซื้อ (Created At)',
    'ชื่อลูกค้า (Customer Name)',
    'เบอร์โทรศัพท์ (Phone)',
    'ที่อยู่จัดส่ง (Address)',
    'รายการสินค้า (Order Items)',
    'ยอดรวม (Total THB)',
    'ส่วนลด (Discount THB)',
    'ใช้เหรียญ (Coins Used)',
    'ช่องทางชำระเงิน (Payment Method)',
    'สถานะ (Status)',
    'ขนส่ง (Carrier)',
    'เลขพัสดุ (Tracking Number)'
  ];

  const rows = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((item) => `${item.name} (${item.quantity} ชิ้น @ ${item.price} บ.)`)
      .join('; ');

    return [
      escapeCSV(o.orderNo),
      escapeCSV(o.createdAt),
      escapeCSV(o.customer?.name || '-'),
      escapeCSV(o.customer?.phone || '-'),
      escapeCSV(o.customer?.address || '-'),
      escapeCSV(itemsSummary),
      escapeCSV(o.total ?? 0),
      escapeCSV(o.discount ?? 0),
      escapeCSV(o.coinsUsed ?? 0),
      escapeCSV(formatPaymentMethodThai(o.paymentMethod)),
      escapeCSV(formatOrderStatusThai(o.status)),
      escapeCSV(o.carrier || '-'),
      escapeCSV(o.trackingNumber || '-')
    ].join(',');
  });

  return [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
}

/**
 * Generate CSV string for Top Selling Products.
 */
export function generateTopProductsCSV(topProducts: TopProductItem[]): string {
  const headers = [
    'อันดับ (Rank)',
    'ชื่อสินค้า (Product Name)',
    'หมวดหมู่ (Category)',
    'จำนวนที่ขายได้ (Quantity Sold)',
    'รายได้สะสม (Revenue THB)'
  ];

  const rows = topProducts.map((p, index) => [
    escapeCSV(index + 1),
    escapeCSV(p.name),
    escapeCSV(p.category),
    escapeCSV(p.quantitySold),
    escapeCSV(p.revenue)
  ].join(','));

  return [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
}

/**
 * Download CSV file in browser with UTF-8 BOM so Microsoft Excel can read Thai characters natively.
 */
export function downloadCSV(filename: string, csvContent: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  // Prepend UTF-8 BOM (\uFEFF)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  if (typeof URL !== 'undefined' && URL.createObjectURL) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  return false;
}
