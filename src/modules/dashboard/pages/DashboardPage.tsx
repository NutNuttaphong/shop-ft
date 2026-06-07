import React, { useState, useEffect, useRef } from 'react';
import { Product, restfulApi } from '../../../shared/services/api';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Send,
  MessageSquare
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Chat Hub States
  const [contacts, setContacts] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadContacts, setUnreadContacts] = useState<Set<string>>(new Set());

  // Shipping Label States
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<any | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchStatsAndOrders = async () => {
    try {
      const prodRes = await restfulApi.get<Product[]>('/api/products');
      const list = prodRes.data || [];
      setProducts(list);
      setLowStockCount(list.filter(p => p.stock <= 5).length);

      const orderRes = await restfulApi.get<any[]>('/api/orders');
      setOrders(orderRes.data || []);
    } catch (e) {
      console.error('Failed to fetch admin stats and orders', e);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await restfulApi.get<string[]>('/api/chat/contacts');
      if (res.data) {
        setContacts(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch chat contacts', e);
    }
  };

  const fetchChatHistory = async (contact: string) => {
    try {
      const res = await restfulApi.get<any[]>(`/api/chat/history?contact=${contact}`);
      if (res.data) {
        setChatMessages(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch chat history', e);
    }
  };

  useEffect(() => {
    fetchStatsAndOrders();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory(selectedContact);
      // Remove from unread set
      setUnreadContacts(prev => {
        const next = new Set(prev);
        next.delete(selectedContact);
        return next;
      });
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const handleIncomingChatMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const msg = customEvent.detail;
      
      if (selectedContact && (msg.sender === selectedContact || msg.receiver === selectedContact)) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else {
        setUnreadContacts(prev => {
          const next = new Set(prev);
          next.add(msg.sender);
          return next;
        });
      }
      fetchContacts();
    };

    window.addEventListener('chat-message-received', handleIncomingChatMessage);
    return () => {
      window.removeEventListener('chat-message-received', handleIncomingChatMessage);
    };
  }, [selectedContact]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await restfulApi.put(`/api/orders/${orderId}/status?status=${newStatus}`, {});
      await fetchStatsAndOrders();
    } catch (e) {
      alert('ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้ค่ะ');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleResolveReturn = async (orderId: string, approve: boolean) => {
    setIsUpdatingStatus(orderId);
    try {
      await restfulApi.put(`/api/orders/${orderId}/resolve-return?approve=${approve}`, {});
      await fetchStatsAndOrders();
    } catch (e) {
      alert('ไม่สามารถดำเนินการจัดการคำขอคืนเงินได้ค่ะ');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleResolveDispute = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await restfulApi.put(`/api/orders/${orderId}/resolve-dispute`, {});
      await fetchStatsAndOrders();
    } catch (e) {
      alert('ไม่สามารถปิดข้อพิพาทได้ค่ะ');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !chatInput.trim()) return;

    const msgText = chatInput.trim();
    setChatInput('');

    try {
      const res = await restfulApi.post<any>('/api/chat/send', {
        receiver: selectedContact,
        message: msgText
      });
      if (res.data) {
        setChatMessages(prev => [...prev, res.data]);
      }
    } catch (e) {
      console.error('Failed to send admin message', e);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        month: 'short',
        day: 'numeric'
      }) + ' ' + date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' น.';
    } catch {
      return '-';
    }
  };

  const renderMockBarcode = (value: string) => {
    return (
      <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-lg">
        <div className="flex items-end h-10 gap-0.5">
          {Array.from({ length: 35 }).map((_, i) => {
            const isWide = (i * 7) % 3 === 0;
            const isMedium = (i * 4) % 3 === 0;
            return (
              <div
                key={i}
                className="bg-black h-full"
                style={{ width: isWide ? '3px' : isMedium ? '2px' : '1px' }}
              />
            );
          })}
        </div>
        <span className="text-[9px] font-mono mt-1 tracking-widest">{value}</span>
      </div>
    );
  };

  // Simple statistics calculations
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalSales = orders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + o.total : sum, 0);

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Welcome Block */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900">แดชบอร์ดสรุปภาพรวมระบบ</h1>
        <p className="text-slate-500 text-[16px]">สถิติการใช้งาน ยอดสั่งซื้อ และระดับสต็อกสินค้าในระบบ</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">ยอดจำหน่ายรวมสะสม</span>
            <span className="text-3xl font-black text-slate-900 block">{totalSales.toLocaleString()} บาท</span>
            <span className="text-xs font-bold text-success-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% สัปดาห์นี้
            </span>
          </div>
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Catalog Items count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">ชนิดสินค้าทั้งหมดในระบบ</span>
            <span className="text-3xl font-black text-slate-900 block">{products.length} หมวด</span>
            <span className="text-xs font-bold text-slate-500 block">รวมสต็อก {totalStockItems} ชิ้น</span>
          </div>
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200">
            <Package className="w-7 h-7" />
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">สินค้ามีสต็อกต่ำกว่าเกณฑ์</span>
            <span className={`text-3xl font-black block ${lowStockCount > 0 ? 'text-danger-600' : 'text-slate-900'}`}>
              {lowStockCount} รายการ
            </span>
            <span className="text-xs font-bold text-slate-500 block">ต้องสั่งเข้าคลังด่วน</span>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
            lowStockCount > 0 
              ? 'bg-danger-50 text-danger-600 border-danger-100 animate-pulse' 
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>

        {/* Simulated Active Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">สมาชิกในระบบทั้งหมด</span>
            <span className="text-3xl font-black text-slate-900 block">2 บัญชี</span>
            <span className="text-xs font-bold text-slate-500 block">1 ลูกค้า / 1 ผู้ดูแล</span>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Users className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* Main analytics panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Graph mockup */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">แนวโน้มการสั่งซื้อในสัปดาห์นี้</h2>
            <span className="text-xs font-bold text-slate-400">เปรียบเทียบสถิติรายวัน</span>
          </div>

          {/* Simple custom SVG chart */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100 pb-10">
              <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
            </div>
            
            {/* Bars */}
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[30%]"></div>
              <span className="text-xs font-bold text-slate-400">จันทร์</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[45%]"></div>
              <span className="text-xs font-bold text-slate-400">อังคาร</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[25%]"></div>
              <span className="text-xs font-bold text-slate-400">พุธ</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-primary-500 group-hover:bg-primary-600 rounded-t-xl transition-all h-[80%] shadow-lg shadow-primary-50"></div>
              <span className="text-xs font-black text-primary-600">พฤหัสบดี</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[55%]"></div>
              <span className="text-xs font-bold text-slate-400">ศุกร์</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[40%]"></div>
              <span className="text-xs font-bold text-slate-400">เสาร์</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group z-10">
              <div className="w-10 sm:w-14 bg-slate-200 group-hover:bg-slate-300 rounded-t-xl transition-all h-[60%]"></div>
              <span className="text-xs font-bold text-slate-400">อาทิตย์</span>
            </div>
          </div>
        </div>

        {/* Recent orders panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-500" /> จัดการคำสั่งซื้อจริงในระบบ
            </h2>

            <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold">
                  ไม่มีคำสั่งซื้อในระบบขณะนี้
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="text-[14px] p-3 border border-slate-100 hover:bg-slate-50/50 rounded-2xl transition-all space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-950 block">{order.orderNo}</span>
                      <span className="font-black text-primary-600 block">{order.total.toLocaleString()} บาท</span>
                    </div>
                    
                    <div className="text-xs text-slate-400 font-semibold space-y-0.5">
                      <p>ลูกค้า: <span className="text-slate-700 font-bold">{order.customer.name}</span> ({order.customer.phone})</p>
                      <p>เวลา: {formatDate(order.createdAt)}</p>
                      <p className="truncate">สินค้า: {order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}</p>
                      {order.carrier && <p>ขนส่ง: {order.carrier} ({order.trackingNumber})</p>}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 gap-2">
                      <span className="text-xs text-slate-400 font-bold">ปรับเปลี่ยนสถานะ:</span>
                      <select
                        value={order.status}
                        disabled={isUpdatingStatus === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2 py-1 bg-white border rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer ${
                          isUpdatingStatus === order.id ? 'opacity-40' : ''
                        }`}
                      >
                        <option value="PENDING">รอการจัดเตรียม</option>
                        <option value="PREPARING">กำลังจัดเตรียม</option>
                        <option value="SHIPPED">จัดส่งแล้ว (SHIPPED)</option>
                        <option value="DELIVERED">นำส่งสำเร็จ (DELIVERED)</option>
                        <option value="RETURN_REQUESTED">ขอคืนเงิน (RETURN_REQUESTED)</option>
                        <option value="RETURN_REFUNDED">คืนเงินแล้ว (RETURN_REFUNDED)</option>
                        <option value="CANCELLED">ยกเลิกคำสั่งซื้อ</option>
                      </select>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, 'PREPARING')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            รับออเดอร์
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            ยกเลิก
                          </button>
                        </>
                      )}

                      {order.status === 'PREPARING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            จัดส่งสินค้า
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderForLabel(order);
                              setShowLabelModal(true);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors border border-slate-200"
                          >
                            พิมพ์ใบปะหน้า
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            ยกเลิก
                          </button>
                        </>
                      )}

                      {order.status === 'SHIPPED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            จัดส่งสำเร็จ
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderForLabel(order);
                              setShowLabelModal(true);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors border border-slate-200"
                          >
                            พิมพ์ใบปะหน้า
                          </button>
                        </>
                      )}

                      {(order.status === 'DELIVERED' || order.status === 'RETURN_REQUESTED' || order.status === 'RETURN_REFUNDED') && (
                        <button
                          onClick={() => {
                            setSelectedOrderForLabel(order);
                            setShowLabelModal(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors border border-slate-200"
                        >
                          พิมพ์ใบปะหน้า
                        </button>
                      )}
                    </div>

                    {/* Return Action Block */}
                    {order.status === 'RETURN_REQUESTED' && (
                      <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl space-y-2 text-xs">
                        <p className="font-extrabold text-rose-700">คำร้องขอคืนเงิน/คืนสินค้า:</p>
                        <p className="text-slate-600 font-semibold">เหตุผล: <span className="font-extrabold text-slate-800">{order.returnReason}</span></p>
                        {order.returnDescription && <p className="text-slate-600 font-semibold">รายละเอียด: <span className="text-slate-800 font-medium">{order.returnDescription}</span></p>}
                        
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleResolveReturn(order.id, true)}
                            disabled={isUpdatingStatus === order.id}
                            className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleResolveReturn(order.id, false)}
                            disabled={isUpdatingStatus === order.id}
                            className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dispute Action Block */}
                    {order.disputeOpened && (
                      <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-xl space-y-2 text-xs">
                        <p className="font-extrabold text-orange-700">ข้อพิพาท (Dispute Open):</p>
                        <p className="text-slate-600 font-semibold">เหตุผล: <span className="font-extrabold text-slate-800">{order.disputeReason}</span></p>
                        
                        <button
                          onClick={() => handleResolveDispute(order.id)}
                          disabled={isUpdatingStatus === order.id}
                          className="w-full py-1.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                        >
                          ปิดข้อพิพาท (Resolve Case)
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Chat Hub */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MessageSquare className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-extrabold text-slate-900">ศูนย์บริการช่วยเหลือลูกค้า (Customer Chat Hub)</h2>
          <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
            ระบบแชทตอบกลับ Real-time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[450px] overflow-hidden">
          
          {/* Contacts Sidebar (List of Users) */}
          <div className="md:col-span-1 border border-slate-100 rounded-2xl bg-slate-50 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">รายชื่อลูกค้าทั้งหมด</span>
              
              {contacts.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold text-center py-8">ยังไม่มีลูกค้าติดต่อเข้ามา</p>
              ) : (
                <div className="space-y-1">
                  {contacts.map((contactName) => {
                    const isSelected = selectedContact === contactName;
                    const isUnread = unreadContacts.has(contactName);
                    return (
                      <button
                        key={contactName}
                        onClick={() => setSelectedContact(contactName)}
                        className={`w-full px-4 py-3 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/50'
                        }`}
                      >
                        <span>{contactName}</span>
                        {isUnread && (
                          <span className="w-2.5 h-2.5 bg-danger-500 rounded-full animate-bounce"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Conversation Area */}
          <div className="md:col-span-2 border border-slate-100 rounded-2xl flex flex-col justify-between overflow-hidden bg-slate-50/50">
            {!selectedContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 animate-pulse" />
                <p className="text-sm font-bold">ยังไม่ได้เลือกผู้ใช้เพื่อสนทนา</p>
                <p className="text-xs text-slate-400">คลิกที่รายชื่อลูกค้าด้านซ้ายเพื่อเปิดหน้าต่างตอบแชทค่ะ</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200/80 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-800">
                    ลูกค้า: <span className="text-primary-600 font-black">{selectedContact}</span>
                  </span>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                </div>

                {/* Message list */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                  {chatMessages.map((msg) => {
                    const isOwn = msg.sender === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                            isOwn
                              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/55'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendAdminMessage} className="p-3 bg-white border-t border-slate-200/80 flex gap-2 items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`ตอบกลับ ${selectedContact}...`}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:border-primary-500 font-medium placeholder-slate-400 bg-slate-50 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Shipping Label Modal */}
      {showLabelModal && selectedOrderForLabel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #shipping-label-printable, #shipping-label-printable * {
                visibility: visible;
              }
              #shipping-label-printable {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col no-print">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/60 flex justify-between items-center">
              <h3 className="font-extrabold text-[16px] text-slate-800">พิมพ์ใบปะหน้าพัสดุ (Shipping Label)</h3>
              <button
                onClick={() => {
                  setShowLabelModal(false);
                  setSelectedOrderForLabel(null);
                }}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Label Container Preview */}
            <div className="p-6 overflow-y-auto flex-1 max-h-[70vh]">
              <div
                id="shipping-label-printable"
                className="border-2 border-black p-5 bg-white space-y-4 font-sans text-black"
                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start border-b-2 border-black pb-3">
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-tight">สบายดีมาร์เก็ต</h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sabaidee Market</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold block">เลขที่ออเดอร์: {selectedOrderForLabel.orderNo}</span>
                    <span className="text-[10px] font-semibold text-slate-500 block">วันที่: {formatDate(selectedOrderForLabel.createdAt)}</span>
                  </div>
                </div>

                {/* Sender/Recipient Section */}
                <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3 text-xs">
                  {/* Sender Address */}
                  <div className="border-r border-black pr-3 space-y-1">
                    <span className="font-bold text-[10px] uppercase text-slate-500 block">ผู้ส่ง (Sender):</span>
                    <p className="font-black text-slate-900">สบายดีมาร์เก็ต (คลังสินค้ากลาง)</p>
                    <p className="text-slate-700 font-semibold leading-relaxed">
                      123/45 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250
                    </p>
                    <p className="font-bold">โทร: 02-123-4567</p>
                  </div>

                  {/* Recipient Address */}
                  <div className="pl-1 space-y-1">
                    <span className="font-bold text-[10px] uppercase text-slate-500 block">ผู้รับ (Recipient):</span>
                    <p className="font-black text-slate-900">{selectedOrderForLabel.customer.name}</p>
                    <p className="text-slate-700 font-semibold leading-relaxed select-all">
                      {selectedOrderForLabel.customer.address}
                    </p>
                    <p className="font-bold">โทร: {selectedOrderForLabel.customer.phone}</p>
                  </div>
                </div>

                {/* Carrier details & Barcode */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b-2 border-black pb-3">
                  <div className="space-y-1 self-start sm:self-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">การจัดส่ง (Shipping):</span>
                    <p className="font-black text-base text-slate-900">{selectedOrderForLabel.carrier || 'Kerry Express'}</p>
                    <p className="text-xs font-bold text-primary-600 select-all">Tracking: {selectedOrderForLabel.trackingNumber || 'TH9081230491'}</p>
                  </div>
                  <div>
                    {renderMockBarcode(selectedOrderForLabel.trackingNumber || selectedOrderForLabel.orderNo)}
                  </div>
                </div>

                {/* Payment & COD Warning */}
                <div className="border-b-2 border-black pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">การชำระเงิน (Payment):</span>
                    <span className={`text-base font-black uppercase tracking-wider block ${selectedOrderForLabel.paymentMethod === 'cod' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {selectedOrderForLabel.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง (COD)' : 'จ่ายแล้ว (QR Code)'}
                    </span>
                  </div>
                  {selectedOrderForLabel.paymentMethod === 'cod' && (
                    <div className="bg-slate-100 border border-black/25 p-2 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">ยอดเก็บปลายทาง</span>
                      <span className="text-xl font-black text-slate-950">
                        {selectedOrderForLabel.total.toLocaleString()} บาท
                      </span>
                    </div>
                  )}
                </div>

                {/* Packing Item List */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">รายการสินค้าที่ต้องบรรจุ (Packing List):</span>
                  <div className="space-y-1">
                    {selectedOrderForLabel.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-1 last:border-0">
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {item.name} {item.variant ? `(${item.variant})` : ''}
                        </span>
                        <span className="font-black text-base text-slate-950">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowLabelModal(false);
                  setSelectedOrderForLabel(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs border border-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md text-xs"
              >
                พิมพ์ใบปะหน้า
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
