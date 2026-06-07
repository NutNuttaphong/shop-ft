import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { restfulApi, API_BASE_URL, getToken } from '../../services/api';
import { useAuth } from '../../../modules/auth/hooks/useAuth';
import { Bell, X } from 'lucide-react';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  orderId: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface ProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<ProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<{ id: string; title: string; message: string } | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await restfulApi.get<Notification[]>('/api/notifications/my');
      if (res.data) {
        setNotifications(res.data);
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, [user]);

  // Mark single as read
  const markAsRead = async (id: string) => {
    try {
      await restfulApi.put(`/api/notifications/${id}/read`, {});
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await restfulApi.put('/api/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    }
  };

  // Trigger Toast Notification
  const triggerToast = (title: string, message: string) => {
    const id = Date.now().toString();
    setToast({ id, title, message });
    
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 6000);
  };

  // SSE Subscription
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Load initial history
    fetchNotifications();

    // Get JWT from local storage session
    const token = getToken();
    if (!token) return;

    // Connect to SSE endpoint
    const url = `${API_BASE_URL}/api/notifications/subscribe?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('NOTIFICATION', (event: MessageEvent) => {
      try {
        const newNotif = JSON.parse(event.data) as Notification;
        
        // Add to list
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Trigger visual Toast
        triggerToast(newNotif.title, newNotif.message);

        // Dispatch general event for pages (like OrdersPage) to reload data
        window.dispatchEvent(new Event('orders-updated'));
      } catch (err) {
        console.error('Error parsing notification', err);
      }
    });

    eventSource.addEventListener('CHAT_MESSAGE', (event: MessageEvent) => {
      try {
        const chatMsg = JSON.parse(event.data);
        // Dispatch custom event for real-time chat message receipt
        window.dispatchEvent(new CustomEvent('chat-message-received', { detail: chatMsg }));
      } catch (err) {
        console.error('Error parsing chat message', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}

      {/* Slide-in Toast Alert */}
      {toast && (
        <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full bg-white border-l-4 border-primary-600 rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start justify-between animate-slide-in font-['Inter',sans-serif]">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 border border-primary-100">
              <Bell className="w-5 h-5 animate-swing" />
            </div>
            <div>
              <h4 className="font-extrabold text-[15px] text-slate-900 leading-tight">
                {toast.title}
              </h4>
              <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
