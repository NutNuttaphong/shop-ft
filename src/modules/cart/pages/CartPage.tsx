import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ArrowLeft, HeartHandshake } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
  category: string;
}

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('app_cart') || '[]');
      setCartItems(items);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = (id: string, amount: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + amount;
        // Limit nextQty to stock and min 1
        if (nextQty > item.stock) {
          alert(`ขออภัยค่ะ มีสินค้าอยู่ในคลังจำกัดเพียง ${item.stock} ชิ้น`);
          return item;
        }
        if (nextQty < 1) return item;
        return { ...item, quantity: nextQty };
      }
      return item;
    });

    setCartItems(updated);
    localStorage.setItem('app_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('app_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsSubmitting(true);
    // Simulate server POST checkout request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Deduct stock in our simulated localStorage DB
    try {
      const dbStr = localStorage.getItem('app_products') || '[]';
      const products = JSON.parse(dbStr);
      
      const updatedProducts = products.map((prod: any) => {
        const cartMatch = cartItems.find(item => item.id === prod.id);
        if (cartMatch) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartMatch.quantity)
          };
        }
        return prod;
      });
      
      localStorage.setItem('app_products', JSON.stringify(updatedProducts));
    } catch (e) {
      console.error(e);
    }

    // Clear cart
    localStorage.setItem('app_cart', '[]');
    setCartItems([]);
    window.dispatchEvent(new Event('cart-updated'));
    
    setIsSubmitting(false);
    setCheckoutSuccess(true);
  };

  const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (checkoutSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-6 font-['Inter',sans-serif] animate-fade-in mt-10">
        <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto text-success-600 border border-success-100">
          <HeartHandshake className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">สั่งซื้อสินค้าเสร็จสิ้นแล้ว!</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed max-w-md mx-auto">
            ทางระบบได้รับข้อมูลการสั่งซื้อของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะจัดเตรียมสินค้าและโทรติดต่อก่อนทำการจัดส่งภายใน 2-3 วันทำการค่ะ
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => {
              setCheckoutSuccess(false);
              navigate('/products');
            }}
            className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-md shadow-primary-50 min-h-[48px]"
          >
            กลับไปที่หน้าร้านค้า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900">ตะกร้าสินค้าของฉัน</h1>
          <p className="text-slate-500 text-[16px]">ตรวจสอบรายการสินค้าที่คุณเลือกซื้อและยืนยันการทำรายการ</p>
        </div>
        
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-primary-600 font-bold hover:underline py-2 text-[17px]"
        >
          <ArrowLeft className="w-5 h-5" /> ย้อนกลับหน้าร้าน
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ตะกร้าสินค้าของคุณว่างเปล่า</h3>
          <p className="text-slate-500 mb-6 text-[16px]">
            คุณยังไม่ได้เลือกเพิ่มสินค้าใดๆ ลงในตะกร้าสินค้าเลยค่ะ
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-md"
          >
            เลือกซื้อสินค้าตอนนี้
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Info block */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[18px] text-slate-900 leading-snug">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold mb-1">{item.category}</p>
                    <span className="text-primary-600 font-extrabold text-[16px]">
                      ราคา {item.price.toLocaleString()} บาท / ชิ้น
                    </span>
                  </div>
                </div>

                {/* Interactive Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  
                  {/* Quantity selector */}
                  <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-10 h-10 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-600 rounded-xl flex items-center justify-center border border-slate-200 shadow-xs focus:ring-2 focus:ring-primary-300"
                      title="ลดจำนวน"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-black text-lg text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200 shadow-xs focus:ring-2 focus:ring-primary-300"
                      title="เพิ่มจำนวน"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtotal info & Delete */}
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-[13px] text-slate-400 block font-bold">ราคารวม</span>
                      <span className="font-black text-lg text-slate-900">
                        {(item.price * item.quantity).toLocaleString()} บาท
                      </span>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-all"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Cart Summary Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit space-y-6">
            <h2 className="font-extrabold text-xl text-slate-900 pb-3 border-b border-slate-100">
              สรุปคำสั่งซื้อ
            </h2>

            <div className="space-y-4 text-[16px]">
              <div className="flex justify-between text-slate-500">
                <span>จำนวนสินค้าทั้งหมด</span>
                <span className="font-bold text-slate-800">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>ค่าจัดส่งสินค้า</span>
                <span className="font-bold text-success-600">จัดส่งฟรี (โปรโมชั่น)</span>
              </div>
              
              <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-baseline">
                <span className="text-lg font-bold text-slate-900">ยอดเงินรวมทั้งสิ้น</span>
                <span className="text-3xl font-black text-primary-600">
                  {grandTotal.toLocaleString()} <span className="text-sm font-bold text-slate-500">บาท</span>
                </span>
              </div>
            </div>

            {/* Simulated Payment Warning/Guide */}
            <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-primary-700 block">การชำระเงิน</span>
              <p className="text-[14px] text-primary-900 leading-relaxed">
                ระบบเก็บเงินปลายทาง (Cash on Delivery) คุณลูกค้าสามารถชำระค่าสินค้ากับเจ้าหน้าที่เมื่อสินค้าส่งถึงมือค่ะ
              </p>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-[18px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-50 transition-all min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังทำรายการสั่งซื้อ...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>ยืนยันการสั่งซื้อสินค้า</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
