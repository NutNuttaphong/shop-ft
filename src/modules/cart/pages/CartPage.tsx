import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ArrowLeft, HeartHandshake, MapPin, User, Phone, Truck, QrCode, AlertCircle, CheckCircle2, Printer } from 'lucide-react';
import Bill from './Bill';
import { useAuth } from '../../auth/hooks/useAuth';

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
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('cod');
  const [showQrModal, setShowQrModal] = useState(false);
  const [uploadedSlipName, setUploadedSlipName] = useState('');
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  useEffect(() => {
    if (user && user.displayName) {
      const cleanName = user.displayName.replace(/\s*\(ลูกค้า\)\s*/g, '');
      setCustomerName(cleanName);
    }
  }, [user]);

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

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!customerName.trim()) {
      errors.name = 'กรุณาระบุชื่อ-นามสกุล';
    }
    const phoneRegex = /^0[689]\d{8}$/;
    if (!customerPhone.trim()) {
      errors.phone = 'กรุณาระบุเบอร์โทรศัพท์';
    } else if (!phoneRegex.test(customerPhone.replace(/[-\s]/g, ''))) {
      errors.phone = 'กรุณาระบุเบอร์โทรศัพท์มือถือที่ถูกต้อง (เช่น 0812345678)';
    }
    if (!customerAddress.trim()) {
      errors.address = 'กรุณาระบุที่อยู่จัดส่งสำหรับจัดส่งสินค้า';
    } else if (customerAddress.trim().length < 15) {
      errors.address = 'กรุณาระบุที่อยู่จัดส่งอย่างละเอียดเพื่อให้ส่งสินค้าได้ถูกต้อง';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedCheckout = () => {
    if (!validateForm()) {
      alert('กรุณากรอกข้อมูลจัดส่งให้ครบถ้วนและถูกต้องก่อนทำรายการค่ะ');
      return;
    }
    if (paymentMethod === 'qr') {
      setShowQrModal(true);
    } else {
      handleCheckout();
    }
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

    // Save order details to localStorage for the receipt component (Bill.tsx)
    const orderNo = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderData = {
      orderNo,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: grandTotal,
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      },
      paymentMethod,
      slipUploaded: paymentMethod === 'qr' && !!uploadedSlipName,
      slipName: uploadedSlipName || null
    };
    localStorage.setItem('app_last_order', JSON.stringify(orderData));

    // Save to order history list
    try {
      const existingOrders = JSON.parse(localStorage.getItem('app_orders') || '[]');
      const updatedOrders = [orderData, ...existingOrders];
      localStorage.setItem('app_orders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error('Failed to save to order history', e);
    }

    // Clear cart
    localStorage.setItem('app_cart', '[]');
    setCartItems([]);
    window.dispatchEvent(new Event('cart-updated'));
    
    setIsSubmitting(false);
    setCheckoutSuccess(true);
    setShowQrModal(false);
  };

  const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (checkoutSuccess) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 font-['Inter',sans-serif] animate-fade-in mt-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-4 print:hidden">
          <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto text-success-600 border border-success-100">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">สั่งซื้อสินค้าเสร็จสิ้นแล้ว!</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed max-w-md mx-auto">
              ทางระบบได้รับข้อมูลการสั่งซื้อของคุณเรียบร้อยแล้ว ใบเสร็จ/ใบสั่งซื้อของคุณออกแล้วตามรายละเอียดด้านล่างค่ะ
            </p>
          </div>
        </div>

        {/* Display Receipt */}
        <Bill />

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 border border-slate-200 min-h-[48px]"
          >
            <Printer className="w-5 h-5" />
            พิมพ์ใบเสร็จ (Print)
          </button>
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

            {/* Customer Shipping Details & Payment Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="font-extrabold text-xl text-slate-900">
                  ข้อมูลการจัดส่งและช่องทางการชำระเงิน
                </h2>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 block">
                    ชื่อ-นามสกุล ผู้รับ <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="เช่น สมชาย รักดี"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${formErrors.name ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:ring-primary-200'} rounded-2xl text-[16px] focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs font-bold text-danger-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 block">
                    เบอร์โทรศัพท์มือถือ <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="เช่น 0812345678"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${formErrors.phone ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:ring-primary-200'} rounded-2xl text-[16px] focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs font-bold text-danger-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 block">
                    ที่อยู่สำหรับจัดส่งสินค้าอย่างละเอียด <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุ บ้านเลขที่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด และรหัสไปรษณีย์"
                    value={customerAddress}
                    onChange={(e) => {
                      setCustomerAddress(e.target.value);
                      if (formErrors.address) setFormErrors(prev => ({ ...prev, address: undefined }));
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.address ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:ring-primary-200'} rounded-2xl text-[16px] focus:outline-none focus:ring-4 focus:bg-white transition-all resize-none`}
                  />
                  {formErrors.address && (
                    <p className="text-xs font-bold text-danger-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment selection */}
              <div className="space-y-3">
                <label className="text-[14px] font-bold text-slate-700 block">
                  ช่องทางการชำระเงิน <span className="text-danger-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD Option */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cod' ? 'border-primary-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-[16px] text-slate-900">
                        <Truck className="w-4 h-4 text-primary-600" />
                        <span>ชำระเงินปลายทาง (COD)</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal font-medium">
                        ชำระค่าสินค้าด้วยเงินสดหรือโอนให้กับพนักงานขนส่งเมื่อของถึงมือ
                      </p>
                    </div>
                  </label>

                  {/* QR Option */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'qr'
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={() => setPaymentMethod('qr')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'qr' ? 'border-primary-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'qr' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-[16px] text-slate-900">
                        <QrCode className="w-4 h-4 text-primary-600" />
                        <span>ชำระผ่าน QR Code</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal font-medium">
                        สแกน PromptPay QR Code เพื่อชำระเงินผ่านแอปธนาคารได้ทันที
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit space-y-6 animate-fade-in">
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
              <span className="text-xs font-extrabold uppercase tracking-wide text-primary-700 block">
                {paymentMethod === 'cod' ? 'การเก็บเงินปลายทาง' : 'การชำระเงินผ่าน QR Code'}
              </span>
              <p className="text-[14px] text-primary-900 leading-relaxed font-semibold">
                {paymentMethod === 'cod' 
                  ? 'คุณลูกค้าจะชำระค่าสินค้าจำนวนเงินสดหรือโอนให้กับพนักงานขนส่งเมื่อสินค้าส่งถึงมือค่ะ' 
                  : 'กรุณาแสกน QR Code และทำการแนบสลิปเพื่อยืนยันรายการสั่งซื้อสินค้าของท่านค่ะ'}
              </p>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedCheckout}
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

      {/* QR Code Payment Simulation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-scale-up border border-slate-100 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary-600" />
                ชำระเงินผ่าน QR Code / PromptPay
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ยอดชำระเงินที่ต้องสแกน</span>
                <div className="text-3xl font-black text-primary-600">
                  {grandTotal.toLocaleString()} <span className="text-lg font-bold text-slate-500">บาท</span>
                </div>
              </div>

              {/* PromptPay SVG QR */}
              <svg viewBox="0 0 320 400" className="w-64 h-80 mx-auto shadow-md rounded-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <rect width="320" height="70" fill="#003566" />
                <text x="160" y="32" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  THAI QR PAYMENT
                </text>
                <text x="160" y="52" fill="#00E5FF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  PROMPTPAY
                </text>
                
                {/* Body */}
                <rect x="0" y="70" width="320" height="330" fill="#ffffff" />
                
                {/* QR Code Container Box */}
                <rect x="35" y="95" width="250" height="250" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                
                {/* QR Code pixels representation */}
                <g fill="#0f172a">
                  {/* Top-Left Finder */}
                  <rect x="55" y="115" width="40" height="40" rx="4" />
                  <rect x="63" y="123" width="24" height="24" rx="2" fill="#ffffff" />
                  <rect x="69" y="129" width="12" height="12" rx="1" />
                  
                  {/* Top-Right Finder */}
                  <rect x="225" y="115" width="40" height="40" rx="4" />
                  <rect x="233" y="123" width="24" height="24" rx="2" fill="#ffffff" />
                  <rect x="239" y="129" width="12" height="12" rx="1" />

                  {/* Bottom-Left Finder */}
                  <rect x="55" y="285" width="40" height="40" rx="4" />
                  <rect x="63" y="293" width="24" height="24" rx="2" fill="#ffffff" />
                  <rect x="69" y="299" width="12" height="12" rx="1" />
                  
                  {/* Alignment */}
                  <rect x="225" y="285" width="40" height="40" rx="4" />
                  <rect x="233" y="293" width="24" height="24" rx="2" fill="#ffffff" />
                  <rect x="239" y="299" width="12" height="12" rx="1" />
                  
                  {/* QR details */}
                  <rect x="105" y="115" width="10" height="10" />
                  <rect x="125" y="115" width="20" height="10" />
                  <rect x="155" y="115" width="10" height="20" />
                  <rect x="180" y="115" width="30" height="10" />
                  
                  <rect x="105" y="135" width="30" height="10" />
                  <rect x="145" y="135" width="10" height="10" />
                  <rect x="165" y="135" width="20" height="10" />
                  <rect x="195" y="135" width="15" height="20" />
                  
                  <rect x="105" y="155" width="10" height="30" />
                  <rect x="125" y="155" width="20" height="10" />
                  <rect x="155" y="155" width="30" height="10" />
                  <rect x="195" y="155" width="10" height="10" />
                  <rect x="215" y="155" width="10" height="30" />
                  <rect x="235" y="165" width="30" height="10" />
                  <rect x="245" y="185" width="20" height="20" />

                  <rect x="55" y="165" width="20" height="10" />
                  <rect x="85" y="165" width="10" height="30" />
                  
                  <rect x="55" y="185" width="10" height="20" />
                  <rect x="75" y="185" width="20" height="10" />
                  <rect x="105" y="195" width="30" height="10" />
                  <rect x="145" y="185" width="10" height="20" />
                  <rect x="165" y="185" width="40" height="10" />
                  <rect x="215" y="195" width="20" height="10" />

                  {/* Logo Center Card */}
                  <rect x="135" y="195" width="50" height="50" rx="8" fill="#003566" />
                  <circle cx="160" cy="220" r="14" fill="#ffffff" />
                  <circle cx="154" cy="220" r="6" fill="#003566" opacity="0.8" />
                  <circle cx="166" cy="220" r="6" fill="#00E5FF" opacity="0.8" />
                  
                  <rect x="55" y="215" width="10" height="10" />
                  <rect x="75" y="215" width="20" height="20" />
                  <rect x="105" y="215" width="10" height="10" />
                  <rect x="120" y="215" width="10" height="30" />
                  <rect x="195" y="215" width="30" height="10" />
                  <rect x="235" y="215" width="10" height="20" />
                  <rect x="255" y="215" width="20" height="10" />
                  
                  <rect x="55" y="245" width="30" height="10" />
                  <rect x="95" y="235" width="15" height="20" />
                  <rect x="195" y="235" width="10" height="25" />
                  <rect x="215" y="235" width="20" height="10" />
                  <rect x="245" y="245" width="10" height="30" />

                  <rect x="105" y="265" width="20" height="10" />
                  <rect x="135" y="265" width="10" height="10" />
                  <rect x="155" y="255" width="30" height="10" />
                  <rect x="195" y="265" width="15" height="10" />
                  <rect x="220" y="255" width="10" height="25" />
                  
                  <rect x="105" y="285" width="10" height="30" />
                  <rect x="125" y="285" width="30" height="10" />
                  <rect x="165" y="285" width="10" height="10" />
                  <rect x="185" y="285" width="30" height="20" />
                  
                  <rect x="125" y="305" width="10" height="20" />
                  <rect x="145" y="305" width="30" height="10" />
                  
                  <rect x="105" y="325" width="40" height="10" />
                  <rect x="155" y="325" width="10" height="10" />
                  <rect x="175" y="315" width="20" height="20" />
                  <rect x="205" y="315" width="30" height="10" />
                  <rect x="245" y="315" width="15" height="20" />
                </g>
                <text x="160" y="365" fill="#1e293b" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  ชื่อบัญชี: บจก. ช้อปออนไลน์ (Shop Online Co., Ltd.)
                </text>
                <text x="160" y="382" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="sans-serif">
                  สแกนเพื่อชำระเงินจำนวน {grandTotal.toLocaleString()} บาท
                </text>
              </svg>

              {/* Slip attachment */}
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-slate-700 block">
                  แนบหลักฐานการโอนเงิน (สลิป) <span className="text-danger-500">*</span>
                </label>
                
                <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50 rounded-2xl p-4 transition-all text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedSlipName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedSlipName ? (
                    <div className="space-y-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto border border-success-100">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-700 truncate max-w-xs mx-auto">
                          {uploadedSlipName}
                        </p>
                        <p className="text-xs text-success-600 font-bold">
                          แนบไฟล์สลิปเรียบร้อยแล้ว
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2 text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-700">
                          คลิกหรือเลือกไฟล์รูปภาพเพื่อแนบสลิป
                        </p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors min-h-[48px]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!uploadedSlipName || isSubmitting}
                onClick={handleCheckout}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:bg-primary-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-50 transition-all min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังประมวลผล...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ฉันชำระเงินเรียบร้อยแล้ว</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
