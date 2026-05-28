import React, { useState, useEffect } from 'react';
import { Product, restfulApi } from '../../../shared/services/api';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Users, 
  ShoppingCart, 
  ArrowRight,
  DollarSign
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await restfulApi.get<Product[]>('/api/products');
        const list = response.data || [];
        setProducts(list);
        setLowStockCount(list.filter(p => p.stock <= 5).length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // Simple statistics calculations
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  
  // Dummy analytics data for charts/lists
  const dummySales = [
    { orderId: 'ORD-5541', time: '10 นาทีที่แล้ว', items: 'ข้าวหอมมะลิ, น้ำมันพืช', total: 495, status: 'จัดส่งแล้ว' },
    { orderId: 'ORD-5540', time: '1 ชั่วโมงที่แล้ว', items: 'ไข่ไก่สด, นมยูเอชที', total: 291, status: 'กำลังจัดเตรียม' },
    { orderId: 'ORD-5539', time: '3 ชั่วโมงที่แล้ว', items: 'ข้าวหอมมะลิ (x2)', total: 440, status: 'จัดส่งแล้ว' },
    { orderId: 'ORD-5538', time: 'เมื่อวานนี้', items: 'น้ำมันพืช (x4)', total: 220, status: 'จัดส่งแล้ว' },
  ];

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Welcome Block */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900">แดชบอร์ดสรุปภาพรวมระบบ</h1>
        <p className="text-slate-500 text-[16px]">สถิติการใช้งาน ยอดสั่งซื้อ และระดับสต็อกสินค้าในระบบ</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">ยอดจำหน่ายรวมสะสม</span>
            <span className="text-3xl font-black text-slate-900 block">1,446 บาท</span>
            <span className="text-xs font-bold text-success-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% สัปดาห์นี้
            </span>
          </div>
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Catalog Items count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">ชนิดสินค้าทั้งหมดในระบบ</span>
            <span className="text-3xl font-black text-slate-900 block">{products.length} หมวด</span>
            <span className="text-xs font-bold text-slate-500 block">รวมสต็อก {totalStockItems} ชิ้น</span>
          </div>
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200">
            <Package className="w-7 h-7" />
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">สินค้าสต็อกต่ำกว่าเกณฑ์</span>
            <span className={`text-3xl font-black block ${lowStockCount > 0 ? 'text-danger-600' : 'text-slate-900'}`}>
              {lowStockCount} รายการ
            </span>
            <span className="text-xs font-bold text-slate-500 block">ต้องสั่งเข้าคลังด่วน</span>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
            lowStockCount > 0 
              ? 'bg-danger-50 text-danger-600 border-danger-100 animate-pulse' 
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>

        {/* Simulated Active Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">สมาชิกในระบบทั้งหมด</span>
            <span className="text-3xl font-black text-slate-900 block">2 บัญชี</span>
            <span className="text-xs font-bold text-slate-500 block">1 ลูกค้า / 1 ผู้ดูแล</span>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Users className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Main analytics panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Graph mockup */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">แนวโน้มการสั่งซื้อในสัปดาห์นี้</h2>
            <span className="text-xs font-bold text-slate-400">เปรียบเทียบสถิติรายวัน</span>
          </div>

          {/* Simple custom SVG chart */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100 pb-10">
              <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
            </div>
            
            {/* Bars */}
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[30%]"></div>
              <span className="text-xs font-bold text-slate-400">จันทร์</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[45%]"></div>
              <span className="text-xs font-bold text-slate-400">อังคาร</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[25%]"></div>
              <span className="text-xs font-bold text-slate-400">พุธ</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-primary-500 group-hover:bg-primary-600 rounded-t-xl transition-all h-[80%] shadow-lg shadow-primary-50"></div>
              <span className="text-xs font-black text-primary-600">พฤหัสบดี</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[55%]"></div>
              <span className="text-xs font-bold text-slate-400">ศุกร์</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[40%]"></div>
              <span className="text-xs font-bold text-slate-400">เสาร์</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[60%]"></div>
              <span className="text-xs font-bold text-slate-400">อาทิตย์</span>
            </div>
          </div>
        </div>

        {/* Recent orders panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-500" /> คำสั่งซื้อล่าสุด
            </h2>

            <div className="space-y-3.5">
              {dummySales.map((sale) => (
                <div key={sale.orderId} className="flex justify-between items-center text-[15px] p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-950 block">{sale.orderId}</span>
                    <span className="text-[13px] text-slate-400 block">{sale.time} • {sale.items}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-extrabold text-slate-900 block">{sale.total} บาท</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                      sale.status === 'จัดส่งแล้ว' 
                        ? 'bg-success-50 text-success-700' 
                        : 'bg-warning-50 text-warning-700'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert('ฟีเจอร์รายงานรายละเอียดใบเสร็จกำลังอยู่ในระหว่างการพัฒนาขั้นที่ 2')}
            className="w-full py-3 border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm mt-4"
          >
            <span>ดูรายการสั่งซื้อทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
