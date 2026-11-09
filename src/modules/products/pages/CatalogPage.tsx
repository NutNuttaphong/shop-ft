import React, { useState, useEffect, useMemo } from 'react';
import { restfulApi, Product, logVisitorVisit } from '../../../shared/services/api';
import { 
  Search, Filter, Sparkles, RefreshCw, 
  Star, X, ArrowUpDown, Heart
} from 'lucide-react';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { SmartSearchBar } from '../../../shared/components/ui/SmartSearchBar';
import { filterAndSortProducts, PRICE_PRESETS } from '../../../shared/utils/productFilters';
import { useWishlist } from '../../../shared/hooks/useWishlist';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getAverageRating
} from '../utils/mockData';

export interface NewsItem {
  id: number;
  tag: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  action: string;
}

const NEWS_ITEMS: NewsItem[] = [
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

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [categories, setCategories] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeNewsModal, setActiveNewsModal] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>(NEWS_ITEMS);
  
  const [searchParams] = useSearchParams();

  // Advanced Filter & Sort State
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [showAdvanceFilters, setShowAdvanceFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  // const handleNewsClick = (action: string) => {
  //   if (action === 'vegetables') {
  //     const vegCategory = categories.find(c => c.includes('ผัก') || c.includes('ผลไม้'));
  //     if (vegCategory) {
  //       setSelectedCategory(vegCategory);
  //     } else {
  //       setSelectedCategory('ทั้งหมด');
  //     }
  //     const element = document.getElementById('catalog-grid-top');
  //     if (element) {
  //       element.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   } else {
  //     setActiveNewsModal(action);
  //   }
  // };

  // Read initial category and search query from URL if present
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
    const qParam = searchParams.get('q') || searchParams.get('search');
    if (qParam !== null) {
      setSearchTerm(qParam);
    }
    const sortParam = searchParams.get('sort');
    if (sortParam) {
      setSortBy(sortParam);
    }
    const minP = searchParams.get('minPrice');
    if (minP && !isNaN(Number(minP))) {
      setMinPrice(Number(minP));
    }
    const maxP = searchParams.get('maxPrice');
    if (maxP && !isNaN(Number(maxP))) {
      setMaxPrice(Number(maxP));
    }
    const stockParam = searchParams.get('inStock');
    if (stockParam === 'true') {
      setOnlyInStock(true);
    }
    const ratingParam = searchParams.get('rating');
    if (ratingParam && !isNaN(Number(ratingParam))) {
      setMinRating(Number(ratingParam));
    }
  }, [searchParams]);

  const hasActiveFilters = Boolean(
    searchTerm ||
    selectedCategory !== 'ทั้งหมด' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    onlyInStock ||
    minRating > 0
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ทั้งหมด');
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setMinRating(0);
    setSortBy('newest');
    navigate('/products', { replace: true });
  };

  const handleSearchSubmit = (term: string) => {
    setSearchTerm(term);
    const newParams = new URLSearchParams(searchParams);
    if (term) {
      newParams.set('q', term);
    } else {
      newParams.delete('q');
      newParams.delete('search');
    }
    navigate(`?${newParams.toString()}`, { replace: true });
  };
  

  


  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, onlyInStock, minRating, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restfulApi.get<Product[]>('/api/products');
      if (response.error) {
        setError(response.error);
      } else {
        const data = response.data || [];
        console.log('Fetched products data:', data);
        setProducts(data);
        
        // Extract categories dynamically
        const uniqueCategories = ['ทั้งหมด', ...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    logVisitorVisit(window.location.pathname);
  }, []);

  // Load news from localStorage or defaults
  useEffect(() => {
    const loadNews = () => {
      const stored = localStorage.getItem('app_news_items');
      if (stored) {
        try {
          setNewsList(JSON.parse(stored));
        } catch {
          setNewsList(NEWS_ITEMS);
        }
      } else {
        setNewsList(NEWS_ITEMS);
        localStorage.setItem('app_news_items', JSON.stringify(NEWS_ITEMS));
      }
    };
    loadNews();
    window.addEventListener('news-updated', loadNews);
    return () => window.removeEventListener('news-updated', loadNews);
  }, []);

  // Auto-rotate Carousel slides for News
  useEffect(() => {
    if (newsList.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % newsList.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [newsList]);



  // Filter & Sort Logic using productFilters utility
  const sortedProducts = useMemo(() => {
    return filterAndSortProducts(products, {
      searchTerm,
      category: selectedCategory,
      minPrice,
      maxPrice,
      onlyInStock,
      minRating,
      sortBy
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice, onlyInStock, minRating, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className="space-y-8 font-['Inter',sans-serif] relative overflow-hidden min-h-screen">
      {/* Floating Ambient Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-400/15 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-400/15 rounded-full filter blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-rose-400/15 rounded-full filter blur-[120px] pointer-events-none z-0" />
      
      {/* Auto-rotating Hero Carousel (News & Promotions) */}
      <div className="relative rounded-3xl h-[300px] sm:h-[350px] shadow-lg overflow-hidden group select-none animate-fade-in bg-slate-950">
        {newsList.map((news, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={news.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              {/* Background Image with Dark Overlay */}
              <div className="absolute inset-0 bg-slate-950"  >
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/30 to-transparent" /> */}
              </div>

              {/* Content */}
              {/* <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-20">
                <div className="max-w-xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 bg-primary-600/95 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> {news.tag}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight line-clamp-2 drop-shadow-md">
                    {news.title}
                  </h1>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-lg drop-shadow-sm">
                    {news.description}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => handleNewsClick(news.action)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95 text-sm sm:text-[15px]"
                  >
                    <span>{news.ctaText}</span>
                  </button>
                </div>
              </div> */}
            </div>
          );
        })}

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-30">
          {newsList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeSlide ? 'w-6 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Left/Right Navigation Buttons */}
        <button
          onClick={() => setActiveSlide((prev) => (prev - 1 + newsList.length) % newsList.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/25 hover:bg-black/45 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
          aria-label="Previous slide"
        >
          &#10094;
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % newsList.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/25 hover:bg-black/45 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
          aria-label="Next slide"
        >
          &#10095;
        </button>
      </div>


      {/* Controls Bar (Search / Filters / Sort) */}
      <div className="bg-white/75 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-lg shadow-slate-100/50 space-y-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1">
            <SmartSearchBar
              id="search"
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearchSubmit}
              products={products}
              placeholder="ค้นหาชื่อสินค้า หรือรายละเอียดที่คุณต้องการ..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Advance Filters Button */}
            <button
              onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
              className={`px-5 py-3 rounded-2xl text-[15px] font-bold flex items-center gap-2 border-2 transition-all ${
                showAdvanceFilters || minPrice !== '' || maxPrice !== '' || onlyInStock
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>กรองสินค้าเพิ่มเติม</span>
              {(minPrice !== '' || maxPrice !== '' || onlyInStock) && (
                <span className="w-2.5 h-2.5 bg-primary-600 rounded-full"></span>
              )}
            </button>

            {/* Sort Control */}
            <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-1.5">
              <span className="text-slate-400 mr-2">
                <ArrowUpDown className="w-5 h-5" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-[15px] text-slate-700 focus:outline-none py-1.5 pr-2 cursor-pointer"
              >
                <option value="newest">จัดเรียง: ล่าสุด</option>
                <option value="price-asc">ราคา: ต่ำ - สูง</option>
                <option value="price-desc">ราคา: สูง - ต่ำ</option>
                <option value="rating-desc">คะแนนรีวิว: สูงสุด ★</option>
                <option value="popular">สินค้าขายดี / ยอดนิยม</option>
                <option value="name-asc">ชื่อสินค้า: ก - ฮ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvanceFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Price Range Filter & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">ช่วงราคา (บาท)</label>
                {(minPrice !== '' || maxPrice !== '') && (
                  <button
                    type="button"
                    onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                    className="text-xs text-primary-600 hover:underline font-bold"
                  >
                    รีเซ็ตราคา
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="ต่ำสุด"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="สูงสุด"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              {/* Quick Price Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRICE_PRESETS.map((preset) => {
                  const isActive = minPrice === preset.minPrice && maxPrice === preset.maxPrice;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          setMinPrice('');
                          setMaxPrice('');
                        } else {
                          setMinPrice(preset.minPrice);
                          setMaxPrice(preset.maxPrice);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">เกณฑ์คะแนนรีวิว</label>
                {minRating > 0 && (
                  <button
                    type="button"
                    onClick={() => setMinRating(0)}
                    className="text-xs text-primary-600 hover:underline font-bold"
                  >
                    รีเซ็ตคะแนน
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: 'ทั้งหมด', val: 0 },
                  { label: '★ 4.0 ขึ้นไป', val: 4.0 },
                  { label: '★ 4.5 ขึ้นไป', val: 4.5 }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setMinRating(opt.val)}
                    className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all border ${
                      minRating === opt.val
                        ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability Filter & Clear Action */}
            <div className="space-y-3 flex flex-col justify-end">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 mr-3 border-2 border-slate-300"
                />
                <span className="text-[15px] font-bold text-slate-700">แสดงเฉพาะสินค้าที่มีอยู่ในสต็อก</span>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="w-full text-xs font-bold text-danger-600 hover:text-danger-700 border border-danger-200 hover:border-danger-300 bg-danger-50 hover:bg-danger-100/80 px-4 py-2 rounded-xl transition-all"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Summary Chips & Counter */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">ตัวกรอง:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg font-medium">
                  <span>ค้นหา: "{searchTerm}"</span>
                  <button type="button" onClick={() => setSearchTerm('')} aria-label="ลบคำค้นหา" className="hover:text-primary-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== 'ทั้งหมด' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg font-medium">
                  <span>หมวดหมู่: {selectedCategory}</span>
                  <button type="button" onClick={() => setSelectedCategory('ทั้งหมด')} aria-label="ลบหมวดหมู่" className="hover:text-primary-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPrice !== '' || maxPrice !== '') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg font-medium">
                  <span>ราคา: ฿{minPrice || 0} - {maxPrice ? `฿${maxPrice}` : 'ไม่จำกัด'}</span>
                  <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); }} aria-label="ลบราคา" className="hover:text-primary-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium">
                  <span>★ {minRating}+</span>
                  <button type="button" onClick={() => setMinRating(0)} aria-label="ลบคะแนน" className="hover:text-amber-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {onlyInStock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
                  <span>มีสินค้าในสต็อก</span>
                  <button type="button" onClick={() => setOnlyInStock(false)} aria-label="ลบตัวกรองสต็อก" className="hover:text-emerald-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-primary-600 hover:text-primary-700 font-bold ml-1 hover:underline cursor-pointer"
              >
                ล้างทั้งหมด
              </button>
            </div>
            <div className="text-slate-500 font-bold">
              พบสินค้า <span className="text-primary-600 font-extrabold">{sortedProducts.length}</span> รายการ
            </div>
          </div>
        )}
      </div>

      {/* Main product catalog layout: Sidebar + Product list */}
      <div id="catalog-grid-top" className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar for Categories (หมวดหมู่สินค้าข้างๆกล่อง card สินค้า) */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white/75 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-lg shadow-slate-100/50 space-y-4 lg:sticky lg:top-24 z-10">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="font-extrabold text-lg text-slate-900">หมวดหมู่สินค้า</h2>
          </div>
          
          {/* Scrollable on mobile/tablet, vertical list on desktop */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none lg:scrollbar-default">
            {categories.map((cat) => {
              const count = products.filter(p => cat === 'ทั้งหมด' || p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] font-bold transition-all text-left whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink lg:w-full ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-100'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="mr-3 lg:mr-0">{cat}</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 w-full space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col justify-center items-center">
              <div className="w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-4 text-slate-500 font-medium">กำลังเตรียมโหลดรายการสินค้าจากร้านค้า...</span>
            </div>
          ) : error ? (
            <div className="bg-danger-50 border-l-4 border-danger-500 p-6 rounded-r-3xl text-center">
              <p className="text-danger-700 font-bold mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-2xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> ลองโหลดใหม่อีกครั้ง
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">ไม่พบสินค้าที่ตรงกับเงื่อนไข</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                ลองปรับเปลี่ยนช่วงราคา หมวดหมู่ หรือคำค้นหา เพื่อค้นหาสินค้าใหม่อีกครั้ง
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-200"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {paginatedProducts.map((product) => {
                  const outOfStock = product.stock <= 0;
                  const ratingInfo = getAverageRating(product.id, product.category);
                  const discountPercent = Math.abs(product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3) % 45 + 15; // 15% to 59%
                  const mockReviewsCount = Math.abs(product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 17) % 25000 + 120;
                  const isMall = product.price > 75;
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="bg-white/75 backdrop-blur-xs rounded-2xl border border-white/40 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:shadow-primary-600/5 hover:border-white/80 hover:-translate-y-[3px] transition-all duration-300 cursor-pointer group relative z-10"
                    >
                      {/* Product Image */}
                      <div className="relative pt-[100%] bg-slate-50 overflow-hidden border-b border-slate-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          loading="lazy"
                        />
                        {outOfStock ? (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-danger-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs tracking-wide">
                              สินค้าหมดชั่วคราว
                            </span>
                          </div>
                        ) : product.stock <= 5 ? (
                          <div className="absolute top-2 left-2 bg-[#ff5722] text-white font-bold px-2 py-0.5 rounded-md text-[10px] shadow-sm">
                            เหลือ {product.stock} ชิ้น!
                          </div>
                        ) : null}
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all z-20 shadow-sm ${
                            isWishlisted(product.id)
                              ? 'bg-rose-500 text-white shadow-rose-200'
                              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
                          }`}
                          title={isWishlisted(product.id) ? 'ลบออกจากรายการถูกใจ' : 'เพิ่มในรายการถูกใจ'}
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                        </button>

                        <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                          {product.category}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1.5">
                          {/* Product Title */}
                          <h3 className="font-semibold text-slate-800 text-[13px] leading-relaxed group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[36px]">
                            {isMall && (
                              <span className="bg-primary-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm mr-1.5 inline-flex items-center align-middle transform -translate-y-[1px]">
                                Mall
                              </span>
                            )}
                            {product.name}
                          </h3>
                        </div>

                        <div className="space-y-1">
                          {/* Price and Discount */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base font-bold text-primary-600 flex items-baseline">
                              <span className="text-xs mr-0.5">฿</span>{product.price.toLocaleString()}
                            </span>
                            {!outOfStock && (
                              <span className="text-[10px] text-primary-600 bg-primary-100 px-1 py-0.5 rounded-sm font-bold">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Ratings stars & count */}
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const isFilled = ratingInfo.rating > 0
                                ? i < Math.round(ratingInfo.rating)
                                : true;
                              return (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${isFilled ? 'fill-current' : 'text-slate-300'}`} 
                                />
                              );
                            })}
                            <span className="text-[11px] text-slate-400 ml-1 font-semibold">
                              ({mockReviewsCount.toLocaleString()})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {sortedProducts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={sortedProducts.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
          )}
        </div>
      </div>



      {/* News Detail Modal */}
      {activeNewsModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative animate-scale-up">
            <button 
              onClick={() => setActiveNewsModal(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            {activeNewsModal === 'free-delivery' ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950">รายละเอียดเงื่อนไขจัดส่งฟรี 🚚</h3>
                <div className="space-y-3 text-slate-600 text-sm leading-relaxed font-medium">
                  <p>
                    FRIST SHOP มอบสิทธิพิเศษบริการจัดส่งฟรีทั่วพื้นที่สำหรับยอดสั่งซื้อตั้งแต่ <strong>500 บาทขึ้นไป</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>ยอดสั่งซื้อน้อยกว่า 500 บาท มีค่าจัดส่งเริ่มต้น 40 บาท</li>
                    <li>จัดส่งรวดเร็วด้วยกล่องเก็บความเย็นพิเศษเพื่อถนอมผักผลไม้สดและอาหารสด</li>
                    <li>ระยะเวลาจัดส่ง 1-2 วันทำการ (สั่งเช้า ส่งบ่ายสำหรับพื้นที่ใกล้เคียง)</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveNewsModal(null)}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-2xl transition-colors text-sm"
                >
                  รับทราบ
                </button>
              </div>
            ) : activeNewsModal === 'health-tips' ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-955">เคล็ดลับการเลือกซื้อและการล้างผักผลไม้ 🍎</h3>
                <div className="space-y-3.5 text-slate-600 text-sm leading-relaxed font-medium">
                  <div>
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1">1. การล้างเพื่อลดสารเคมีตกค้าง:</h4>
                    <p>แช่ผักในน้ำผสมเบกกิ้งโซดา (ครึ่งช้อนโต๊ะต่อน้ำ 10 ลิตร) นาน 15 นาที แล้วล้างออกด้วยน้ำสะอาด สามารถช่วยลดสารเคมีได้สูงสุดถึง 90%</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1">2. การสังเกตความสดใหม่:</h4>
                    <p>เลือกผักที่มีสีสันตามธรรมชาติ ไม่มีรอยช้ำหรือรอยเน่า ใบไม่เหลืองซีด สำหรับผลไม้ควรเลือกผลที่ขั้วยังดูสดและมีกลิ่นหอมเฉพาะตัว</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1">3. ทริคการเก็บรักษา:</h4>
                    <p>ไม่ควรล้างผักก่อนนำไปแช่ตู้เย็น หากล้างแล้วต้องผึ่งให้แห้งสนิทก่อนเก็บใส่ถุงหรือกล่องสูญญากาศ เพื่อป้องกันใบเน่าเสียเร็วขึ้น</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNewsModal(null)}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-2xl transition-colors text-sm"
                >
                  ตกลง
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};
