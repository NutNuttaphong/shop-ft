import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  User, Phone, MapPin, CheckCircle2, ArrowLeft, Save, 
  AlertCircle, ShieldAlert, Heart, Star, ShoppingBag,
  Plus, Home, Building2, Tag, Check, Edit3, Trash2
} from 'lucide-react';
import { getFollowedShops, toggleFollowShop, Shop } from '../../products/utils/mockData';
import { getSavedAddresses, saveAddress, deleteAddress, setDefaultAddress, DeliveryAddress } from '../../../shared/utils/addressBook';
import { AddressModal } from '../../../shared/components/ui/AddressModal';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [followedShops, setFollowedShops] = useState<Shop[]>([]);

  const loadFollowedShops = () => {
    setFollowedShops(getFollowedShops());
  };

  useEffect(() => {
    loadFollowedShops();
    window.addEventListener('follow-status-changed', loadFollowedShops);
    return () => {
      window.removeEventListener('follow-status-changed', loadFollowedShops);
    };
  }, []);

  const handleUnfollow = (shopName: string) => {
    toggleFollowShop(shopName);
    loadFollowedShops();
  };

  const getProductCategoryForShop = (shopName: string): string => {
    if (shopName.includes('สบายดีบีฟ')) return 'อาหารสด';
    if (shopName.includes('โชห่วย')) return 'อาหารแห้งและเครื่องปรุง';
    if (shopName.includes('สาขาใหญ่')) return 'เครื่องดื่ม';
    if (shopName.includes('ลุงสมศักดิ์')) return 'อาหารสด';
    if (shopName.includes('เจ๊อรวรรณ')) return 'อาหารสด';
    return 'ทั้งหมด';
  };

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Address Book state
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);

  // Load saved addresses
  const loadAddresses = useCallback(() => {
    if (user) {
      const list = getSavedAddresses(user.username, {
        name: user.displayName,
        phone: user.phone,
        address: user.address
      });
      setAddresses(list);
    }
  }, [user]);

  useEffect(() => {
    loadAddresses();
    window.addEventListener('addresses-updated', loadAddresses);
    return () => window.removeEventListener('addresses-updated', loadAddresses);
  }, [loadAddresses]);

  const handleSaveAddress = (addrData: {
    id?: string;
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    isDefault?: boolean;
  }) => {
    if (!user) return;
    const updated = saveAddress(addrData, user.username);
    setAddresses(updated);
    // If it was default, sync with profile address field
    const def = updated.find(a => a.isDefault);
    if (def) {
      setAddress(def.addressLine);
      updateProfile(displayName.trim(), def.phone || phone.trim(), def.addressLine);
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (!user) return;
    const updated = deleteAddress(id, user.username);
    setAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    if (!user) return;
    const updated = setDefaultAddress(id, user.username);
    setAddresses(updated);
    const def = updated.find(a => a.id === id);
    if (def) {
      setAddress(def.addressLine);
      updateProfile(displayName.trim(), def.phone || phone.trim(), def.addressLine);
    }
  };

  const [formErrors, setFormErrors] = useState<{
    displayName?: string;
    phone?: string;
    address?: string;
  }>({});

  // Initialize fields
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!displayName.trim()) {
      errors.displayName = 'กรุณาระบุชื่อ-นามสกุล';
    }
    
    if (phone.trim()) {
      const phoneRegex = /^0[689]\d{8}$/;
      if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
        errors.phone = 'กรุณาระบุเบอร์โทรศัพท์มือถือที่ถูกต้อง (เช่น 0812345678)';
      }
    }
    
    if (address.trim() && address.trim().length < 15) {
      errors.address = 'กรุณาระบุที่อยู่จัดส่งอย่างละเอียดเพื่อให้ข้อมูลจัดส่งถูกต้อง';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateProfile(displayName.trim(), phone.trim(), address.trim());
    setIsSaving(false);
    setShowToast(true);
    
    // Auto-hide success toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-3xl border border-slate-200 shadow-lg text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-danger-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">เข้าสู่ระบบเพื่อแก้ไขโปรไฟล์</h3>
        <p className="text-slate-500 text-sm">กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้ของคุณก่อนเข้าถึงหน้านี้ค่ะ</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl w-full"
        >
          ไปยังหน้าเข้าสู่ระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-['Inter',sans-serif] relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-success-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>บันทึกข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-8 h-8 text-primary-600" />
            ข้อมูลส่วนตัวของฉัน
          </h1>
          <p className="text-slate-500 text-[16px]">
            แก้ไขข้อมูลโปรไฟล์ เบอร์โทรศัพท์ และที่อยู่เริ่มต้นเพื่อความสะดวกในการจัดสั่งสินค้า
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-primary-600 font-bold hover:underline py-2 text-[16px]"
        >
          <ArrowLeft className="w-5 h-5" /> ย้อนกลับ
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Banner Card Decor */}
        <div className="h-32 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-4 border-white shadow-md">
              <User className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-8 pt-14 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Username (Read Only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 block">
                ชื่อผู้ใช้งานในระบบ (Username)
              </label>
              <input
                type="text"
                disabled
                value={user.username}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[16px] cursor-not-allowed font-semibold"
              />
            </div>

            {/* Role (Read Only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 block">
                สิทธิ์การใช้งาน (User Role)
              </label>
              <div className="h-[46px] flex items-center px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                  user.role === 'admin' 
                    ? 'bg-danger-50 text-danger-700 border-danger-100'
                    : 'bg-primary-50 text-primary-700 border-primary-100'
                }`}>
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ลูกค้าทั่วไป (Customer)'}
                </span>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[14px] font-bold text-slate-700 block">
                ชื่อ-นามสกุล จริง <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="เช่น สมชาย รักดี"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (formErrors.displayName) setFormErrors(prev => ({ ...prev, displayName: undefined }));
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${formErrors.displayName ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:ring-primary-200'} rounded-2xl text-[16px] focus:outline-none focus:ring-4 focus:bg-white transition-all text-slate-800`}
                />
              </div>
              {formErrors.displayName && (
                <p className="text-xs font-bold text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.displayName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[14px] font-bold text-slate-700 block">
                เบอร์โทรศัพท์มือถือ (สำหรับติดต่อส่งของ)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="เช่น 0812345678 (ระบบจะกรอกข้อมูลนี้ลงช่องสั่งซื้อให้อัตโนมัติ)"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${formErrors.phone ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:ring-primary-200'} rounded-2xl text-[16px] focus:outline-none focus:ring-4 focus:bg-white transition-all text-slate-800`}
                />
              </div>
              {formErrors.phone && (
                <p className="text-xs font-bold text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[14px] font-bold text-slate-700 block">
                ที่อยู่จัดส่งสินค้าหลัก
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
                <textarea
                  rows={4}
                  placeholder="เช่น บ้านเลขที่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด และรหัสไปรษณีย์ (ระบบจะกรอกข้อมูลนี้ลงช่องสั่งซื้อให้อัตโนมัติ)"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (formErrors.address) setFormErrors(prev => ({ ...prev, address: undefined }));
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${formErrors.address ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:ring-primary-200'} rounded-2xl text-[16px] focus:outline-none focus:ring-4 focus:bg-white transition-all text-slate-800 resize-none`}
                />
              </div>
              {formErrors.address && (
                <p className="text-xs font-bold text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.address}
                </p>
              )}
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-center min-h-[48px]"
            >
              ยกเลิก
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-50 transition-all min-h-[48px]"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Address Book Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-7 h-7 text-primary-600" />
              สมุดที่อยู่จัดส่งสินค้า ({addresses.length})
            </h2>
            <p className="text-slate-400 text-sm font-semibold">
              บันทึกที่อยู่จัดส่งได้หลายที่อยู่เพื่อความสะดวกรวดเร็วในการเลือกซื้อสินค้า
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsAddressModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-primary-100 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มที่อยู่ใหม่</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-600 text-sm">ยังไม่มีที่อยู่จัดส่งในระบบค่ะ</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              คุณสามารถเพิ่มที่อยู่บ้าน ที่ทำงาน หรือคอนโดเพื่อใช้เป็นตัวเลือกในการจัดส่งสินค้าได้
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
            >
              + เพิ่มที่อยู่แรกของคุณ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-primary-500 bg-primary-50/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-700">
                      {addr.label === 'บ้าน' && <Home className="w-3.5 h-3.5" />}
                      {addr.label === 'ที่ทำงาน' && <Building2 className="w-3.5 h-3.5" />}
                      {addr.label !== 'บ้าน' && addr.label !== 'ที่ทำงาน' && <Tag className="w-3.5 h-3.5" />}
                      <span>{addr.label}</span>
                    </span>

                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700">
                        <Check className="w-3 h-3" /> ค่าเริ่มต้น
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-bold text-slate-400 hover:text-primary-600 hover:underline"
                      >
                        ตั้งเป็นค่าเริ่มต้น
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">{addr.recipientName}</span>
                      <span className="text-xs text-slate-500 font-medium">({addr.phone})</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {addr.addressLine}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 mt-3 border-t border-slate-200/60 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(addr);
                      setIsAddressModalOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        defaultRecipientName={displayName || user?.displayName || ''}
        defaultPhone={phone || user?.phone || ''}
      />

      {/* Followed Shops section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-danger-500 fill-current animate-pulse" />
            ร้านค้าที่ฉันติดตามอยู่ ({followedShops.length})
          </h2>
          <p className="text-slate-400 text-sm font-semibold">
            ร้านค้าที่คุณกดติดตามไว้เพื่อความสะดวกรวดเร็วในการเข้าชมสินค้าและสั่งซื้อ
          </p>
        </div>

        {followedShops.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-600 text-[16px]">ยังไม่มีร้านค้าที่คุณติดตามอยู่ค่ะ</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              เมื่อคุณเข้าชมรายละเอียดสินค้าในร้านค้าหลัก จะสามารถกดติดตามร้านค้าโปรดของคุณเพื่อบันทึกไว้ในส่วนนี้ได้ค่ะ
            </p>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="mt-4 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              ไปยังหน้าร้านค้าเพื่อติดตาม
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {followedShops.map((shop) => (
              <div 
                key={shop.name}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={shop.avatar}
                    alt={shop.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[15px] text-slate-900 truncate">
                      {shop.name}
                    </h4>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold mt-1">
                      {shop.category}
                    </span>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed font-semibold">
                      {shop.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" /> {shop.rating}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUnfollow(shop.name)}
                      className="px-3 py-1.5 border border-danger-200 hover:bg-danger-50 text-danger-600 font-extrabold text-[11px] rounded-lg transition-colors focus:outline-none"
                    >
                      ยกเลิกติดตาม
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/products?category=${encodeURIComponent(getProductCategoryForShop(shop.name))}`)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1 focus:outline-none"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>ดูสินค้า</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
