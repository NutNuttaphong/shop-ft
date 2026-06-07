import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from './NotificationContext';
import { Bell, MailOpen, ShoppingBag } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    setIsOpen(false);
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    // Navigate to orders page and trigger the order details modal by passing query param
    navigate(`/orders?orderNo=${notif.orderId}`);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'เมื่อสักครู่';
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="relative font-['Inter',sans-serif]" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl border border-slate-200 transition-all relative focus:outline-none"
        title="การแจ้งเตือน"
      >
        <Bell className="w-5.5 h-5.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-16 bg-white border border-slate-200 rounded-3xl shadow-2xl w-80 sm:w-96 p-4 z-50 animate-scale-up space-y-3">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-[16px] text-slate-900 flex items-center gap-1.5">
              การแจ้งเตือน
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-danger-50 text-danger-600 rounded-full text-xs font-bold">
                  ใหม่ {unreadCount} รายการ
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-extrabold flex items-center gap-1 focus:outline-none"
              >
                <MailOpen className="w-3.5 h-3.5" />
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-bold">ไม่มีการแจ้งเตือนในขณะนี้</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 text-left relative ${
                    notif.read
                      ? 'bg-white hover:bg-slate-50 border-slate-100'
                      : 'bg-primary-50/45 hover:bg-primary-50/60 border-primary-100/60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.read 
                      ? 'bg-slate-100 text-slate-500' 
                      : 'bg-primary-100 text-primary-600'
                  }`}>
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex justify-between items-baseline gap-1">
                      <h4 className={`text-xs font-black truncate ${
                        notif.read ? 'text-slate-700' : 'text-slate-900'
                      }`}>
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap flex-shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal font-semibold">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="absolute top-3.5 right-3 w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
