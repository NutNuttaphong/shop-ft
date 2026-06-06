import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/products', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success && result.role) {
        // Redirect based on role
        if (result.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/products');
        }
      } else {
        setErrorMsg(result.error || 'การเข้าสู่ระบบล้มเหลว');
      }
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหมู่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper
  const handleQuickFill = (userType: 'user' | 'admin') => {
    if (userType === 'user') {
      setUsername('user@1234');
      setPassword('user@1234');
    } else {
      setUsername('admin@1234');
      setPassword('admin@1234');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-slate-100 to-slate-200 p-4 font-['Inter',sans-serif]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
        
        {/* Header decoration */}
        <div className="bg-primary-600 px-8 py-10 text-white text-center relative">
          <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
            ระบบจัดจำหน่ายสินค้า
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">ยินดีต้อนรับเข้าสู่ระบบ</h1>
          <p className="text-primary-100 text-[16px] max-w-sm mx-auto leading-relaxed">
            เลือกประเภทผู้ใช้งานด้านล่าง หรือกรอกบัญชีผู้ใช้เพื่อเริ่มต้นใช้งานระบบอย่างง่ายดาย
          </p>
        </div>

        <div className="p-8">
          {/* Quick-fill Helper */}
          <div className="mb-8">
            <h2 className="text-[15px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-4">
              คลิกเพื่อกรอกข้อมูลบัญชีทดสอบด่วน
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleQuickFill('user')}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-primary-50 border-2 border-slate-200 hover:border-primary-400 rounded-2xl transition-all group focus-visible:ring-primary-400"
              >
                <ShoppingBag className="w-8 h-8 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 block text-[17px]">บัญชีลูกค้า (ซื้อสินค้า)</span>
                <span className="text-[13px] text-slate-400 mt-1">user@1234</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-400 rounded-2xl transition-all group focus-visible:ring-emerald-400"
              >
                <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-700 block text-[17px]">บัญชีผู้ดูแล (จัดการสินค้า)</span>
                <span className="text-[13px] text-slate-400 mt-1">admin@1234</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-4 bg-white text-slate-400 text-sm font-semibold">หรือกรอกบัญชีผู้ใช้</span>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-danger-50 border-l-4 border-danger-600 text-danger-700 rounded-r-xl flex items-start space-x-3 text-[16px] animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-[17px] font-bold text-slate-700 mb-2">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ตัวอย่าง: user@1234 หรือ admin@1234"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-2xl text-[18px] text-slate-800 placeholder-slate-400 focus:border-primary-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-[17px] font-bold text-slate-700 mb-2">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-2xl text-[18px] text-slate-800 placeholder-slate-400 focus:border-primary-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-[19px] rounded-2xl shadow-lg hover:shadow-primary-100 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังลงชื่อเข้าใช้งาน...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>เข้าสู่ระบบความปลอดภัย</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[14px]">
          <span>© 2026 ระบบการค้าออนไลน์แบบจำกัด</span>
          <span className="font-semibold text-primary-600 hover:underline cursor-pointer">ช่วยเหลือและแนะนำ</span>
        </div>
      </div>
    </div>
  );
};
