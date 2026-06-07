import React, { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
  variant?: string | null;
}

export interface OrderData {
  orderNo: string;
  date: string;
  items: OrderItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: 'cod' | 'qr';
  slipUploaded?: boolean;
  slipName?: string | null;
  discount?: number;
  autoDiscount?: number;
  coinsUsed?: number;
  promoCode?: string | null;
  status?: string;
  carrier?: string;
  trackingNumber?: string;
  id?: string;
  disputeOpened?: boolean;
  disputeReason?: string | null;
  disputeStatus?: string | null;
  returnReason?: string | null;
  returnDescription?: string | null;
}

interface BillProps {
  orderData?: OrderData;
}

const Bill: React.FC<BillProps> = ({ orderData }) => {
  const [order, setOrder] = useState<OrderData | null>(orderData || null);

  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
      return;
    }
    try {
      const dataStr = localStorage.getItem('app_last_order');
      if (dataStr) {
        setOrder(JSON.parse(dataStr));
      }
    } catch (e) {
      console.error('Failed to load order data from localStorage', e);
    }
  }, [orderData]);

  if (!order) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 shadow-md max-w-md mx-auto">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="font-bold text-base">ไม่พบข้อมูลใบเสร็จรับเงิน</p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' น.';
    } catch {
      return '-';
    }
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vatAmount = (order.total * 7) / 107;
  const beforeVatAmount = order.total - vatAmount;

  return (
    <div className="receipt-print-wrapper w-full max-w-[400px] mx-auto py-4 px-2 print:p-0">
      {/* Self-contained CSS for receipt styling and print layout */}
      <style>{`
        .receipt-paper {
          background: #ffffff;
          position: relative;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.05));
          clip-path: polygon(
            0% 0%, 2.5% 6px, 5% 0%, 7.5% 6px, 10% 0%, 12.5% 6px, 15% 0%, 17.5% 6px, 20% 0%, 22.5% 6px, 25% 0%, 27.5% 6px, 30% 0%, 32.5% 6px, 35% 0%, 37.5% 6px, 40% 0%, 42.5% 6px, 45% 0%, 47.5% 6px, 50% 0%, 52.5% 6px, 55% 0%, 57.5% 6px, 60% 0%, 62.5% 6px, 65% 0%, 67.5% 6px, 70% 0%, 72.5% 6px, 75% 0%, 77.5% 6px, 80% 0%, 82.5% 6px, 85% 0%, 87.5% 6px, 90% 0%, 92.5% 6px, 95% 0%, 97.5% 6px, 100% 0%,
            100% 100%, 97.5% calc(100% - 6px), 95% 100%, 92.5% calc(100% - 6px), 90% 100%, 87.5% calc(100% - 6px), 85% 100%, 82.5% calc(100% - 6px), 80% 100%, 77.5% calc(100% - 6px), 75% 100%, 72.5% calc(100% - 6px), 70% 100%, 67.5% calc(100% - 6px), 65% 100%, 62.5% calc(100% - 6px), 60% 100%, 57.5% calc(100% - 6px), 55% 100%, 52.5% calc(100% - 6px), 50% 100%, 47.5% calc(100% - 6px), 45% 100%, 42.5% calc(100% - 6px), 40% 100%, 37.5% calc(100% - 6px), 35% 100%, 32.5% calc(100% - 6px), 30% 100%, 27.5% calc(100% - 6px), 25% 100%, 22.5% calc(100% - 6px), 20% 100%, 17.5% calc(100% - 6px), 15% 100%, 12.5% calc(100% - 6px), 10% 100%, 7.5% calc(100% - 6px), 5% 100%, 2.5% calc(100% - 6px), 0% 100%
          );
          border: 1px solid #e2e8f0;
          border-top: none;
          border-bottom: none;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          html, body {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          /* Hide all other root components on page */
          body > * {
            visibility: hidden !important;
            display: none !important;
          }

          #root, #root * {
            visibility: hidden !important;
            display: none !important;
          }

          /* Ensure the target wrapper and children are visible */
          .receipt-print-wrapper,
          .receipt-print-wrapper * {
            visibility: visible !important;
            display: block !important;
          }

          /* Make inline/flex items work */
          .receipt-print-wrapper .flex,
          .receipt-print-wrapper .flex * {
            display: flex !important;
          }

          /* Specifically make the wrapper print-only full screen */
          .receipt-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            filter: none !important;
            background: #ffffff !important;
            display: block !important;
          }

          .receipt-paper {
            clip-path: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            filter: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
            width: 100% !important;
          }

          /* Avoid breaking items across sheets */
          .receipt-section, .receipt-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="receipt-paper p-6 text-slate-800 font-sans text-xs space-y-4">
        {/* Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-300">
          <div className="flex justify-center items-center gap-1.5">
            <Receipt className="w-5 h-5 text-primary-600 print:text-black" />
            <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
              SABAIDEE MARKET
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            บริษัท สบายดีมาร์เก็ต จำกัด (มหาชน)
          </p>
          <p className="text-[10px] text-slate-500 leading-normal max-w-[280px] mx-auto">
            123 อาคารสบายดี สวนหลวง กรุงเทพฯ 10250
          </p>
          <p className="text-[9px] text-slate-400 font-medium">
            เลขประจำตัวผู้เสียภาษี: 0105563001234
          </p>
        </div>

        {/* Receipt Status & Number */}
        <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-4">
          <div className="text-center font-bold text-slate-700 py-1 border border-slate-300 rounded mb-2 uppercase tracking-widest bg-slate-50 print:bg-white print:border-slate-400">
            *** ชำระเงินเสร็จสิ้น ***
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">เลขที่ใบเสร็จ:</span>
            <span className="font-extrabold text-slate-900">{order.orderNo}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">วันที่ทำรายการ:</span>
            <span className="font-bold text-slate-800">{formatDate(order.date)}</span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-4 receipt-section">
          <span className="font-extrabold text-slate-900 block tracking-wide uppercase text-[10px]">
            ข้อมูลผู้รับสินค้า / Shipping
          </span>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">ชื่อผู้รับ:</span>
            <span className="font-bold text-slate-800">{order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">เบอร์โทร:</span>
            <span className="font-bold text-slate-800">{order.customer.phone}</span>
          </div>
          <div className="space-y-0.5 pt-1">
            <span className="text-slate-400 font-bold block">ที่อยู่จัดส่ง:</span>
            <span className="font-semibold text-slate-700 block bg-slate-50 p-2 rounded border border-slate-100 print:bg-white print:p-0 print:border-none leading-relaxed text-[10px]">
              {order.customer.address}
            </span>
          </div>
        </div>

        {/* Payment info */}
        <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-4 receipt-section">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">ช่องทางชำระเงิน:</span>
            <span className="font-extrabold text-slate-800">
              {order.paymentMethod === 'cod' ? 'ชำระเงินปลายทาง (COD)' : 'QR Code / PromptPay'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">สถานะชำระเงิน:</span>
            <span className="font-extrabold text-success-600 print:text-black">
              {order.paymentMethod === 'cod' ? 'รอชำระเมื่อรับสินค้า' : 'ชำระเงินเรียบร้อยแล้ว'}
            </span>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-3.5 border-b border-dashed border-slate-300 pb-4 receipt-section">
          <span className="font-extrabold text-[10px] text-slate-900 block tracking-wide uppercase">
            รายการสินค้า / Product List
          </span>
          
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={item.id} className="receipt-item text-xs">
                <div className="flex justify-between font-extrabold text-slate-900 leading-tight">
                  <span>
                    {idx + 1}. {item.name}
                    {item.variant && (
                      <span className="text-[10px] text-primary-600 block pl-3 font-semibold">
                        ตัวเลือก: {item.variant}
                      </span>
                    )}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString()} บาท</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold pl-3 flex justify-between pt-0.5">
                  <span>{item.quantity} x {item.price.toLocaleString()} บาท</span>
                  <span>({item.category})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-4 receipt-section">
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">ราคารวม (Subtotal):</span>
            <span className="text-slate-800 font-bold">{subtotal.toLocaleString()} บาท</span>
          </div>

          {order.autoDiscount && order.autoDiscount > 0 ? (
            <div className="flex justify-between text-success-600 print:text-black">
              <span className="font-semibold">ส่วนลดแคมเปญอัตโนมัติ:</span>
              <span className="font-bold">-{order.autoDiscount.toLocaleString()} บาท</span>
            </div>
          ) : null}

          {order.discount && order.discount > 0 ? (
            <div className="flex justify-between text-success-600 print:text-black">
              <span className="font-semibold">ส่วนลดคูปอง {order.promoCode ? `(${order.promoCode})` : ''}:</span>
              <span className="font-bold">-{order.discount.toLocaleString()} บาท</span>
            </div>
          ) : null}

          {order.coinsUsed && order.coinsUsed > 0 ? (
            <div className="flex justify-between text-amber-600 print:text-black">
              <span className="font-semibold">ส่วนลด First Shop Coins:</span>
              <span className="font-bold">-{order.coinsUsed.toLocaleString()} บาท</span>
            </div>
          ) : null}
          
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>ภาษีมูลค่าเพิ่ม (VAT 7% Included):</span>
            <span>{vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>สินค้าก่อนภาษี (Before VAT):</span>
            <span>{beforeVatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
          </div>

          <div className="flex justify-between text-success-600 print:text-black">
            <span className="font-semibold">ค่าจัดส่ง (Shipping):</span>
            <span className="font-bold">จัดส่งฟรี</span>
          </div>

          <div className="border-t border-dotted border-slate-300 pt-2 flex justify-between items-baseline">
            <span className="font-black text-slate-900">ยอดชำระสุทธิ (Net Total):</span>
            <span className="text-base font-black text-primary-600 print:text-black">
              {order.total.toLocaleString()} บาท
            </span>
          </div>
        </div>

        {/* Footer info & Barcode */}
        <div className="text-center pt-2 space-y-3.5 receipt-section">
          <p className="text-[10px] font-bold text-slate-400 italic">
            ** ขอบพระคุณที่เลือกใช้บริการค่ะ **
          </p>

          <div className="space-y-1 py-1">
            <svg viewBox="0 0 200 40" className="w-40 h-8 mx-auto opacity-75">
              <g fill="#000000">
                <rect x="0" width="3" height="40" />
                <rect x="5" width="1" height="40" />
                <rect x="8" width="2" height="40" />
                <rect x="12" width="4" height="40" />
                <rect x="18" width="1" height="40" />
                <rect x="20" width="3" height="40" />
                <rect x="25" width="2" height="40" />
                <rect x="29" width="1" height="40" />
                <rect x="32" width="4" height="40" />
                <rect x="38" width="2" height="40" />
                <rect x="42" width="1" height="40" />
                <rect x="45" width="3" height="40" />
                <rect x="50" width="2" height="40" />
                <rect x="54" width="4" height="40" />
                <rect x="60" width="1" height="40" />
                <rect x="64" width="2" height="40" />
                <rect x="68" width="3" height="40" />
                <rect x="73" width="1" height="40" />
                <rect x="76" width="4" height="40" />
                <rect x="82" width="2" height="40" />
                <rect x="86" width="1" height="40" />
                <rect x="90" width="3" height="40" />
                <rect x="95" width="2" height="40" />
                <rect x="99" width="4" height="40" />
                <rect x="105" width="1" height="40" />
                <rect x="108" width="3" height="40" />
                <rect x="113" width="2" height="40" />
                <rect x="117" width="1" height="40" />
                <rect x="120" width="4" height="40" />
                <rect x="126" width="2" height="40" />
                <rect x="130" width="1" height="40" />
                <rect x="133" width="3" height="40" />
                <rect x="138" width="2" height="40" />
                <rect x="142" width="4" height="40" />
                <rect x="148" width="1" height="40" />
                <rect x="152" width="2" height="40" />
                <rect x="156" width="3" height="40" />
                <rect x="161" width="1" height="40" />
                <rect x="164" width="4" height="40" />
                <rect x="170" width="2" height="40" />
                <rect x="174" width="1" height="40" />
                <rect x="178" width="3" height="40" />
                <rect x="183" width="2" height="40" />
                <rect x="187" width="4" height="40" />
                <rect x="193" width="1" height="40" />
                <rect x="196" width="3" height="40" />
              </g>
            </svg>
            <span className="text-[8px] text-slate-400 font-extrabold tracking-widest block">
              *{order.orderNo}*
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bill;