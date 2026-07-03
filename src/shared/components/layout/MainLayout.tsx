import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../modules/auth/hooks/useAuth';
import { NotificationProvider } from './NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ChatWidget } from './ChatWidget';
import { restfulApi } from '../../services/api';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  PackageCheck,
  LogOut,
  User,
  Menu,
  X,
  // Type,
  ChevronRight,
  Tag,
  Gift,
  History,
  BarChart3,
  Radio,
  Newspaper
} from 'lucide-react';

interface LocalCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
  category: string;
  variant?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [textSize, setTextSize] = useState<'standard' | 'large' | 'extra-large'>('standard');

  // Load font size preference
  useEffect(() => {
    const savedSize = localStorage.getItem('app_text_size') as 'standard' | 'large' | 'extra-large' | null;
    if (savedSize && ['standard', 'large', 'extra-large'].includes(savedSize)) {
      setTextSize(savedSize);
    }
  }, []);

  // const handleTextSizeChange = (size: 'standard' | 'large' | 'extra-large') => {
  //   setTextSize(size);
  //   localStorage.setItem('app_text_size', size);
  // };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get active font size class to inject at main element
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'large':
        return 'text-[19px] [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-[18px] [&_button]:text-[19px] [&_input]:text-[19px] [&_label]:text-[18px]';
      case 'extra-large':
        return 'text-[21px] [&_h1]:text-5xl [&_h2]:text-4xl [&_h3]:text-3xl [&_p]:text-[20px] [&_button]:text-[21px] [&_input]:text-[21px] [&_label]:text-[20px]';
      default:
        return 'text-[17px]';
    }
  };

  // Define navigation based on Role
  const navItems = user?.role === 'admin' 
    ? [
        { path: '/admin/dashboard', label: 'แดชบอร์ดภาพรวม', icon: LayoutDashboard },
        { path: '/admin/analytics', label: 'สถิติและรายงาน', icon: BarChart3 },
        { path: '/admin/social', label: 'โซเชียลมีเดีย', icon: Radio },
        { path: '/admin/products', label: 'จัดการรายการสินค้า', icon: PackageCheck },
        { path: '/admin/promotions', label: 'การจัดการโปรโมชั่น', icon: Tag },
        { path: '/admin/news', label: 'การจัดการข่าวสาร', icon: Newspaper },
      ]
    : [
        { path: '/', label: 'หน้าหลัก', icon: Home },
        { path: '/products', label: 'ร้านค้าสั่งซื้อสินค้า', icon: ShoppingBag },
        { path: '/cart', label: 'ตะกร้าสินค้าของฉัน', icon: ShoppingCart, showBadge: true },
        { path: '/orders', label: 'ประวัติการสั่งซื้อ', icon: History },
        { path: '/promotions', label: 'โปรโมชั่น', icon: Gift },
      ];

  const [cartCount, setCartCount] = useState(0);

  // Sync cart count from backend or fallback to local storage
  const syncCartCount = async () => {
    try {
      const res = await restfulApi.get<LocalCartItem[]>('/api/cart');
      if (res.data && Array.isArray(res.data)) {
        const count = res.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
        localStorage.setItem('app_cart', JSON.stringify(res.data));
        return;
      }
    } catch (e) {
      console.error('Failed to sync cart from backend', e);
    }

    // Fallback to localStorage if backend is down
    try {
      const cart = JSON.parse(localStorage.getItem('app_cart') || '[]');
      const count = cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  // Listen to storage/cart-updated events to update cart badge instantly
  useEffect(() => {
    syncCartCount();

    const handleStorageChange = () => {
      syncCartCount();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange); // Custom event
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);

  return (
    <NotificationProvider>
      <div className={`min-h-screen bg-slate-50 flex flex-col ${getTextSizeClass()} transition-all duration-200`}>
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/'} className="flex-shrink-0 flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-primary-100">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-2xl tracking-tight text-slate-900 block">FRIST SHOP</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">First Shop Online</span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex ml-10 space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      id={item.path === '/cart' ? 'cart-nav-item' : undefined}
                      className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition-all text-[16px] gap-2 ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                      
                      {item.showBadge && cartCount > 0 && (
                        <span className="ml-1 px-2.5 py-0.5 text-xs font-extrabold bg-danger-500 text-white rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Right Panel (Accessibility + Profile) */}
            <div className="hidden md:flex items-center space-x-6">
              
              {user && <NotificationDropdown />}
              {/* User profile card */}
              {user && (
                <div className="flex items-center gap-4 cursor-pointer relative">
                  <div onClick={() => setOpen(!open)} className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors shadow-sm select-none">
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-[14px] text-slate-700 block leading-tight">
                        {user.displayName}
                      </span>
                      <span className="text-[11px] font-bold text-primary-600 uppercase tracking-widest block">
                        {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
                      </span>
                    </div>
                  </div>

                  {/* Premium Dropdown Menu */}
                  {open && (
                    <div className="absolute right-0 top-16 bg-white border border-slate-200 rounded-2xl shadow-xl w-60 p-4 z-50 animate-scale-up space-y-3 font-sans animate-fade-in">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200 flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-[14px] text-slate-800 block truncate leading-snug">
                            {user.displayName}
                          </span>
                          <span className="text-[11px] font-bold text-primary-600 uppercase tracking-widest block">
                            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-1 text-sm font-bold text-slate-600">
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-primary-600 transition-all"
                          >
                            <User className="w-4 h-4" />
                            <span>แก้ไขข้อมูลส่วนตัว</span>
                          </Link>
                        </li>
                        {user.role === 'user' && (
                          <li>
                            <Link
                              to="/orders"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-primary-600 transition-all"
                            >
                              <History className="w-4 h-4" />
                              <span>ประวัติการสั่งซื้อ</span>
                            </Link>
                          </li>
                        )}
                        <li className="pt-2 border-t border-slate-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-danger-50 text-danger-600 hover:text-danger-700 transition-all text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>ออกจากระบบ</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden space-x-3">
              {user && user.role === 'user' && (
                <Link
                  to="/cart"
                  id="cart-nav-item-mobile"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 relative cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 text-[10px] font-black bg-danger-500 text-white rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 flex flex-col justify-between" onClick={e => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="font-extrabold text-lg text-slate-900">เมนูจัดการระบบ</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Card Mobile */}
              {user && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
                  <div className="w-11 h-11 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-[16px]">{user.displayName}</h4>
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                      {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Items mobile */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-xl font-bold transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center">
                        {item.showBadge && cartCount > 0 && (
                          <span className={`px-2 py-0.5 mr-2 text-xs font-black rounded-full ${
                            isActive ? 'bg-white text-primary-600' : 'bg-danger-500 text-white'
                          }`}>
                            {cartCount}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions mobile */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              {/* Font Size controls for mobile */}
              {/* <div className="space-y-2">
                <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> ตั้งค่าขนาดตัวอักษร:
                </span>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    onClick={() => handleTextSizeChange('standard')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      textSize === 'standard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    ปกติ
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('large')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      textSize === 'large' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    ใหญ่
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('extra-large')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      textSize === 'extra-large' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    ใหญ่มาก
                  </button>
                </div>
              </div> */}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-danger-50 hover:bg-danger-100 border border-danger-100 text-danger-700 font-extrabold rounded-2xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>ออกจากระบบที่ปลอดภัย</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[85rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[15px]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600 text-[16px]">FRIST SHOP</span>
            <span>- มุ่งมั่นมอบบริการสะดวกสบายและเข้าถึงได้สำหรับทุกเพศทุกวัย</span>
          </div>
          <div>
            <span>รุ่นทดสอบเวอร์ชัน 1.0.0 © 2026. สงวนลิขสิทธิ์</span>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
    </NotificationProvider>
  );
};
