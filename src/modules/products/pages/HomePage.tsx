import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restfulApi, Product, Promotion, logVisitorVisit } from '../../../shared/services/api';
import { 
  ShoppingBag, Gift, Copy, Check, ChevronLeft, ChevronRight, 
  Star, Truck, ShieldCheck, Clock, ArrowRight, Sparkles, X, MessageSquare
} from 'lucide-react';
import { getAverageRating } from '../utils/mockData';

export interface NewsItem {
  id: number;
  tag: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  action: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 1,
    tag: 'โปรโมชันพิเศษ',
    title: 'ฉลองเปิดตัวระบบ FRIST SHOP 🛒',
    description: 'รับส่วนลดพิเศษทันที 10% สำหรับสมาชิกใหม่ทุกคน เพียงใช้คูปองส่วนลดที่กำหนดหน้าชำระเงิน ช้อปสินค้าสุขภาพดีวันนี้เลย!',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'ช้อปผักสดวันนี้',
    action: 'vegetables'
  },
  {
    id: 2,
    tag: 'ข่าวประชาสัมพันธ์',
    title: 'ส่งตรงความสดใหม่จากสวนออร์แกนิก 🥬',
    description: 'ผักสวนครัวและผลไม้ทุกประเภท ปลูกด้วยวิถีธรรมชาติ ปลอดสารพิษ 100% ปลอดภัยต่อสุขภาพตัวคุณและครอบครัวที่คุณรัก',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1590d333c?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'ดูสินค้าออร์แกนิก',
    action: 'vegetables'
  },
  {
    id: 3,
    tag: 'ข่าวประชาสัมพันธ์',
    title: 'บริการจัดส่งฟรีทั่วพื้นที่ชุมชน 🚚',
    description: 'เมื่อซื้อครบ 500 บาทขึ้นไป จัดส่งรวดเร็วทันใจในวันเดียว คงความสดใหม่ของอาหารเสมือนมาเลือกซื้อที่หน้าร้านด้วยตัวเอง',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'ดูเงื่อนไขส่งฟรี',
    action: 'free-delivery'
  },
  {
    id: 4,
    tag: 'เคล็ดลับสุขภาพ',
    title: 'วิธีเลือกผักและผลไม้สดที่ถูกต้อง 🍎',
    description: 'เรียนรู้ทริคเล็กๆ ในการสังเกตความสดใหม่และการล้างทำความสะอาดสารเคมีตกค้างอย่างถูกวิธี เพื่อโภชนาการที่ดีที่สุดในทุกมื้ออาหาร',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'อ่านเคล็ดลับสุขภาพ',
    action: 'health-tips'
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>(DEFAULT_NEWS);
  const [loading, setLoading] = useState(true);
  
  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const banners = [
    {
      title: 'ยินดีต้อนรับสู่ FRIST SHOP 🛒',
      description: 'แหล่งรวมผักสด ผลไม้ออร์แกนิก ปลอดสารพิษ ส่งตรงจากสวนของเกษตรกรถึงหน้าบ้านคุณ เพื่อสุขภาพที่ดีขึ้นในทุกๆ วัน',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
      cta: 'เริ่มช้อปเลย',
      link: '/products'
    },
    {
      title: 'ฉลองลูกค้าใหม่ รับส่วนลด 10% 🎫',
      description: 'เพียงใช้โค้ด "FRISTNEW" ในการสั่งซื้อครั้งแรก ไม่มีขั้นต่ำ ยิ่งช้อปยิ่งคุ้มค่า ปลอดภัย ไว้ใจได้',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1590d333c?auto=format&fit=crop&w=1200&q=85',
      cta: 'ดูโค้ดโปรโมชัน',
      link: '/promotions'
    },
    {
      title: 'จัดส่งฟรีทั่วไทย เมื่อซื้อครบ 500 บาท 🚚',
      description: 'หมดห่วงเรื่องค่าส่งสินค้า เราควบคุมอุณหภูมิตลอดการขนส่งอย่างดี ผักและผลไม้สดใหม่ไร้ตำหนิ',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
      cta: 'ดูสินค้าทั้งหมด',
      link: '/products'
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Cart action feedback state
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeNewsModal, setActiveNewsModal] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products
      const prodRes = await restfulApi.get<Product[]>('/api/products');
      if (!prodRes.error && prodRes.data) {
        setProducts(prodRes.data);
      }

      // 2. Fetch Promotions
      const promoRes = await restfulApi.get<Promotion[]>('/api/promotions');
      if (!promoRes.error && promoRes.data) {
        const activePromos = promoRes.data.filter(p => p.isActive);
        setPromotions(activePromos);
      }

      // 3. Load News from LocalStorage or Default
      const storedNews = localStorage.getItem('app_news_items');
      if (storedNews) {
        setNewsList(JSON.parse(storedNews));
      } else {
        localStorage.setItem('app_news_items', JSON.stringify(DEFAULT_NEWS));
      }
    } catch (err) {
      console.error('Error fetching dashboard content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    logVisitorVisit('/');
  }, []);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating to product details
    if (product.stock <= 0) return;

    try {
      const res = await restfulApi.post<unknown>('/api/cart', {
        productId: product.id,
        quantity: 1
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      // Dispatch event to update layout badge
      window.dispatchEvent(new Event('cart-updated'));

      // Show temporary alert toast
      setAddedItem(product.name);
      setTimeout(() => setAddedItem(null), 2500);
    } catch (e) {
      console.error('ไม่สามารถหยิบใส่ตะกร้าได้', e);
    }
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const handleNewsClick = (action: string) => {
    if (action === 'vegetables') {
      navigate('/products?category=ผักและผลไม้');
    } else {
      setActiveNewsModal(action);
    }
  };

  // Mock Category List with custom designs
  const categoryShortcuts = [
    { name: 'ผักและผลไม้', label: 'ผักและผลไม้สด', icon: '🥬', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100' },
    { name: 'เนื้อสัตว์', label: 'เนื้อสัตว์และไข่', icon: '🥩', bg: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100' },
    { name: 'เครื่องดื่ม', label: 'เครื่องดื่มและน้ำผลไม้', icon: '🥤', bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100' },
    { name: 'เบเกอรี่', label: 'ขนมปังและเบเกอรี่', icon: '🍞', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100' },
    { name: 'ทั้งหมด', label: 'ดูสินค้าทั้งหมด', icon: '✨', bg: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-100' }
  ];

  // Recommended Products: Take up to 8 in stock products
  const recommendedProducts = products
    .filter(p => p.stock > 0)
    .slice(0, 8);

  return (
    <div className="space-y-10 pb-16 relative">
      
      {/* Toast Alert for Cart addition */}
      {addedItem && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-bounce-subtle">
          <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-[15px] block">หยิบใส่ตะกร้าสำเร็จ!</span>
            <span className="text-xs text-slate-300">เพิ่ม {addedItem} ลงในตะกร้าของคุณแล้ว</span>
          </div>
        </div>
      )}

      {/* Copy Alert Popup */}
      {copiedCode && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800">
          <Check className="w-4 h-4 text-success-500" />
          <span className="font-bold text-xs">คัดลอกโค้ด "{copiedCode}" เรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* 1. Hero Section (Carousel) */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] sm:aspect-[16/7] md:aspect-[2.4/1] shadow-xl group">
        <div className="absolute inset-0 transition-transform duration-1000 ease-out">
          <img
            src={banners[activeSlide].image}
            alt={banners[activeSlide].title}
            className="w-full h-full object-cover opacity-60 scale-100 transition-all duration-700 group-hover:scale-105"
          />
        </div>
        
        {/* Banner Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-center px-8 sm:px-16 md:px-24 text-white">
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-600/35 border border-primary-500/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary-200">
              <Sparkles className="w-3.5 h-3.5" /> แนะนำพิเศษ
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {banners[activeSlide].title}
            </h1>
            <p className="text-slate-300 text-xs sm:text-base md:text-lg leading-relaxed max-w-xl font-medium">
              {banners[activeSlide].description}
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate(banners[activeSlide].link)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-6 sm:px-8 py-3 rounded-2xl transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2 text-xs sm:text-[15px]"
              >
                <span>{banners[activeSlide].cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <button
          onClick={() => setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-8 bg-primary-500' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Value Propositions Section */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { title: 'ส่งของรวดเร็วทันใจ', desc: 'จัดส่งวันเดียว คงความสดชื่นเต็มเปี่ยม', icon: Truck, color: 'bg-emerald-50 text-emerald-600' },
          { title: 'ปลอดสารพิษ 100%', desc: 'คัดสรรพืชผักออร์แกนิก ปลอดภัย มั่นใจได้', icon: ShieldCheck, color: 'bg-blue-50 text-blue-600' },
          { title: 'พนักงานพร้อมช่วยเหลือ', desc: 'บริการทุกวัน พร้อมแก้ไขปัญหา 24 ชม.', icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { title: 'โปรคุ้มค่ายิ่งใหญ่', desc: 'มีคูปองสะสม ของแถม ของรางวัลจัดเต็ม', icon: Gift, color: 'bg-rose-50 text-rose-600' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${item.color} flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-[15px] text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-xs font-semibold leading-normal">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Category Quick Filter Shortcuts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">หมวดหมู่ยอดนิยม 📂</h2>
            <p className="text-slate-500 text-xs font-bold">เลือกช้อปสินค้าตามหมวดหมู่ที่คุณสนใจได้ทันที</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {categoryShortcuts.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => navigate(cat.name === 'ทั้งหมด' ? '/products' : `/products?category=${encodeURIComponent(cat.name)}`)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-[14px] border border-slate-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${cat.bg}`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Active Coupons / Promotions Section */}
      {promotions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">โค้ดส่วนลดและแคมเปญร้อนแรง 🔥</h2>
              <p className="text-slate-500 text-xs font-bold">เก็บโค้ดแล้วนำไปใช้ในหน้าชำระเงินเพื่อลดเพิ่ม</p>
            </div>
            <button
              onClick={() => navigate('/promotions')}
              className="text-primary-600 hover:text-primary-700 font-extrabold text-xs flex items-center gap-1 group"
            >
              <span>ดูแคมเปญทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {promotions.slice(0, 4).map((promo) => {
              const isPercentage = promo.discountType.toLowerCase() === 'percentage';
              return (
                <div 
                  key={promo.id} 
                  className="bg-white border-2 border-dashed border-primary-200 hover:border-primary-400 p-5 rounded-3xl shadow-xs flex justify-between items-center gap-4 relative overflow-hidden transition-colors"
                >
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary-50 rounded-full"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-primary-50 rounded-full"></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                          {promo.type || 'COUPON'}
                        </span>
                        {promo.minPurchase > 0 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            ขั้นต่ำ ฿{promo.minPurchase}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-[15px] text-slate-900 leading-tight">
                        {promo.name}
                      </h3>
                      <p className="text-slate-500 text-xs font-semibold max-w-sm line-clamp-1">
                        {promo.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2 relative z-10">
                    <div className="text-primary-600 font-black text-xl sm:text-2xl">
                      {isPercentage ? `${promo.discountValue}%` : `฿${promo.discountValue}`}
                      <span className="text-[10px] text-slate-400 font-bold block">ส่วนลด</span>
                    </div>
                    <button
                      onClick={(e) => handleCopyCode(promo.code, e)}
                      className="bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 font-black text-[11px] px-3.5 py-2 rounded-xl transition-all border border-slate-200 hover:border-primary-200 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{promo.code}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Recommended Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">สินค้าแนะนำสำหรับคุณ ⭐</h2>
            <p className="text-slate-500 text-xs font-bold">สินค้าคุณภาพ คัดสดใหม่ยอดขายสูงสุดในรอบสัปดาห์</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-primary-600 hover:text-primary-700 font-extrabold text-xs flex items-center gap-1 group"
          >
            <span>ดูสินค้าสั่งซื้อเพิ่มเติม</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="bg-slate-200 rounded-2xl aspect-square w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : recommendedProducts.length === 0 ? (
          <div className="bg-white/50 border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-extrabold text-[15px]">ไม่พบรายการแนะนำในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => {
              const ratingInfo = getAverageRating(product.id, product.category);
              const discountPercent = Math.abs(product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3) % 45 + 15;
              const mockReviewsCount = Math.abs(product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 17) % 25000 + 120;
              const isMall = product.price > 75;

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative pt-[100%] bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-extrabold">
                      {product.category}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-[14px] leading-snug line-clamp-2 min-h-[38px] group-hover:text-primary-600 transition-colors">
                        {isMall && (
                          <span className="bg-primary-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md mr-1.5 inline-flex items-center align-middle transform -translate-y-[1px]">
                            Mall
                          </span>
                        )}
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[15px] sm:text-base font-black text-primary-600">
                          ฿{product.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-primary-700 bg-primary-50 border border-primary-100 px-1.5 py-0.2 rounded-md font-bold">
                          -{discountPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Ratings */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < Math.round(ratingInfo.rating) ? 'fill-current' : 'text-slate-200'}`} 
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-1 font-semibold">
                          ({mockReviewsCount.toLocaleString()})
                        </span>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full bg-slate-900 hover:bg-primary-600 text-white font-extrabold py-2.5 px-3 rounded-2xl transition-colors text-xs flex items-center justify-center gap-1.5 group/btn cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>หยิบใส่ตะกร้า</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Recent News / Articles Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950">ข่าวสารและเรื่องราวน่าอ่าน 📰</h2>
          <p className="text-slate-500 text-xs font-bold">อัปเดตเคล็ดลับดูแลสุขภาพ การปรุงอาหาร และกิจกรรมดีๆ จากพวกเรา</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {newsList.map((news) => (
            <div
              key={news.id}
              onClick={() => handleNewsClick(news.action)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                  {news.tag}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-[14px] leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {news.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium">
                  {news.description}
                </p>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-black text-primary-600">
                  <span>{news.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Store Statistics (Trust Signals) */}
      <section className="bg-slate-900 rounded-3xl text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {[
            { value: '25,480+', label: 'คำสั่งซื้อสำเร็จ', sub: 'จัดส่งรวดเร็วทันใจ' },
            { value: '12,800+', label: 'ลูกค้าพึงพอใจ', sub: 'สมาชิกในระบบทั้งหมด' },
            { value: '4.9 / 5.0', label: 'คะแนนเฉลี่ยร้าน', sub: 'จากรีวิวผู้ใช้จริง 15k+' },
            { value: '120+', label: 'พืชผักออร์แกนิก', sub: 'คัดตรงจากฟาร์มชุมชน' }
          ].map((stat, idx) => (
            <div key={idx} className={`space-y-1.5 ${idx > 1 ? 'pt-6 md:pt-0' : 'pt-0'}`}>
              <div className="text-2xl sm:text-3xl font-black text-primary-400">{stat.value}</div>
              <div className="font-extrabold text-xs sm:text-[14px] text-white">{stat.label}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* News Detail Modal */}
      {activeNewsModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative animate-scale-up">
            <button 
              onClick={() => setActiveNewsModal(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {activeNewsModal === 'free-delivery' ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950">รายละเอียดเงื่อนไขจัดส่งฟรี 🚚</h3>
                <div className="space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                  <p>
                    FRIST SHOP มอบสิทธิพิเศษบริการจัดส่งฟรีทั่วพื้นที่สำหรับยอดสั่งซื้อตั้งแต่ <strong>500 บาทขึ้นไป</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li>ยอดสั่งซื้อน้อยกว่า 500 บาท มีค่าจัดส่งเริ่มต้น 40 บาท</li>
                    <li>จัดส่งรวดเร็วด้วยกล่องเก็บความเย็นพิเศษเพื่อถนอมผักผลไม้สดและอาหารสด</li>
                    <li>ระยะเวลาจัดส่ง 1-2 วันทำการ (สั่งเช้า ส่งบ่ายสำหรับพื้นที่ใกล้เคียง)</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveNewsModal(null)}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 px-4 rounded-2xl transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  รับทราบ
                </button>
              </div>
            ) : activeNewsModal === 'health-tips' ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950">วิธีเลือกผักและผลไม้สดที่ถูกต้อง 🍎</h3>
                <div className="space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                  <p>
                    เพื่อสุขภาพและโภชนาการที่ดีที่สุดของครอบครัว แนะนำวิธีพิจารณาความสดใหม่ดังนี้:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 font-medium">
                    <li><strong>สังเกตสีสันและผิวสัมผัส:</strong> ผักใบเขียวต้องสด ไม่เหี่ยวแห้ง ไม่มีรูพรุนขนาดใหญ่ หรือจุดด่างสีดำเข้ม</li>
                    <li><strong>การดมกลิ่นธรรมชาติ:</strong> ผลไม้ที่สุกดีจะมีกลิ่นหอมเฉพาะตัวโชยอ่อนๆ เช่น เมลอน กล้วย มะม่วง</li>
                    <li><strong>ความตึงและแน่น:</strong> ผักตระกูลหัว (แครอท หัวไชเท้า) ควรแข็งแน่นตึง ไม่ยุบตัวนิ่มหยุ่นเมื่อบีบเบาๆ</li>
                    <li><strong>การทำความสะอาด:</strong> แช่ผักในน้ำผสมเบกกิ้งโซดาหรือน้ำเกลือ 10-15 นาที แล้วล้างผ่านน้ำสะอาด เพื่อความมั่นใจไร้สารเคมีตกค้าง</li>
                  </ol>
                </div>
                <button
                  onClick={() => setActiveNewsModal(null)}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 px-4 rounded-2xl transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  รับทราบเคล็ดลับ
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
