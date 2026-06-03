import React, { useEffect, useState } from 'react';
import { Receipt, CheckCircle2, User, Truck, QrCode } from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
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
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 shadow-md">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="font-bold">ไม่พบข้อมูลใบเสร็จรับเงิน</p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' น.';
    } catch {
      return '-';
    }
  };

  // VAT (7% included in total)
  const vatAmount = (order.total * 7) / 107;
  const beforeVatAmount = order.total - vatAmount;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none max-w-2xl mx-auto font-['Inter',sans-serif]">
      {/* Decorative top bar */}
      <div className="h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 print:hidden" />

      <div className="p-8 space-y-6 sm:p-10">
        
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary-600 print:text-black" />
              SHOP ONLINE
            </h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              บริษัท ช้อปออนไลน์ จำกัด (มหาชน)
            </p>
            <p className="text-[13px] text-slate-500 leading-normal max-w-sm">
              123 อาคารสยามพารากอน ชั้น 4 ถนนพระรามที่ 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330
            </p>
            <p className="text-[13px] text-slate-400 font-medium">
              เลขประจำตัวผู้เสียภาษี: 0105563001234 (สำนักงานใหญ่)
            </p>
          </div>

          <div className="sm:text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px] print:bg-white print:border-none print:p-0">
            <span className="text-xs font-bold text-success-700 bg-success-50 px-2.5 py-1 rounded-full border border-success-100 uppercase tracking-wide inline-block mb-1 print:border-none print:p-0 print:text-black print:bg-white">
              ชำระเงินเสร็จสิ้น
            </span>
            <p className="text-xs text-slate-400 font-bold block">เลขที่ใบเสร็จ / Receipt No.</p>
            <p className="font-extrabold text-[15px] text-slate-900">{order.orderNo}</p>
            <p className="text-xs text-slate-400 font-bold block pt-1">วันที่ทำรายการ / Date</p>
            <p className="text-[13px] font-bold text-slate-700">{formatDate(order.date)}</p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4 print:bg-white print:border-none print:p-0">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary-600 print:text-black" />
            ข้อมูลผู้รับสินค้า / Shipping Address
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block text-xs uppercase tracking-wide">ชื่อผู้รับ / Name</span>
              <span className="font-bold text-slate-800">{order.customer.name}</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block text-xs uppercase tracking-wide">เบอร์โทรศัพท์ / Tel</span>
              <span className="font-bold text-slate-800">{order.customer.phone}</span>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <span className="text-slate-400 font-bold block text-xs uppercase tracking-wide">ที่อยู่สำหรับจัดส่ง / Address</span>
              <span className="font-semibold text-slate-700 leading-relaxed block bg-white p-3 rounded-xl border border-slate-100 print:p-0 print:border-none">
                {order.customer.address}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50 rounded-2xl border border-slate-100 p-5 print:bg-white print:border-none print:p-0">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold block text-xs uppercase tracking-wide">วิธีการชำระเงิน / Payment Method</span>
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[15px]">
              {order.paymentMethod === 'cod' ? (
                <>
                  <Truck className="w-5 h-5 text-primary-600 print:text-black" />
                  <span>ชำระเงินปลายทาง (Cash on Delivery)</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 text-primary-600 print:text-black" />
                  <span>ชำระเงินด้วย QR Code / PromptPay</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-1 text-left sm:text-right w-full sm:w-auto">
            <span className="text-slate-400 font-bold block text-xs uppercase tracking-wide">สถานะการชำระเงิน / Status</span>
            <span className="font-extrabold text-success-600 flex items-center gap-1 text-[15px]">
              <CheckCircle2 className="w-4 h-4" />
              {order.paymentMethod === 'cod' ? 'รอชำระเมื่อรับสินค้า' : 'ชำระเงินเรียบร้อยแล้ว'}
            </span>
            {order.paymentMethod === 'qr' && order.slipName && (
              <span className="text-xs text-slate-400 block font-semibold truncate max-w-[200px]">
                ไฟล์แนบ: {order.slipName}
              </span>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider pb-1">
            รายการสินค้า / Product List
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-1 text-center w-8">#</th>
                  <th className="py-3 px-2">สินค้า / Items</th>
                  <th className="py-3 px-2 text-right w-24">ราคาต่อชิ้น / Price</th>
                  <th className="py-3 px-2 text-center w-16">จำนวน / Qty</th>
                  <th className="py-3 px-2 text-right w-28">ยอดรวม / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="align-middle">
                    <td className="py-3 px-1 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 block leading-tight">{item.name}</span>
                        <span className="text-[11px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded print:bg-white print:border print:border-slate-200">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">{item.price.toLocaleString()} บาท</td>
                    <td className="py-3 px-2 text-center">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-slate-900">
                      {(item.price * item.quantity).toLocaleString()} บาท
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary Card */}
        <div className="border-t border-slate-200 pt-5 flex justify-end">
          <div className="w-full sm:w-80 space-y-2 text-[14px] font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>ราคารวมทั้งสิ้น (Subtotal)</span>
              <span className="text-slate-900">{order.total.toLocaleString()} บาท</span>
            </div>
            
            <div className="flex justify-between text-slate-500">
              <span className="text-[13px]">ภาษีมูลค่าเพิ่ม (VAT 7% Included)</span>
              <span className="text-[13px]">{vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span className="text-[13px]">มูลค่าสินค้าก่อนภาษี (Before VAT)</span>
              <span className="text-[13px]">{beforeVatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
            </div>

            <div className="flex justify-between text-success-600">
              <span>ค่าขนส่งจัดส่งสินค้า (Shipping)</span>
              <span>จัดส่งฟรี</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">ยอดชำระสุทธิ (Net Total)</span>
              <span className="text-2xl font-black text-primary-600 print:text-black">
                {order.total.toLocaleString()} <span className="text-sm font-bold text-slate-500">บาท</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note and Barcode */}
        <div className="border-t border-dashed border-slate-200 pt-6 text-center space-y-4">
          <p className="text-xs font-bold text-slate-400 italic">
            ** ขอบพระคุณที่เลือกใช้บริการสั่งซื้อสินค้าออนไลน์กับเราค่ะ **
          </p>

          {/* SVG Barcode for authenticity */}
          <div className="space-y-1.5 py-1">
            <svg viewBox="0 0 200 40" className="w-48 h-8 mx-auto opacity-80">
              <g fill="#0f172a">
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
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
              *{order.orderNo}*
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Bill;