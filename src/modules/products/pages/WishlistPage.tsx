import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useWishlist } from '../../../shared/hooks/useWishlist';
import { restfulApi, Product } from '../../../shared/services/api';
import { useAuth } from '../../auth/hooks/useAuth';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      if (confirm('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า\nต้องการเข้าสู่ระบบตอนนี้หรือไม่?')) {
        navigate('/login', { state: { from: { pathname: '/wishlist' } } });
      }
      return;
    }

    if (product.stock <= 0) {
      alert('ขออภัย สินค้านี้หมดชั่วคราว');
      return;
    }

    setAddingId(product.id);
    try {
      const res = await restfulApi.post<unknown>('/api/cart', {
        productId: product.id,
        quantity: 1,
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      window.dispatchEvent(new Event('cart-updated'));
      setSuccessToast(`เพิ่ม "${product.name}" ลงในตะกร้าเรียบร้อยแล้ว`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error('Failed to add wishlist item to cart', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Notification Toast */}
      {successToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              <span>สินค้าที่ถูกใจของฉัน</span>
              <span className="text-sm font-extrabold px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                {wishlistCount} รายการ
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              รายการสินค้าที่คุณบันทึกไว้ สามารถเลือกสั่งซื้อหรือย้ายลงตะกร้าได้ทันที
            </p>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-sm rounded-2xl transition-colors self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>เลือกดูสินค้าเพิ่มเติม</span>
        </Link>
      </div>

      {/* Wishlist Grid or Empty State */}
      {wishlistCount === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">ยังไม่มีสินค้าที่ถูกใจ</h3>
          <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
            คุณสามารถกดไอคอนรูปหัวใจที่มุมของสินค้าเพื่อบันทึกสินค้าที่คุณสนใจไว้ดูภายหลังได้
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-200 transition-all active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ไปเลือกดูสินค้า</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((product) => {
            const outOfStock = product.stock <= 0;
            const isAdding = addingId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
              >
                {/* Image and Badges */}
                <div className="relative pt-[100%] bg-slate-50 border-b border-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {outOfStock && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-danger-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs tracking-wide">
                        สินค้าหมดชั่วคราว
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                    title="ลบออกจากรายการถูกใจ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-slate-900/70 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-xs">
                    {product.category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors leading-relaxed">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-lg font-black text-primary-600">
                        ฿{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    type="button"
                    disabled={outOfStock || isAdding}
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      outOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200 active:scale-98'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isAdding ? 'กำลังเพิ่ม...' : outOfStock ? 'สินค้าหมด' : 'ย้ายลงตะกร้า'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
