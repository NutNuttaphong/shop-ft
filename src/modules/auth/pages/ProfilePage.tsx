import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Phone, MapPin, CheckCircle2, ArrowLeft, Save, AlertCircle, ShieldAlert } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
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

    </div>
  );
};
