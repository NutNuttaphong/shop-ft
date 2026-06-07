import React, { useState, useEffect } from 'react';
import { restfulApi, Promotion, Product, logVisitorVisit } from '../../../shared/services/api';
import { Gift, Copy, Check, Calendar, AlertCircle, Sparkles, RefreshCw, Flame, Layers, ShoppingBag, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../../shared/components/ui/Pagination';

export const PromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // 2 items per page to show paginator clearly

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restfulApi.get<Promotion[]>('/api/promotions');
      if (response.error) {
        setError(response.error);
      } else {
        // Only show active promotions for user role
        const allPromos = response.data || [];
        const activePromos = allPromos.filter(p => p.isActive);
        setPromotions(activePromos);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลโปรโมชั่นได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await restfulApi.get<Product[]>('/api/products');
      if (!response.error && response.data) {
        setAllProducts(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchAllProducts();
    logVisitorVisit(window.location.pathname);
  }, []);

  // Reset page when promotions list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [promotions.length]);

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('ไม่สามารถคัดลอกโค้ดได้', err);
    }
  };

  // Helper to format Thai date
  const formatThaiDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to render type badge
  const renderPromoBadge = (type?: string) => {
    switch (type) {
      case 'FLASH_SALE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-black uppercase">
            <Flame className="w-3 h-3 fill-amber-500 text-amber-500 animate-pulse" />
            Flash Sale
          </span>
        );
      case 'BUNDLE_DEAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-black uppercase">
            <Layers className="w-3 h-3 text-indigo-500" />
            Bundle Deal
          </span>
        );
      case 'DISCOUNT_CAMPAIGN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-black uppercase">
            <ShoppingBag className="w-3 h-3 text-purple-500" />
            Campaign
          </span>
        );
      case 'COUPON':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 text-pink-700 rounded-lg text-xs font-black uppercase">
            <Tag className="w-3 h-3 text-pink-500" />
            คูปองร้านค้า
          </span>
        );
    }
  };

  // Helper to get promotion summary description
  const getPromoSummary = (promo: Promotion) => {
    switch (promo.type) {
      case 'FLASH_SALE':
        const flashProds = promo.productIds
          ? allProducts.filter(p => promo.productIds?.includes(p.id))
          : [];
        const prodNames = flashProds.map(p => p.name).join(', ');
        return `ลดราคาพิเศษสำหรับสินค้าที่ร่วมรายการ: ${prodNames || 'สินค้าที่เลือก'} (หักส่วนลดทันทีในตะกร้า)`;
      case 'BUNDLE_DEAL':
        const bundleProds = promo.productIds
          ? allProducts.filter(p => promo.productIds?.includes(p.id))
          : [];
        const bNames = bundleProds.map(p => p.name).join(', ');
        return `ซื้อสินค้าที่ร่วมรายการตั้งแต่ ${promo.bundleQty} ชิ้นขึ้นไป ลดราคาทันที: ${bNames || 'สินค้าที่เลือก'}`;
      case 'DISCOUNT_CAMPAIGN':
        return `ลดราคาพิเศษยกหมวดหมู่สำหรับสินค้าในกลุ่ม "${promo.targetCategory}" ทั้งหมด (หักส่วนลดอัตโนมัติ)`;
      case 'COUPON':
      default:
        return promo.description || 'นำโค้ดไปกรอกเพื่อรับส่วนลดตอนจ่ายเงิน';
    }
  };

  const totalPages = Math.ceil(promotions.length / itemsPerPage);
  const paginatedPromotions = promotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">

      {/* Intro Hero Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-y-8 translate-x-8">
          <Gift className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-yellow-300" /> แคมเปญส่วนลดพิเศษสุดคุ้ม
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            โปรโมชั่นและแคมเปญส่วนลดพิเศษ
          </h1>
          <p className="text-pink-55 text-[16px] sm:text-[18px] leading-relaxed opacity-90">
            ช้อปสินค้าสุดคุ้มกับหลากหลายโปรโมชั่น ทั้งโค้ดส่วนลด, Flash Sale ประจำวัน, Bundle Deal ยิ่งซื้อยิ่งลด และส่วนลดตามหมวดหมู่แคมเปญ!
          </p>
        </div>
      </div>

      {/* Copied Toast Notification */}
      {copiedCode && (
        <div className="fixed bottom-8 right-8 z-50 bg-success-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-success-500 animate-fade-in text-[17px] font-bold">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Check className="w-5 h-5" />
          </div>
          <span>คัดลอกรหัสโค้ด "{copiedCode}" สำเร็จแล้ว!</span>
        </div>
      )}

      {/* Main Promotions Content */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center">
          <div className="w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-500 font-medium">กำลังโหลดข้อมูลโปรโมชั่นล่าสุด...</span>
        </div>
      ) : error ? (
        <div className="bg-danger-50 border-l-4 border-danger-500 p-6 rounded-r-3xl text-center">
          <p className="text-danger-700 font-bold mb-4">{error}</p>
          <button
            onClick={fetchPromotions}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-2xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> โหลดใหม่อีกครั้ง
          </button>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่มีโปรโมชั่นเปิดใช้งาน</h3>
          <p className="text-slate-500 mb-6 text-[16px]">
            ขณะนี้ยังไม่มีโปรโมชั่นใหม่เปิดใช้งานในระบบ แวะกลับมาตรวจสอบข้อมูลในภายหลังนะคะ
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-md transition-colors"
          >
            ไปหน้าซื้อสินค้าหลัก
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedPromotions.map((promo) => {
              const isPercent = promo.discountType === 'PERCENTAGE' || promo.discountType === 'percentage';
              const isAutoPromo = promo.type !== 'COUPON';

              return (
                <div
                  key={promo.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-all group"
                >
                  {/* Left image or Visual container */}
                  <div className="relative w-full sm:w-44 bg-slate-100 overflow-hidden flex-shrink-0 min-h-[160px] sm:min-h-full">
                    <img
                      src={promo.imageUrl}
                      alt={promo.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent sm:hidden" />

                    {/* Badge Label */}
                    <div className="absolute top-4 left-4 bg-pink-600 text-white px-3.5 py-1.5 rounded-xl text-sm font-extrabold shadow-md">
                      {isPercent ? `ลด ${promo.discountValue}%` : `ลด ${promo.discountValue} บาท`}
                    </div>
                  </div>

                  {/* Right Info Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        {renderPromoBadge(promo.type)}
                      </div>
                      <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-pink-600 transition-colors">
                        {promo.name}
                      </h3>
                      <p className="text-[14px] text-slate-500 leading-relaxed font-semibold">
                        {getPromoSummary(promo)}
                      </p>
                    </div>

                    {/* Terms & Dates info */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center text-xs font-bold text-slate-400 gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>ใช้ได้ตั้งแต่: {formatThaiDate(promo.startDate)} - {formatThaiDate(promo.endDate)}</span>
                      </div>

                      {promo.type === 'COUPON' ? (
                        promo.minPurchase > 0 ? (
                          <div className="flex items-center text-xs font-bold text-amber-600 gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg w-fit border border-amber-100">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>ซื้อขั้นต่ำ {promo.minPurchase.toLocaleString()} บาทขึ้นไป</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-xs font-bold text-emerald-600 gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-100">
                            <AlertCircle className="w-4 h-4 text-emerald-500" />
                            <span>ไม่มีขั้นต่ำในการสั่งซื้อ</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center text-xs font-bold text-indigo-600 gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit border border-indigo-100">
                          <AlertCircle className="w-4 h-4 text-indigo-500" />
                          <span>ระบบลดเงินอัติโนมัติเมื่อตรงเงื่อนไข</span>
                        </div>
                      )}
                    </div>

                    {/* Copy Box or Auto Promo box */}
                    {isAutoPromo ? (
                      <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 justify-center text-indigo-800 text-xs font-black uppercase tracking-wider">
                        ✨ แคมเปญนี้ร่วมรายการลดอัตโนมัติในตะกร้า ✨
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 justify-between">
                        <div className="pl-2">
                          <span className="text-[11px] font-extrabold text-slate-400 block uppercase tracking-wider leading-none mb-1">
                            รหัสโปรโมชั่น
                          </span>
                          <span className="font-black text-lg text-slate-800 tracking-wider">
                            {promo.code}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-pink-50 text-sm"
                          title="คัดลอกโค้ดนี้"
                        >
                          <Copy className="w-4 h-4" />
                          <span>คัดลอกโค้ด</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {promotions.length > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={promotions.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Note warning footer */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-start space-x-3 text-[15px] text-slate-600 leading-relaxed shadow-xs">
        <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">วิธีการใช้งานโปรโมชั่น:</span>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>คูปองร้านค้า:</strong> กดคัดลอกรหัสและนำไปกรอกที่ช่องคูปองในหน้าตะกร้าสินค้าเพื่อรับส่วนลดเพิ่มเติม</li>
            <li><strong>Flash Sale / Bundle Deal / Discount Campaign:</strong> ระบบจะคำนวณและลดราคาในรายการตะกร้าสินค้าของคุณโดยอัตโนมัติเมื่อสินค้าที่สั่งซื้อเข้าเงื่อนไขของแคมเปญนั้นๆ</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
