import React, { useState, useEffect } from 'react';
import { restfulApi, Product, logVisitorVisit } from '../../../shared/services/api';
import { 
  ShoppingCart, Search, Filter, Sparkles, RefreshCw, 
  Star, Heart, MessageSquare, Volume2, VolumeX, 
  Play, X, ArrowUpDown, Check
} from 'lucide-react';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getShopForProduct,
  isShopFollowed,
  toggleFollowShop,
  getShopFollowerCount,
  getProductMedia,
  getAverageRating,
  getVariantsForProduct,
  Review,
  ProductMedia,
  Shop,
  ProductVariant
} from '../utils/mockData';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [categories, setCategories] = useState<string[]>([]);
  
  const [searchParams] = useSearchParams();

  // Read initial category from URL if present
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);
  
  // New Filters
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [showAdvanceFilters, setShowAdvanceFilters] = useState<boolean>(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Increased items per page to feel like a premium catalog
  
  // Notification State
  const [addedItem, setAddedItem] = useState<string | null>(null);

  // Selected Product (Detail Modal) State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMedia, setModalMedia] = useState<ProductMedia[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Shop Follow State
  const [productShop, setProductShop] = useState<Shop | null>(null);
  const [isFollowingShop, setIsFollowingShop] = useState<boolean>(false);
  const [shopFollowers, setShopFollowers] = useState<number>(0);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRatingInfo, setAvgRatingInfo] = useState<{ rating: number; totalReviews: number; distribution: Record<number, number> }>({
    rating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Selected Product Detail Quantity State
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, onlyInStock, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restfulApi.get<Product[]>('/api/products');
      if (response.error) {
        setError(response.error);
      } else {
        const data = response.data || [];
        setProducts(data);
        
        // Extract categories dynamically
        const uniqueCategories = ['ทั้งหมด', ...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    logVisitorVisit(window.location.pathname);
  }, []);

  // Sync follow state if changed elsewhere (e.g. Profile Page)
  useEffect(() => {
    const handleFollowChange = () => {
      if (selectedProduct && productShop) {
        setIsFollowingShop(isShopFollowed(productShop.name));
        setShopFollowers(getShopFollowerCount(productShop.name));
      }
    };
    window.addEventListener('follow-status-changed', handleFollowChange);
    return () => {
      window.removeEventListener('follow-status-changed', handleFollowChange);
    };
  }, [selectedProduct, productShop]);

  const handleAddToCart = async (product: Product, quantity: number = 1, variantName?: string, priceAdjustment: number = 0) => {
    if (product.stock <= 0 || quantity <= 0) return;
    if (quantity > product.stock) {
      alert(`ขออภัย สามารถหยิบลงตะกร้าได้สูงสุด ${product.stock} ชิ้น (เนื่องจากสต็อกมีจำกัด)`);
      return;
    }

    try {
      const res = await restfulApi.post<any>('/api/cart', {
        productId: product.id,
        quantity: quantity,
        variantName: variantName,
        priceAdjustment: priceAdjustment
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      // Dispatch custom storage event to alert MainLayout immediately
      window.dispatchEvent(new Event('cart-updated'));

      // Show toast alert
      const displayName = product.name + (variantName ? ` (${variantName})` : '');
      setAddedItem(`${displayName} (${quantity} ชิ้น)`);
      setTimeout(() => setAddedItem(null), 2500);
    } catch (e) {
      console.error('ไม่สามารถบันทึกข้อมูลตะกร้าได้', e);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const res = await restfulApi.get<any[]>(`/api/products/${productId}/reviews`);
      if (res.data) {
        const list = res.data;
        setReviews(list.map((r: any) => ({
          id: r.id,
          reviewerName: r.username || 'ผู้ซื้อทั่วไป',
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่',
          helpfulCount: 0
        })));
        
        // Calculate average rating and distribution
        const total = list.length;
        const sum = list.reduce((s, r) => s + r.rating, 0);
        const avg = total > 0 ? Number((sum / total).toFixed(1)) : 0;
        
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        list.forEach((r: any) => {
          if (r.rating >= 1 && r.rating <= 5) {
            dist[r.rating]++;
          }
        });
        
        setAvgRatingInfo({
          rating: avg,
          totalReviews: total,
          distribution: dist
        });
      }
    } catch (err) {
      console.error('Failed to fetch product reviews', err);
    }
  };

  // Open Product Detail Modal
  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailQuantity(1);
    
    // Media
    const media = getProductMedia(product.id, product.imageUrl, product.category);
    setModalMedia(media);
    setActiveMediaIndex(0);
    
    // Shop
    const shop = getShopForProduct(product.category);
    setProductShop(shop);
    setIsFollowingShop(isShopFollowed(shop.name));
    setShopFollowers(getShopFollowerCount(shop.name));
    
    // Variants
    const vars = getVariantsForProduct(product.category, product.price);
    setVariants(vars);
    setSelectedVariant(vars[0] || null);
    
    // Reviews
    fetchReviews(product.id);
    
    // Reset Form
    setReviewRating(5);
    setReviewComment('');
    setReviewerName('');
    setReviewError(null);
    setReviewSuccess(false);
    setActiveTab('details');
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
    setProductShop(null);
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    
    const buyNowItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name + (selectedVariant && selectedVariant.name ? " (" + selectedVariant.name + ")" : ""),
      price: selectedProduct.price + (selectedVariant ? selectedVariant.priceAdjustment : 0),
      quantity: detailQuantity,
      imageUrl: selectedProduct.imageUrl,
      stock: selectedProduct.stock,
      category: selectedProduct.category,
      variant: selectedVariant?.name || null
    };
    
    localStorage.setItem('app_buynow_item', JSON.stringify(buyNowItem));
    handleCloseDetails();
    navigate('/cart?buyNow=true');
  };

  // Toggle Shop Follow
  const handleFollowToggle = () => {
    if (!productShop) return;
    const isNewFollow = toggleFollowShop(productShop.name);
    setIsFollowingShop(isNewFollow);
    setShopFollowers(getShopFollowerCount(productShop.name));
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);

    if (!selectedProduct) return;
    if (!reviewComment.trim()) {
      setReviewError('กรุณากรอกข้อความแสดงความคิดเห็นค่ะ');
      return;
    }

    try {
      const res = await restfulApi.post<any>(`/api/products/${selectedProduct.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.error) {
        setReviewError(res.error);
      } else {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewerName('');
        setReviewRating(5);
        fetchReviews(selectedProduct.id); // Reload real reviews
        
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) {
      setReviewError('เกิดข้อผิดพลาดในการส่งรีวิวสินค้า');
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    const matchesMinPrice = minPrice === '' || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || product.price <= maxPrice;
    const matchesStock = !onlyInStock || product.stock > 0;
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name, 'th');
    } else if (sortBy === 'newest') {
      // Sort by newest based on id or default logic
      return b.id.localeCompare(a.id);
    }
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Intro Hero banner */}
      <div className="bg-gradient-to-r from-primary-600 to-sky-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <ShoppingCart className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" /> สิทธิประโยชน์สำหรับคุณในวันนี้
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            เลือกสินค้าสุขภาพดี สดใหม่ทุกวัน
          </h1>
          <p className="text-primary-50 text-[16px] sm:text-[18px] leading-relaxed">
            สินค้าทุกชิ้นผ่านการตรวจสอบความสะอาด ปลอดภัย คัดเกรดอย่างดีในราคาเป็นกันเอง พร้อมจัดส่งตรงถึงบ้านคุณ
          </p>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedItem && (
        <div className="fixed bottom-8 right-8 z-50 bg-success-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-success-500 animate-fade-in text-[17px] font-bold">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span>เพิ่ม "{addedItem}" ลงในตะกร้าสินค้าสำเร็จแล้ว!</span>
        </div>
      )}

      {/* Controls Bar (Search / Filters / Sort) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor="search" className="sr-only">ค้นหาสินค้า</label>
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </span>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า หรือรายละเอียดที่คุณต้องการ..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[16px] placeholder-slate-400 focus:bg-white focus:border-primary-500 transition-all focus:outline-none"
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
                <option value="name-asc">ชื่อสินค้า: ก - ฮ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvanceFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">ช่วงราคา (บาท)</label>
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
            </div>

            {/* Stock Availability Filter */}
            <div className="space-y-2 flex flex-col justify-end">
              <label className="inline-flex items-center cursor-pointer pb-2 select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 mr-3 border-2 border-slate-300"
                />
                <span className="text-[16px] font-bold text-slate-700">แสดงเฉพาะสินค้าที่มีอยู่ในสต็อก</span>
              </label>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end justify-end">
              {(minPrice !== '' || maxPrice !== '' || onlyInStock || searchTerm !== '' || selectedCategory !== 'ทั้งหมด') && (
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setOnlyInStock(false);
                    setSearchTerm('');
                    setSelectedCategory('ทั้งหมด');
                  }}
                  className="text-xs font-bold text-danger-600 hover:text-danger-700 border border-danger-200 hover:border-danger-300 bg-danger-50 px-4 py-2 rounded-xl transition-all"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          </div>
        )}

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-bold text-sm mr-1 flex items-center gap-1">
            <Filter className="w-4 h-4" /> หมวดหมู่สินค้า:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[15px] font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main product display */}
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
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบสินค้าที่ต้องการ</h3>
          <p className="text-slate-500 leading-relaxed">
            ลองใช้คำค้นหาอื่น หรือปรับเปลี่ยนการกรองดูนะคะ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            const ratingInfo = getAverageRating(product.id, product.category);
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow group relative"
              >
                {/* Clickable Area for Details */}
                <div 
                  className="cursor-pointer" 
                  onClick={() => handleOpenDetails(product)}
                >
                  {/* Product Image */}
                  <div className="relative pt-[70%] bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {outOfStock ? (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-danger-600 text-white font-extrabold px-4 py-2 rounded-xl text-sm tracking-wide">
                          สินค้าหมดชั่วคราว
                        </span>
                      </div>
                    ) : product.stock <= 5 ? (
                      <div className="absolute top-4 left-4 bg-warning-500 text-white font-bold px-3 py-1 rounded-lg text-xs">
                        เหลือแค่ {product.stock} ชิ้นเท่านั้น!
                      </div>
                    ) : null}
                    <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-semibold">
                      {product.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Rating star on list */}
                      <div className="flex items-center gap-1 text-amber-500 text-[13px] font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{ratingInfo.rating > 0 ? ratingInfo.rating : 'ไม่มีรีวิว'}</span>
                        <span className="text-slate-400 font-normal">({ratingInfo.totalReviews})</span>
                      </div>
                      
                      <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[14px] text-slate-500 line-clamp-2 leading-relaxed h-[42px]">
                        {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">ราคาต่อชิ้น</span>
                        <span className="text-2xl font-black text-slate-900">
                          {product.price.toLocaleString()} <span className="text-sm font-bold text-slate-500">บาท</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">สถานะคลัง</span>
                        <span className={`text-sm font-extrabold ${outOfStock ? 'text-danger-600' : 'text-success-600'}`}>
                          {outOfStock ? 'ของหมดแล้ว' : `มีสินค้าอยู่ ${product.stock} ชิ้น`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleAddToCart(product, 1)}
                    disabled={outOfStock}
                    className={`w-full py-3 px-4 font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 border transition-all ${
                      outOfStock
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600 shadow-md shadow-primary-50 hover:shadow-primary-100 min-h-[48px]'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{outOfStock ? 'ขออภัย สินค้าหมดแล้ว' : 'เพิ่มลงในตะกร้า'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Modal Box */}
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-scale-up max-h-[90vh] md:max-h-[85vh]">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseDetails}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors shadow-md focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Media Gallery + Shop Follow */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50 border-r border-slate-100 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-none">
              
              {/* Media Gallery */}
              <div className="space-y-4">
                {/* Main Preview */}
                <div className="relative aspect-video md:aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center">
                  {modalMedia.length > 0 && (
                    modalMedia[activeMediaIndex].type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          key={modalMedia[activeMediaIndex].url}
                          src={modalMedia[activeMediaIndex].url}
                          className="w-full h-full object-cover"
                          controls
                          autoPlay
                          muted={isVideoMuted}
                          playsInline
                        />
                        <button
                          onClick={() => setIsVideoMuted(!isVideoMuted)}
                          className="absolute bottom-4 right-14 w-9 h-9 bg-slate-900/70 text-white rounded-full flex items-center justify-center hover:bg-slate-900/90 transition-colors"
                        >
                          {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <img
                        src={modalMedia[activeMediaIndex].url}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    )
                  )}
                </div>

                {/* Thumbnails list */}
                <div className="flex gap-2.5 overflow-x-auto py-1">
                  {modalMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition-all ${
                        activeMediaIndex === idx ? 'border-primary-500 scale-[1.03] shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {media.type === 'video' ? (
                        <>
                          <video src={media.url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                            <Play className="w-6 h-6 fill-current" />
                          </div>
                        </>
                      ) : (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Follow widget */}
              {productShop && (
                <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={productShop.avatar} 
                      alt={productShop.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-[15px] text-slate-900 line-clamp-1">{productShop.name}</h4>
                      <p className="text-[12px] text-slate-400 font-bold">{productShop.category}</p>
                      
                      {/* Shop stats */}
                      <div className="flex items-center gap-2.5 mt-0.5 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-current" /> {productShop.rating}
                        </span>
                        <span>•</span>
                        <span>ผู้ติดตาม {shopFollowers.toLocaleString()} คน</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 border-2 select-none ${
                      isFollowingShop 
                        ? 'bg-success-50 border-success-200 text-success-700'
                        : 'bg-primary-600 border-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-50'
                    }`}
                  >
                    {isFollowingShop ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ติดตามแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5" />
                        <span>ติดตามร้าน</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Info, Cart Actions, Tabs (Detail/Reviews) */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-none">
              
              {/* Product Info Header */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                    {selectedProduct.name}
                  </h2>
                  
                  {/* Rating Summary Link */}
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex items-center gap-0.5 text-amber-500 text-sm font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{avgRatingInfo.rating > 0 ? avgRatingInfo.rating : 'ไม่มีรีวิว'}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      {avgRatingInfo.totalReviews} ความคิดเห็นจากผู้ซื้อ
                    </button>
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <div>
                    <span className="text-[12px] text-slate-400 font-bold block">ราคาขายปลีก</span>
                    <span className="text-3xl font-black text-slate-950">
                      {(selectedProduct.price + (selectedVariant?.priceAdjustment || 0)).toLocaleString()} <span className="text-[15px] font-extrabold text-slate-500">บาท / ชิ้น</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] text-slate-400 font-bold block">จำนวนคลังสินค้า</span>
                    <span className={`text-[16px] font-black ${selectedProduct.stock > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {selectedProduct.stock > 0 ? `มีพร้อมส่ง ${selectedProduct.stock} ชิ้น` : 'สินค้าหมดแล้ว'}
                    </span>
                  </div>
                </div>

                {/* SKU / Variant Selector */}
                {variants.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[14px] font-bold text-slate-700 block">เลือกตัวเลือกสินค้า:</span>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            selectedVariant?.name === v.name
                              ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {v.name} {v.priceAdjustment > 0 ? `(+${v.priceAdjustment} บาท)` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart with Quantity selector */}
                {selectedProduct.stock > 0 && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    {/* Qty Selector */}
                    <div className="flex items-center justify-between border-2 border-slate-200 rounded-2xl bg-white p-1">
                      <button
                        onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 flex items-center justify-center font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-lg"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        max={selectedProduct.stock}
                        value={detailQuantity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= selectedProduct.stock) {
                            setDetailQuantity(val);
                          }
                        }}
                        className="w-12 text-center font-bold text-slate-800 text-[17px] focus:outline-none bg-transparent"
                      />
                      <button
                        onClick={() => setDetailQuantity(prev => Math.min(selectedProduct.stock, prev + 1))}
                        className="w-10 h-10 flex items-center justify-center font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex-1 flex gap-2">
                      {/* Add to Cart button */}
                      <button
                        onClick={() => handleAddToCart(selectedProduct, detailQuantity, selectedVariant?.name, selectedVariant?.priceAdjustment || 0)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 border border-primary-600 shadow-md shadow-primary-50 transition-all text-[15px]"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>หยิบใส่ตะกร้า</span>
                      </button>

                      {/* Buy Now button */}
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 border border-orange-500 shadow-md shadow-orange-50 transition-all text-[15px]"
                      >
                        <span>ซื้อทันที</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Tabs Navigation */}
                <div className="border-b border-slate-200 flex gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 font-bold text-[15px] border-b-2 transition-colors relative ${
                      activeTab === 'details' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    รายละเอียดสินค้า
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 font-bold text-[15px] border-b-2 transition-colors relative ${
                      activeTab === 'reviews' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    รีวิวและคะแนน ({reviews.length})
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 pt-4 overflow-y-auto min-h-[160px] max-h-[30vh]">
                {activeTab === 'details' ? (
                  /* Details Tab */
                  <div className="space-y-4">
                    <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                      {selectedProduct.description || 'ไม่มีรายละเอียดเนื้อหาเพิ่มเติมสำหรับสินค้านี้'}
                    </p>
                    {productShop && (
                      <div className="bg-slate-100/60 p-4 rounded-2xl border border-slate-200/30 space-y-1">
                        <span className="text-xs font-bold text-slate-400 block uppercase">เกี่ยวกับร้านค้าผู้ขาย</span>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {productShop.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Reviews Tab */
                  <div className="space-y-6">
                    {/* Star Breakdown Summary */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="text-center sm:text-left space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">คะแนนความพึงพอใจ</span>
                        <span className="text-4xl font-black text-slate-900 block leading-none">{avgRatingInfo.rating}</span>
                        <div className="flex items-center justify-center sm:justify-start text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= Math.round(avgRatingInfo.rating) ? 'fill-current' : 'opacity-30'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">จากทั้งหมด {avgRatingInfo.totalReviews} รีวิว</span>
                      </div>

                      {/* Distribution graph */}
                      <div className="flex-1 max-w-[240px] w-full space-y-1">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = avgRatingInfo.distribution[stars] || 0;
                          const percent = avgRatingInfo.totalReviews > 0 ? (count / avgRatingInfo.totalReviews) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <span className="w-3 text-right">{stars}</span>
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                              <span className="w-5 text-right font-normal text-slate-400">({count})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Submission Form */}
                    <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-[14px] text-slate-800 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-primary-500" /> เขียนรีวิวผลิตภัณฑ์นี้
                      </h4>

                      {/* Interactive Stars Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500">ให้คะแนน:</span>
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none transition-transform active:scale-95"
                            >
                              <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'opacity-20'}`} />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg">
                          {reviewRating} ดาว
                        </span>
                      </div>

                      {/* Review Comment input */}
                      <div className="space-y-1">
                        <textarea
                          placeholder="เขียนความคิดเห็นของคุณเกี่ยวกับตัวสินค้านี้ เช่น คุณภาพ ความสดสะอาด การแพ็คสินค้า..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={2}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 placeholder-slate-400"
                        />
                      </div>

                      {/* Name input & Button row */}
                      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                        <input
                          type="text"
                          placeholder="ชื่อของคุณ (เช่น คุณสมชาย)"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                        />
                        <button
                          type="submit"
                          className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none"
                        >
                          ส่งคำวิจารณ์
                        </button>
                      </div>

                      {reviewError && (
                        <p className="text-xs font-bold text-danger-600">{reviewError}</p>
                      )}
                      {reviewSuccess && (
                        <p className="text-xs font-bold text-success-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> บันทึกและคำนวณคะแนนรีวิวของคุณสำเร็จแล้ว!
                        </p>
                      )}
                    </form>

                    {/* Reviews list */}
                    <div className="space-y-3 pt-2">
                      {reviews.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6 font-medium">ยังไม่มีรีวิวสำหรับสินค้านี้ มารีวิวคนแรกกันนะคะ!</p>
                      ) : (
                        reviews.map((review) => (
                          <div 
                            key={review.id} 
                            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5 hover:shadow-xs transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-extrabold text-sm text-slate-800">{review.reviewerName}</h5>
                                <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'opacity-25'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-400">{review.date}</span>
                            </div>
                            <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                              {review.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
