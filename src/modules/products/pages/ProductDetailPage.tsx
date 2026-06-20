import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restfulApi, Product, logVisitorVisit } from '../../../shared/services/api';
import { 
  Star, Heart, Volume2, VolumeX, 
  Play, Check, MapPin, Truck, ShieldCheck, Share2, ChevronRight, QrCode, ArrowLeft
} from 'lucide-react';
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

interface BackendReview {
  id: string | number;
  username?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal-like details state (now page details state)
  const [modalMedia, setModalMedia] = useState<ProductMedia[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  
  const [productShop, setProductShop] = useState<Shop | null>(null);
  const [isFollowingShop, setIsFollowingShop] = useState(false);
  const [shopFollowers, setShopFollowers] = useState(0);
  
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRatingInfo, setAvgRatingInfo] = useState({ rating: 4.8, totalReviews: 477, distribution: {} as Record<number, number> });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  // Sync follow state if changed elsewhere
  useEffect(() => {
    const handleFollowChange = () => {
      if (productShop) {
        setIsFollowingShop(isShopFollowed(productShop.name));
        setShopFollowers(getShopFollowerCount(productShop.name));
      }
    };
    window.addEventListener('follow-status-changed', handleFollowChange);
    return () => {
      window.removeEventListener('follow-status-changed', handleFollowChange);
    };
  }, [productShop]);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    
    const fetchProductAndDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch single product
        const response = await restfulApi.get<Product>(`/api/products/${id}`);
        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }
        
        const prod = response.data;
        if (!prod) {
          setError('ไม่พบข้อมูลสินค้านี้');
          setLoading(false);
          return;
        }

        setProduct(prod);
        setDetailQuantity(1);

        // Load media
        const media = getProductMedia(prod.id, prod.imageUrl, prod.category, prod.videoUrl);
        setModalMedia(media);
        setActiveMediaIndex(0);

        // Load shop
        const shop = getShopForProduct(prod.category);
        setProductShop(shop);
        setIsFollowingShop(isShopFollowed(shop.name));
        setShopFollowers(getShopFollowerCount(shop.name));

        // Load variants
        const vars = getVariantsForProduct(prod.category, prod.price);
        setVariants(vars);
        setSelectedVariant(vars[0] || null);

        // Load reviews
        await fetchReviews(prod.id);

        // Fetch all products for recommendations
        const allRes = await restfulApi.get<Product[]>('/api/products');
        if (allRes.data) {
          setAllProducts(allRes.data);
        }

        logVisitorVisit(window.location.pathname);
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงรายละเอียดสินค้าได้');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndDetails();
  }, [id]);

  const fetchReviews = async (productId: string) => {
    try {
      const res = await restfulApi.get<BackendReview[]>(`/api/products/${productId}/reviews`);
      if (res.data) {
        const list = res.data;
        setReviews(list.map((r: BackendReview) => ({
          id: String(r.id),
          reviewerName: r.username || 'ผู้ซื้อทั่วไป',
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่',
          helpfulCount: 0
        })));
        
        const total = list.length;
        const sum = list.reduce((s, r) => s + r.rating, 0);
        const avg = total > 0 ? Number((sum / total).toFixed(1)) : 0;
        
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        list.forEach((r: BackendReview) => {
          if (r.rating >= 1 && r.rating <= 5) {
            dist[r.rating]++;
          }
        });
        
        setAvgRatingInfo({
          rating: avg > 0 ? avg : 4.8,
          totalReviews: total > 0 ? total : 477,
          distribution: dist
        });
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || detailQuantity <= 0) return;
    if (detailQuantity > product.stock) {
      alert(`ขออภัย สามารถหยิบลงตะกร้าได้สูงสุด ${product.stock} ชิ้น (เนื่องจากสต็อกมีจำกัด)`);
      return;
    }

    try {
      const res = await restfulApi.post<unknown>('/api/cart', {
        productId: product.id,
        quantity: detailQuantity,
        variantName: selectedVariant?.name,
        priceAdjustment: selectedVariant?.priceAdjustment || 0
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      // Dispatch custom storage event to alert MainLayout immediately
      window.dispatchEvent(new Event('cart-updated'));

      // Show toast alert
      const displayName = product.name + (selectedVariant ? ` (${selectedVariant.name})` : '');
      setAddedItem(`${displayName} (${detailQuantity} ชิ้น)`);
      setTimeout(() => setAddedItem(null), 2500);
    } catch (e) {
      console.error('ไม่สามารถบันทึกข้อมูลตะกร้าได้', e);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await handleAddToCart();
    navigate('/cart');
  };

  const handleFollowToggle = () => {
    if (!productShop) return;
    toggleFollowShop(productShop.name);
    // Dispatch event to sync across page
    window.dispatchEvent(new Event('follow-status-changed'));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewerName.trim() || !reviewComment.trim()) {
      setReviewError('กรุณากรอกชื่อและเนื้อหาความคิดเห็นให้ครบถ้วน');
      return;
    }

    setReviewError(null);
    setReviewSuccess(false);

    try {
      const res = await restfulApi.post<unknown>(`/api/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        username: reviewerName
      });

      if (res.error) {
        setReviewError(res.error);
      } else {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewerName('');
        setReviewRating(5);
        fetchReviews(product.id);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch {
      setReviewError('เกิดข้อผิดพลาดในการส่งรีวิวสินค้า');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-sm">กำลังโหลดรายละเอียดสินค้า...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="text-red-500 font-bold text-lg">เกิดข้อผิดพลาด</div>
        <p className="text-slate-600 text-sm">{error || 'ไม่พบข้อมูลผลิตภัณฑ์ที่ต้องการ'}</p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  const discountPercent = Math.abs(product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3) % 45 + 15;
  const mockReviewsCount = Math.abs(product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 17) % 25000 + 120;

  return (
    <div className="space-y-6 font-['Inter',sans-serif] max-w-6xl mx-auto p-2 sm:p-4 md:p-6 animate-fade-in pb-16 relative overflow-hidden min-h-screen">
      {/* Floating Ambient Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-400/15 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-400/15 rounded-full filter blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-rose-400/15 rounded-full filter blur-[120px] pointer-events-none z-0" />
      
      {/* Toast Alert for Cart addition */}
      {addedItem && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700/50 backdrop-blur-xs animate-scale-up">
          <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">เพิ่ม {addedItem} ลงในตะกร้าสำเร็จ!</span>
        </div>
      )}

      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าสินค้า</span>
        </button>
        <div className="text-xs text-slate-400 font-semibold">
          หน้าแรก / แคตตาล็อก / {product.category} / <span className="text-slate-600 font-bold">{product.name}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-white/50 relative z-10">
        
        {/* Left Column: Media Gallery */}
        <div className="w-full lg:w-[45%] p-4 sm:p-6 bg-slate-50/50 backdrop-blur-xs border-r border-slate-100/80 flex flex-col justify-start">
          <div className="space-y-4 sticky top-6">
            {/* Main Preview */}
            <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center">
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
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )
              )}
            </div>

            {/* Thumbnails list */}
            <div className="flex gap-2 overflow-x-auto py-1 justify-center scrollbar-none">
              {modalMedia.map((media, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition-all ${
                    activeMediaIndex === idx ? 'border-primary-600 scale-[1.02] shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  {media.type === 'video' ? (
                    <>
                      <video src={media.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </>
                  ) : (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Tabs */}
        <div className="w-full lg:w-[55%] p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
          
          {/* Product Info Header */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                  {product.name}
                </h2>
                
                {/* Pre-order badge */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-[#e6f6ff] text-[#0088ff] text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    สั่งซื้อล่วงหน้า (เตรียมจัดส่งภายใน 30 วัน)
                  </span>
                </div>

                {/* Rating Summary & Star Row */}
                <div className="flex items-center gap-2 py-1 text-sm font-semibold text-slate-700">
                  <span className="text-primary-600 underline decoration-primary-600">{avgRatingInfo.rating > 0 ? avgRatingInfo.rating : '4.8'}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="underline decoration-slate-400 text-slate-500 hover:text-primary-600 font-normal text-xs"
                  >
                    {mockReviewsCount.toLocaleString()} เรตติ้ง
                  </button>
                </div>
              </div>

              {/* QR Code App Badge */}
              <div className="flex flex-col items-center border border-slate-200 rounded-sm p-1 flex-shrink-0 text-slate-400 select-none">
                <QrCode className="w-6 h-6" />
                <span className="text-[9px] mt-0.5 font-bold">App</span>
              </div>
            </div>

            {/* Price Bar Container */}
            <div className="p-4 bg-primary-50/70 backdrop-blur-xs rounded-2xl flex items-center gap-4 flex-wrap border border-white/50 shadow-sm">
              <span className="text-slate-400 line-through text-xs sm:text-sm font-medium">
                ฿{(product.price * 1.5).toFixed(0)}
              </span>
              <span className="text-3xl font-bold text-primary-600">
                ฿{(product.price + (selectedVariant?.priceAdjustment || 0)).toLocaleString()}
              </span>
              <span className="bg-primary-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">
                -{discountPercent}%
              </span>
            </div>

            {/* Shipping & Returns Details Grid */}
            <div className="text-xs text-slate-600 space-y-4 py-4 border-y border-slate-100">
              {/* Shipping */}
              <div className="flex gap-4">
                <span className="w-24 text-slate-400 font-semibold flex-shrink-0">ตัวเลือกการจัดส่ง :</span>
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">ปทุมวัน/ Pathum Wan ใน กรุงเทพมหานคร/ Bangkok, 10110 </span>
                      <button className="text-[#0088ff] font-bold hover:underline ml-1">เปลี่ยน</button>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Truck className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-800">รับภายใน 19-20 ค.ค.</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                      </div>
                      <p className="text-slate-400">แบบธรรมดา พร้อมค่าส่ง ฿29.00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Returns & Warranty */}
              <div className="flex gap-4">
                <span className="w-24 text-slate-400 font-semibold flex-shrink-0 leading-tight">การคืนสินค้าและการรับประกัน :</span>
                <div className="flex-1 flex items-center justify-between text-slate-800 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0088ff]" />
                    <span>เปลี่ยนใจ - คืนฟรีภายใน 7 วัน · ไม่มีการรับประกัน</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* SKU / Variant Selector */}
            {variants.length > 0 && (
              <div className="flex gap-4 py-2">
                <span className="w-24 text-slate-400 font-semibold flex-shrink-0 mt-1 leading-tight">ตัวเลือกสินค้า:</span>
                <div className="space-y-2 flex-1">
                  {selectedVariant && (
                    <div className="text-xs font-bold text-slate-800 mb-1">{selectedVariant.name}</div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const isSelected = selectedVariant?.name === v.name;
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-xs text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-white text-slate-800 ring-1 ring-primary-600'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <img src={product.imageUrl} alt="" className="w-5 h-5 object-cover rounded-xs border border-slate-100" />
                          <span>{v.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Buy controls */}
            {product.stock > 0 && (
              <div className="space-y-4 py-2">
                <div className="flex gap-4 items-center">
                  <span className="w-24 text-slate-400 font-semibold flex-shrink-0 text-xs">จำนวน:</span>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-between border border-slate-200 rounded-sm bg-white p-0.5">
                      <button
                        onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:bg-slate-50 transition-colors text-base"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        max={product.stock}
                        value={detailQuantity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= product.stock) {
                            setDetailQuantity(val);
                          }
                        }}
                        className="w-10 text-center font-semibold text-slate-700 text-[14px] focus:outline-none bg-transparent"
                      />
                      <button
                        onClick={() => setDetailQuantity(prev => Math.min(product.stock, prev + 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:bg-slate-50 transition-colors text-base"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">มีสินค้าทั้งหมด {product.stock} ชิ้น</span>
                  </div>
                </div>

                {/* Action buttons row */}
                <div className="flex items-stretch gap-3 max-w-lg">
                  <div className="w-24 flex-shrink-0 hidden sm:block" />
                  <div className="flex-1 flex gap-3 items-stretch">
                    {/* Buy Now button */}
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold py-2.5 px-4 rounded-xl hover:-translate-y-[2px] active:translate-y-0 transition-all text-sm text-center shadow-xs"
                    >
                      ซื้อเลย
                    </button>

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart()}
                      className="flex-1 bg-gradient-to-r from-[#f43f5e] to-[#ff6b6b] hover:from-[#e11d48] hover:to-[#ff5252] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-lg hover:shadow-primary-600/25 transition-all text-sm whitespace-nowrap"
                    >
                      <span>เพิ่มลงในรถเข็น</span>
                    </button>

                    {/* Share & Like icons */}
                    <div className="flex items-center gap-4 pl-4 border-l border-slate-200 flex-shrink-0">
                      <button className="flex flex-col items-center text-slate-400 hover:text-primary-600 transition-colors" title="Share">
                        <Share2 className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5 font-semibold text-slate-400">Share</span>
                      </button>
                      <button 
                        onClick={handleFollowToggle}
                        className={`flex flex-col items-center transition-colors ${isFollowingShop ? 'text-primary-600' : 'text-slate-400 hover:text-primary-600'}`}
                        title="Like"
                      >
                        <Heart className={`w-5 h-5 ${isFollowingShop ? 'fill-current' : ''}`} />
                        <span className="text-[10px] mt-0.5 font-semibold text-slate-400">Like</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Card */}
            {productShop && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={productShop.avatar} 
                    alt={productShop.name} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-[15px] text-slate-900 line-clamp-1">{productShop.name}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded-sm font-black">ร้านค้าแนะนำ</span>
                      <span className="text-[10px] text-slate-500 font-bold border border-slate-200 px-1 rounded-sm">สินค้าใหม่</span>
                      <span className="text-[10px] text-primary-600 font-bold">คะแนนร้านค้า 95%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">ตอบกลับเร็ว: เฉลี่ย 2 นาที | ผู้ติดตาม {shopFollowers.toLocaleString()} คน</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/profile?tab=chat`)}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-sm hover:bg-slate-50"
                  >
                    แชท
                  </button>
                  <button 
                    onClick={handleFollowToggle}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-sm hover:bg-slate-50"
                  >
                    ไปที่ร้านค้า
                  </button>
                </div>
              </div>
            )}

            {/* Sponsored Products Section */}
            <div className="pt-6 mt-6 border-t border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-700 mb-4 uppercase tracking-wider">สินค้าที่ได้รับการสนับสนุน (สินค้าแนะนำ)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allProducts
                  .filter(p => p.id !== product.id)
                  .slice(0, 4)
                  .map((p) => {
                    const discount = Math.abs(p.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3) % 45 + 15;
                    const rating = getAverageRating(p.id, p.category);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => {
                          navigate(`/products/${p.id}`);
                        }}
                        className="bg-white rounded-lg border border-slate-100 shadow-xs overflow-hidden flex flex-col hover:shadow-md cursor-pointer transition-all duration-200"
                      >
                        <div className="relative pt-[100%] bg-slate-50 border-b border-slate-50">
                          <img src={p.imageUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                          <span className="absolute top-1 right-1 bg-slate-900/60 text-white px-1 py-0.5 rounded-xs text-[9px]">
                            {p.category}
                          </span>
                        </div>
                        <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                          <h5 className="font-semibold text-slate-800 text-[11px] line-clamp-2 min-h-[30px]">{p.name}</h5>
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between flex-wrap">
                              <span className="text-[12px] font-bold text-primary-600">฿{p.price.toLocaleString()}</span>
                              <span className="text-[9px] text-primary-600 bg-primary-600/10 px-0.5 rounded-xs font-bold">-{discount}%</span>
                            </div>
                            <div className="flex items-center text-amber-400 text-[10px]">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span className="text-slate-400 ml-1">({rating.totalReviews > 0 ? rating.totalReviews : 47})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Content Tabs Navigation */}
            <div className="border-b border-slate-200 flex gap-4 pt-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 font-bold text-[14px] border-b-2 transition-colors relative ${
                  activeTab === 'details' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                รายละเอียดสินค้า
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 font-bold text-[14px] border-b-2 transition-colors relative ${
                  activeTab === 'reviews' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                รีวิวและคะแนน ({reviews.length})
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 pt-4 min-h-[160px]">
            {activeTab === 'details' ? (
              <div className="space-y-4">
                <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                  {product.description || 'ไม่มีรายละเอียดเนื้อหาเพิ่มเติมสำหรับสินค้านี้'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Star Breakdown Summary */}
                <div className="bg-primary-50/80 backdrop-blur-xs p-4 rounded-2xl border border-white/50 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
                  <div className="text-center sm:text-left space-y-1">
                    <span className="text-xs font-bold text-slate-400 block">คะแนนความพึงพอใจ</span>
                    <span className="text-4xl font-black text-slate-900 block leading-none">{avgRatingInfo.rating > 0 ? avgRatingInfo.rating : '4.8'}</span>
                    <div className="flex items-center justify-center sm:justify-start text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= Math.round(avgRatingInfo.rating) ? 'fill-current' : 'opacity-30'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">จากทั้งหมด {mockReviewsCount.toLocaleString()} รีวิว</span>
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
                            <div className="bg-primary-600 h-full rounded-full" style={{ width: `${percent > 0 ? percent : stars === 5 ? 85 : stars === 4 ? 10 : 2}%` }}></div>
                          </div>
                          <span className="w-5 text-right font-normal text-slate-400">({count > 0 ? count : stars === 5 ? Math.round(mockReviewsCount * 0.85) : Math.round(mockReviewsCount * 0.1)})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Submission Form */}
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-extrabold text-[14px] text-slate-800 flex items-center gap-1">
                    เขียนรีวิวผลิตภัณฑ์นี้
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
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-2.5"
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
  );
};
