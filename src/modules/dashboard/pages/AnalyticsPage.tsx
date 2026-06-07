import React, { useState, useEffect } from 'react';
import { restfulApi } from '../../../shared/services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  RefreshCw, 
  Calendar, 
  ArrowUpRight, 
  Percent, 
  Wallet,
  ShoppingBag,
  Award
} from 'lucide-react';

interface AnalyticsData {
  totalSales: number;
  totalVisitors: number;
  conversionRate: number;
  totalOrders: number;
  dailySales: {
    date: string;
    sales: number;
    orders: number;
    visitors: number;
  }[];
  categorySales: {
    category: string;
    sales: number;
  }[];
  paymentMethodSales: {
    method: string;
    sales: number;
    count: number;
  }[];
  topProducts: {
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
    imageUrl: string;
  }[];
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await restfulApi.get<AnalyticsData>('/api/analytics/overview');
      if (res.error) {
        setError(res.error);
      } else {
        setData(res.data);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลสถิติได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center font-['Inter',sans-serif]">
        <div className="w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-slate-500 font-bold">กำลังประมวลผลข้อมูลสถิติและรายงานรายได้...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-danger-50 border-l-4 border-danger-500 p-6 rounded-r-3xl text-center max-w-md mx-auto mt-12 font-['Inter',sans-serif]">
        <p className="text-danger-700 font-bold mb-4">{error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-2xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  // --- SVG Charts Calculations ---
  
  // 1. Line Chart calculations (Sales Trend)
  const salesValues = data.dailySales.map(d => d.sales);
  const maxSales = Math.max(...salesValues, 1000);
  const chartHeight = 180;
  const chartWidth = 460;
  const paddingLeft = 60;
  const paddingBottom = 40;
  const pointsCount = data.dailySales.length;

  const salesPoints = data.dailySales.map((d, i) => {
    const x = paddingLeft + i * ((chartWidth - paddingLeft - 20) / (pointsCount - 1));
    const y = chartHeight - paddingBottom - (d.sales / maxSales) * (chartHeight - paddingBottom - 20);
    return { x, y, sales: d.sales, date: d.date, orders: d.orders };
  });

  const salesPathD = salesPoints.reduce((acc, p, idx) => 
    idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, ''
  );
  
  const salesAreaD = salesPoints.length > 0 
    ? `${salesPathD} L ${salesPoints[salesPoints.length - 1].x} ${chartHeight - paddingBottom} L ${salesPoints[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  // 2. Bar Chart calculations (Visitor Traffic)
  const visitorValues = data.dailySales.map(d => d.visitors);
  const maxVisitors = Math.max(...visitorValues, 10);
  const visitorPoints = data.dailySales.map((d, i) => {
    const x = paddingLeft + i * ((chartWidth - paddingLeft - 20) / (pointsCount - 1));
    const barHeight = (d.visitors / maxVisitors) * (chartHeight - paddingBottom - 30);
    const y = chartHeight - paddingBottom - barHeight;
    return { x, y, width: 22, height: barHeight, label: d.date, val: d.visitors };
  });

  // 3. Category Sales Calculations
  const maxCategorySales = Math.max(...data.categorySales.map(c => c.sales), 1);

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-pink-600" />
            วิเคราะห์และสถิติร้านค้า
          </h1>
          <p className="text-slate-500 text-[16px]">สรุปรายงานรายได้ ยอดจำหน่าย ทราฟฟิกผู้เข้าใช้งาน และประสิทธิภาพทางการตลาด</p>
        </div>
        
        <button
          onClick={fetchAnalytics}
          className="px-5 py-3 border-2 border-slate-200 bg-white hover:bg-slate-50 font-bold rounded-2xl flex items-center gap-2 transition-all min-h-[48px] text-slate-700 shadow-xs"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">ยอดจำหน่ายรวม</span>
            <span className="text-3xl font-black text-slate-900 block">
              {data.totalSales.toLocaleString()} <span className="text-sm font-bold text-slate-500">บาท</span>
            </span>
            <span className="text-xs font-bold text-success-600 flex items-center gap-0.5 bg-success-50 px-2 py-0.5 rounded-lg w-fit">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% รายปักษ์
            </span>
          </div>
          <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 border border-pink-100">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Total Visitors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">จำนวนผู้เข้าชมรวม</span>
            <span className="text-3xl font-black text-slate-900 block">
              {data.totalVisitors.toLocaleString()} <span className="text-sm font-bold text-slate-500">ครั้ง</span>
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-0.5 bg-slate-100 px-2 py-0.5 rounded-lg w-fit">
              ทราฟฟิกเรียลไทม์
            </span>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Conversion Rate</span>
            <span className="text-3xl font-black text-slate-900 block">
              {data.conversionRate}%
            </span>
            <span className="text-xs font-bold text-success-600 flex items-center gap-0.5 bg-success-50 px-2 py-0.5 rounded-lg w-fit">
              <TrendingUp className="w-3.5 h-3.5" /> แข็งแกร่ง
            </span>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">คำสั่งซื้อสะสม</span>
            <span className="text-3xl font-black text-slate-900 block">
              {data.totalOrders} <span className="text-sm font-bold text-slate-500">ออเดอร์</span>
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-0.5 bg-slate-100 px-2 py-0.5 rounded-lg w-fit">
              เฉลี่ย {data.totalSales && data.totalOrders ? Math.round(data.totalSales / data.totalOrders).toLocaleString() : 0} บ./ออเดอร์
            </span>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
            <ShoppingCart className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Main Charts & Revenue Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales & Revenue Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">แนวโน้มรายได้และยอดขาย</h2>
              <p className="text-xs text-slate-400 mt-0.5">ยอดขายรวมย้อนหลัง 7 วันที่ผ่านมา</p>
            </div>
            <span className="px-3 py-1 bg-pink-50 border border-pink-100 text-pink-700 rounded-xl text-xs font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> รายสัปดาห์
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="relative pt-4 bg-slate-55 rounded-2xl border border-slate-100/50 p-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#db2777" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#db2777" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 4 }).map((_, i) => {
                const y = 20 + i * ((chartHeight - paddingBottom - 20) / 3);
                const valLabel = Math.round(maxSales - (i * maxSales / 3));
                return (
                  <g key={i} className="opacity-45">
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={chartWidth - 20} 
                      y2={y} 
                      stroke="#e2e8f0" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="fill-slate-400 font-bold text-[10px]"
                    >
                      {valLabel.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Path */}
              {salesAreaD && (
                <path d={salesAreaD} fill="url(#salesGrad)" />
              )}

              {/* Line Path */}
              {salesPathD && (
                <path 
                  d={salesPathD} 
                  fill="none" 
                  stroke="#db2777" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* X Axis Labels & Points */}
              {salesPoints.map((p, idx) => (
                <g key={idx}>
                  {/* Circle dot on path */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4.5" 
                    fill="#db2777" 
                    stroke="#ffffff" 
                    strokeWidth="1.5" 
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                  {/* Tooltip Value */}
                  {p.sales > 0 && (
                    <text 
                      x={p.x} 
                      y={p.y - 10} 
                      textAnchor="middle" 
                      className="fill-slate-700 font-black text-[9px] bg-white"
                    >
                      {p.sales.toLocaleString()}
                    </text>
                  )}
                  {/* Date label */}
                  <text 
                    x={p.x} 
                    y={chartHeight - 12} 
                    textAnchor="middle" 
                    className="fill-slate-400 font-bold text-[11px]"
                  >
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Visitor Traffic Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">สถิติจำนวนผู้เข้าชม (Traffic Trend)</h2>
              <p className="text-xs text-slate-400 mt-0.5">จำนวนครั้งที่เข้าชมจำแนกตามรายวัน</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> ทราฟฟิกรวม
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative pt-4 bg-slate-55 rounded-2xl border border-slate-100/50 p-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
              <defs>
                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 4 }).map((_, i) => {
                const y = 20 + i * ((chartHeight - paddingBottom - 20) / 3);
                const valLabel = Math.round(maxVisitors - (i * maxVisitors / 3));
                return (
                  <g key={i} className="opacity-45">
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={chartWidth - 20} 
                      y2={y} 
                      stroke="#e2e8f0" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="fill-slate-400 font-bold text-[10px]"
                    >
                      {valLabel}
                    </text>
                  </g>
                );
              })}

              {/* Bar Rectangles */}
              {visitorPoints.map((p, idx) => (
                <g key={idx}>
                  <rect 
                    x={p.x - p.width / 2} 
                    y={p.y} 
                    width={p.width} 
                    height={p.height} 
                    rx="4" 
                    fill="url(#visitorGrad)" 
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                  {/* Tooltip Value */}
                  <text 
                    x={p.x} 
                    y={p.y - 8} 
                    textAnchor="middle" 
                    className="fill-blue-700 font-black text-[9px]"
                  >
                    {p.val}
                  </text>
                  {/* X axis Label */}
                  <text 
                    x={p.x} 
                    y={chartHeight - 12} 
                    textAnchor="middle" 
                    className="fill-slate-400 font-bold text-[11px]"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

      </div>

      {/* Category Sales & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Revenue Progress Bars */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">สัดส่วนรายรับแยกตามหมวดหมู่</h2>
              <p className="text-xs text-slate-400 mt-0.5">ยอดจำหน่ายแบ่งตามกลุ่มประเภทสินค้า</p>
            </div>
            <Award className="w-5 h-5 text-pink-600" />
          </div>

          {data.categorySales.length === 0 ? (
            <div className="py-12 text-center text-slate-400">ยังไม่มีข้อมูลยอดขายแยกตามหมวดหมู่</div>
          ) : (
            <div className="space-y-4">
              {data.categorySales.map((cat, idx) => {
                const percentage = Math.round((cat.sales / maxCategorySales) * 100);
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        {cat.category}
                      </span>
                      <span>{cat.sales.toLocaleString()} บาท ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">ช่องทางการชำระเงิน</h2>
              <p className="text-xs text-slate-400 mt-0.5">แบ่งตามช่องทางการจ่ายเงินจริง</p>
            </div>
            <Wallet className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="flex flex-col gap-4">
            {data.paymentMethodSales.map((pay, idx) => {
              const isCOD = pay.method.includes("COD");
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isCOD 
                      ? 'bg-amber-50/50 border-amber-100 text-amber-900' 
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-900'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-extrabold block text-sm">{pay.method}</span>
                    <span className="text-xs text-slate-500 font-bold block">{pay.count} ออเดอร์สำเร็จ</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg block">{pay.sales.toLocaleString()} บาท</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Financial Table Report & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Financial Report Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">รายงานรายได้รายวัน</h2>
              <p className="text-xs text-slate-400 mt-0.5">ตารางวิเคราะห์รายวันย้อนหลัง 7 วัน</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full border-collapse text-left text-xs font-bold text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs">
                  <th className="p-3.5 pl-5">วันที่ (Date)</th>
                  <th className="p-3.5 text-center">จำนวนผู้เข้าชม (Visitors)</th>
                  <th className="p-3.5 text-center">จำนวนคำสั่งซื้อ (Orders)</th>
                  <th className="p-3.5 text-right">ยอดขายรายวัน (Sales)</th>
                  <th className="p-3.5 pr-5 text-right">เฉลี่ยต่อออเดอร์ (AOV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[...data.dailySales].reverse().map((day, idx) => {
                  const aov = day.orders > 0 ? Math.round(day.sales / day.orders) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 text-slate-900 font-extrabold">{day.date}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{day.visitors.toLocaleString()}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{day.orders}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">{day.sales.toLocaleString()} บาท</td>
                      <td className="p-3.5 pr-5 text-right font-bold text-slate-500">{aov.toLocaleString()} บาท</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">สินค้าขายดี 5 อันดับแรก</h2>
              <p className="text-xs text-slate-400 mt-0.5">วัดผลตามจำนวนชิ้นที่จำหน่ายออก</p>
            </div>
            <ShoppingBag className="w-5 h-5 text-pink-600" />
          </div>

          {data.topProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">ยังไม่มีข้อมูลสินค้าขายดี</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.topProducts.map((prod, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs">
                      <span className="font-extrabold block text-slate-800 line-clamp-1">{prod.name}</span>
                      <span className="text-slate-400 font-semibold block">{prod.category}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs">
                    <span className="font-extrabold block text-slate-900">{prod.quantitySold} ชิ้น</span>
                    <span className="text-success-600 font-extrabold block">{prod.revenue.toLocaleString()} บ.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
