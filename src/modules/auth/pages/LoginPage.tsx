import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, User, Lock, AlertCircle, ShoppingBag, ShieldCheck, 
  UserPlus, Phone, MapPin, Smile 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mode state
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegisterMode) {
      if (!regUsername.trim() || !regPassword.trim() || !regDisplayName.trim()) {
        setErrorMsg('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
        return;
      }
      if (regUsername.trim().length < 3) {
        setErrorMsg('ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
        return;
      }
      if (regPassword.length < 6) {
        setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await register(
          regUsername,
          regPassword,
          regDisplayName,
          regPhone ? regPhone.trim() : undefined,
          regAddress ? regAddress.trim() : undefined
        );
        if (result.success) {
          alert('สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อยแล้วค่ะ! 🎉');
          navigate('/');
        } else {
          setErrorMsg(result.error || 'การสมัครสมาชิกเกิดข้อผิดพลาด');
        }
      } catch {
        setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!username.trim() || !password.trim()) {
        setErrorMsg('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await login(username, password);
        if (result.success && result.role) {
          if (result.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else {
          setErrorMsg(result.error || 'การเข้าสู่ระบบล้มเหลว');
        }
      } catch {
        setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsSubmitting(false);
      }
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
        <div className="bg-primary-600 px-8 py-8 text-white text-center relative">
          <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
            ระบบจัดจำหน่ายสินค้า
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">FRIST SHOP</h1>
          <p className="text-primary-100 text-sm max-w-sm mx-auto leading-relaxed">
            {isRegisterMode 
              ? 'สมัครสมาชิกบัญชีผู้ซื้อเพื่อเริ่มต้นช้อปสินค้าผักสด เนื้อสัตว์ และของใช้ราคาส่งทันที' 
              : 'เข้าสู่ระบบร้านค้าออนไลน์เพื่อเลือกช้อปสินค้าคุณภาพสูงและจัดการหลังบ้าน'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 font-bold text-xs bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-4 text-center border-b-2 transition-all ${
              !isRegisterMode 
                ? 'border-primary-600 text-primary-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            เข้าสู่ระบบ (Log In)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-4 text-center border-b-2 transition-all ${
              isRegisterMode 
                ? 'border-primary-600 text-primary-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            สมัครสมาชิกใหม่ (Sign Up)
          </button>
        </div>

        <div className="p-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-danger-50 border-l-4 border-danger-600 text-danger-700 rounded-r-xl flex items-start space-x-3 text-xs animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isRegisterMode ? (
              /* LOGIN MODE FORM */
              <>
                {/* Username Input */}
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="เช่น user@1234 หรือ admin@1234"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-primary-100 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังลงชื่อเข้าใช้งาน...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>เข้าสู่ระบบปลอดภัย</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative px-4 bg-white text-slate-400 text-[11px] font-bold uppercase tracking-wider">หรือคลิกกรอกบัญชีทดสอบด่วน</span>
                </div>

                {/* Quick-fill Helper */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('user')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-400 rounded-2xl transition-all group focus-visible:ring-primary-400 text-center"
                  >
                    <ShoppingBag className="w-6 h-6 text-primary-500 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-slate-700 block text-xs">บัญชีลูกค้า</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">user@1234</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-2xl transition-all group focus-visible:ring-emerald-400 text-center"
                  >
                    <ShieldCheck className="w-6 h-6 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-slate-700 block text-xs">บัญชีผู้ดูแล</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">admin@1234</span>
                  </button>
                </div>
              </>
            ) : (
              /* REGISTER MODE FORM */
              <>
                {/* Username Input */}
                <div>
                  <label htmlFor="regUsername" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    ชื่อผู้ใช้งาน (Username) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="regUsername"
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="ความยาว 3-50 ตัวอักษร"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="regPassword" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    รหัสผ่าน (Password) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="regPassword"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <label htmlFor="regDisplayName" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    ชื่อแสดงผล (Display Name) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Smile className="w-4 h-4" />
                    </span>
                    <input
                      id="regDisplayName"
                      type="text"
                      value={regDisplayName}
                      onChange={(e) => setRegDisplayName(e.target.value)}
                      placeholder="ชื่อที่จะแสดงในระบบ เช่น คุณใจดี รักดี"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="regPhone" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    เบอร์โทรศัพท์ (Phone)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="regPhone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="ตัวอย่าง: 0812345678"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Address Input */}
                <div>
                  <label htmlFor="regAddress" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    ที่อยู่จัดส่งสินค้า (Shipping Address)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 pt-3 flex items-start text-slate-400 pointer-events-none">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <textarea
                      id="regAddress"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="กรอกที่อยู่สำหรับส่งสินค้าปลายทางอย่างละเอียด..."
                      rows={2}
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-primary-100 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังสร้างบัญชีผู้ใช้งานใหม่...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>สมัครสมาชิกด่วน</span>
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>

        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
          <span>© 2026 ระบบการค้าออนไลน์ FRIST SHOP</span>
          <span className="font-semibold text-primary-600 hover:underline cursor-pointer">ช่วยเหลือและแนะนำ</span>
        </div>
      </div>
    </div>
  );
};
