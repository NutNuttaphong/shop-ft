import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, Search, Calendar, CreditCard, Truck, ShoppingBag, 
  Printer, RotateCcw, Copy, Check, X, AlertCircle, Eye, 
  Package, CheckCircle2, XCircle, Star
} from 'lucide-react';
import Bill, { OrderData, OrderItem } from './Bill';
import { restfulApi } from '../../../shared/services/api';
import { useAuth } from '../../auth/hooks/useAuth';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'qr'>('all');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'invoice'>('tracking');

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Return states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('สินค้าชำรุดเสียหาย');
  const [returnDescription, setReturnDescription] = useState('');

  // Dispute states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const fetchMyOrders = async () => {
    try {
      const res = await restfulApi.get<any[]>('/api/orders/my');
      if (res.data) {
        const formattedOrders: OrderData[] = res.data.map((order: any) => {
          // Process coin refund if applicable
          if (order.status === 'RETURN_REFUNDED' && order.coinsUsed > 0 && user) {
            const processedKey = `app_refunded_coins_processed_${user.username}`;
            try {
              const processedList = JSON.parse(localStorage.getItem(processedKey) || '[]');
              if (!processedList.includes(order.id)) {
                const coinsKey = `app_user_coins_${user.username}`;
                const currentCoins = Number(localStorage.getItem(coinsKey) || '150');
                const nextCoins = currentCoins + order.coinsUsed;
                localStorage.setItem(coinsKey, nextCoins.toString());
                processedList.push(order.id);
                localStorage.setItem(processedKey, JSON.stringify(processedList));
                window.dispatchEvent(new Event('coins-updated'));
              }
            } catch (err) {
              console.error('Failed to process coin refund', err);
            }
          }

          return {
            id: order.id,
            orderNo: order.orderNo,
            date: order.createdAt || new Date().toISOString(),
            items: order.items.map((item: any) => ({
              id: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              category: item.category,
              variant: item.variant || null
            })),
            total: order.total,
            discount: order.discount,
            coinsUsed: order.coinsUsed,
            promoCode: order.promoCode || null,
            customer: {
              name: order.customer.name,
              phone: order.customer.phone,
              address: order.customer.address
            },
            paymentMethod: order.paymentMethod?.toLowerCase() === 'cod' ? 'cod' : 'qr',
            slipUploaded: order.slipUploaded,
            slipName: order.slipName,
            status: order.status || 'PENDING',
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            returnReason: order.returnReason,
            returnDescription: order.returnDescription,
            disputeOpened: order.disputeOpened,
            disputeReason: order.disputeReason,
            disputeStatus: order.disputeStatus
          };
        });
        setOrders(formattedOrders);
      }
    } catch (e) {
      console.error('Failed to fetch orders from backend', e);
    }
  };

  useEffect(() => {
    fetchMyOrders();

    const handleOrdersUpdated = () => {
      fetchMyOrders();
    };
    window.addEventListener('orders-updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders-updated', handleOrdersUpdated);
    };
  }, []);

  // Update selected order details in real-time when orders list is refreshed
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.orderNo === selectedOrder.orderNo);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(updated);
      }
    }
  }, [orders, selectedOrder]);

  // Open modal based on orderNo query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderNoParam = searchParams.get('orderNo');
    if (orderNoParam && orders.length > 0) {
      const matchingOrder = orders.find(o => o.orderNo === orderNoParam);
      if (matchingOrder) {
        setSelectedOrder(matchingOrder);
        setShowReceiptModal(true);
        setActiveTab('tracking');
        navigate('/orders', { replace: true });
      }
    }
  }, [orders]);

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleReorder = (items: OrderItem[], e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const currentCart = JSON.parse(localStorage.getItem('app_cart') || '[]');
      
      const updatedCart = [...currentCart];
      items.forEach(item => {
        const existingIdx = updatedCart.findIndex(c => c.id === item.id);
        if (existingIdx > -1) {
          // Add quantity to existing cart item
          updatedCart[existingIdx].quantity += item.quantity;
        } else {
          // Add new item
          updatedCart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            stock: 99, // default fallback stock
            category: item.category
          });
        }
      });
      
      localStorage.setItem('app_cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cart-updated'));
      alert('เพิ่มสินค้าของคำสั่งซื้อนี้ไปยังตะกร้าแล้วค่ะ');
      navigate('/cart');
    } catch (err) {
      console.error('Reorder error', err);
      alert('ไม่สามารถเพิ่มสินค้าลงในตะกร้าได้ในขณะนี้');
    }
  };

  const handleOpenReviewModal = (productId: string, productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      alert('กรุณากรอกความคิดเห็นสำหรับการรีวิวสินค้าค่ะ');
      return;
    }

    try {
      const res = await restfulApi.post(`/api/products/${reviewProductId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.error) {
        alert(res.error);
      } else {
        alert('บันทึกการรีวิวสินค้าสำเร็จแล้ว ขอบพระคุณสำหรับความคิดเห็นค่ะ');
        setShowReviewModal(false);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกรีวิวสินค้า');
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedOrder.id) return;

    try {
      const res = await restfulApi.put(`/api/orders/${selectedOrder.id}/return`, {
        returnReason,
        returnDescription
      });

      if (res.error) {
        alert(res.error);
      } else {
        alert('ส่งคำร้องขอคืนเงินเรียบร้อยแล้วค่ะ แอดมินจะตรวจสอบโดยเร็วที่สุด');
        setShowReturnModal(false);
        fetchMyOrders();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งคำร้องขอคืนเงิน');
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedOrder.id || !disputeReason.trim()) return;

    try {
      const res = await restfulApi.put(`/api/orders/${selectedOrder.id}/dispute`, {
        disputeReason
      });

      if (res.error) {
        alert(res.error);
      } else {
        alert('เปิดข้อพิพาทสำเร็จแล้ว เจ้าหน้าที่กำลังดำเนินการตรวจสอบเคสของคุณค่ะ');
        setShowDisputeModal(false);
        fetchMyOrders();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเปิดข้อพิพาท');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' น.';
    } catch {
      return '-';
    }
  };

  const getMockTrackingHistory = (order: OrderData) => {
    const orderDate = new Date(order.date);
    
    const history = [
      { title: 'พัสดุถูกส่งมอบให้บริษัทขนส่ง', carrier: order.carrier, timeOffset: 60 },
      { title: 'พัสดุถึงศูนย์คัดแยกสินค้ากรุงเทพฯ', timeOffset: 180 },
      { title: 'พัสดุอยู่ระหว่างการนำจ่ายโดยพนักงาน', timeOffset: 360 },
      { title: 'นำจ่ายสำเร็จ (เซ็นรับโดยคุณ)', timeOffset: 480 }
    ];

    const countToShow = order.status === 'DELIVERED' ? 4 : 3;
    
    return history.slice(0, countToShow).map((item, idx) => {
      const checkInTime = new Date(orderDate.getTime() + item.timeOffset * 60000);
      const displayTime = checkInTime > new Date() ? new Date(Date.now() - (4 - idx) * 10 * 60000) : checkInTime;
      
      return {
        title: item.title + (item.carrier ? ` (${item.carrier})` : ''),
        time: displayTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        date: displayTime.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    }).reverse();
  };

  // Filtering orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Payment method filter
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      <div className="space-y-8 print:hidden">
        {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-8 h-8 text-primary-600" />
            ประวัติการสั่งซื้อสินค้า
          </h1>
          <p className="text-slate-500 text-[16px]">
            ตรวจสอบประวัติการทำรายการสั่งซื้อ ค้นหาใบสั่งซื้อ และจัดการรายการใบเสร็จย้อนหลัง
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        // Empty State
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">ไม่มีประวัติการสั่งซื้อ</h3>
            <p className="text-slate-500 text-[16px]">
              คุณยังไม่เคยทำการซื้อสินค้าผ่านระบบออนไลน์กับเราเลยค่ะ
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-md transition-colors w-full"
          >
            เลือกซื้อสินค้าตอนนี้
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วย เลขที่ใบสั่งซื้อ, ชื่อลูกค้า หรือ ชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 rounded-2xl text-[15px] focus:outline-none focus:bg-white transition-all font-medium text-slate-800"
              />
            </div>

            {/* Payment Filter dropdown */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 rounded-2xl text-[15px] focus:outline-none focus:bg-white transition-all font-bold text-slate-700"
              >
                <option value="all">ช่องทางการชำระทั้งหมด</option>
                <option value="cod">ชำระเงินปลายทาง (COD)</option>
                <option value="qr">ชำระผ่าน QR Code (PromptPay)</option>
              </select>
            </div>

          </div>

          {/* Orders Count and List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[14px] text-slate-400 font-extrabold uppercase tracking-wider">
                ผลการค้นหา {filteredOrders.length} รายการ
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              // Empty search results
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-lg font-bold text-slate-800">ไม่พบคำสั่งซื้อที่ค้นหา</h4>
                <p className="text-slate-500 text-[15px]">
                  ลองค้นหาด้วยคำสำคัญอื่นๆ หรือเปลี่ยนประเภทการชำระเงินค่ะ
                </p>
              </div>
            ) : (
              // List Orders
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.orderNo}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowReceiptModal(true);
                    }}
                    className="bg-white border border-slate-200 hover:border-primary-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 relative group"
                  >
                    
                    {/* Card Header info */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">ใบสั่งซื้อเลขที่:</span>
                        <span className="font-extrabold text-[15px] text-slate-900 group-hover:text-primary-600 transition-colors">
                          {order.orderNo}
                        </span>
                        
                        {/* Copy ID button */}
                        <button
                          onClick={(e) => handleCopyOrderId(order.orderNo, e)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                          title="คัดลอกเลขที่ใบสั่งซื้อ"
                        >
                          {copiedOrderId === order.orderNo ? (
                            <Check className="w-3.5 h-3.5 text-success-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Payment tag & Status Badge */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-slate-400 text-[13px] font-bold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(order.date)}
                        </span>
                        
                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full flex items-center gap-1 border ${
                          order.paymentMethod === 'cod'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-success-50 text-success-700 border-success-100'
                        }`}>
                          {order.paymentMethod === 'cod' ? (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>ปลายทาง (COD)</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>QR Code พร้อมเพย์</span>
                            </>
                          )}
                        </span>

                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                          order.status === 'DELIVERED' ? 'bg-success-50 text-success-700 border-success-100' :
                          order.status === 'CANCELLED' ? 'bg-danger-50 text-danger-700 border-danger-100' :
                          order.status === 'SHIPPED' ? 'bg-primary-50 text-primary-700 border-primary-100' :
                          order.status === 'PREPARING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {order.status === 'DELIVERED' ? 'จัดส่งสำเร็จ' :
                           order.status === 'CANCELLED' ? 'ยกเลิกแล้ว' :
                           order.status === 'SHIPPED' ? 'จัดส่งแล้ว' :
                           order.status === 'PREPARING' ? 'เตรียมจัดส่ง' : 'รอการจัดเตรียม'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body: Items breakdown & details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Products column */}
                      <div className="md:col-span-2 space-y-3">
                        <span className="text-[13px] text-slate-400 font-extrabold uppercase tracking-wide block">
                          รายการสินค้า ({order.items.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น)
                        </span>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-[14px]">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                />
                                <span className="font-extrabold text-slate-800 truncate">
                                  {item.name}
                                </span>
                                <span className="text-slate-400 font-bold">
                                  x{item.quantity}
                                </span>
                              </div>
                              <span className="text-slate-500 font-bold ml-4">
                                {(item.price * item.quantity).toLocaleString()} บาท
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Customer & Total column */}
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-[13px] border border-slate-100 h-fit md:mt-2">
                        <div>
                          <span className="text-slate-400 font-bold block text-xs uppercase tracking-wide">ผู้รับสินค้า</span>
                          <span className="font-extrabold text-slate-800 block truncate">{order.customer.name}</span>
                          <span className="font-medium text-slate-500 block">{order.customer.phone}</span>
                        </div>
                        
                        <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                          <span className="text-slate-400 font-bold text-xs uppercase tracking-wide">ยอดสุทธิ</span>
                          <span className="text-lg font-black text-primary-600">
                            {order.total.toLocaleString()} บาท
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Actions Panel */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100 justify-end">
                      <button
                        type="button"
                        onClick={(e) => handleReorder(order.items, e)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>สั่งซื้ออีกครั้ง (Reorder)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReceiptModal(true);
                        }}
                        className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-[14px] rounded-xl flex items-center gap-1.5 transition-colors border border-primary-100"
                      >
                        <Eye className="w-4 h-4" />
                        <span>ดูใบเสร็จ</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* View Receipt Modal Details */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-none print:static print:block print:w-auto print:h-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-scale-up border border-slate-100 my-8 overflow-hidden print:my-0 print:border-none print:shadow-none print:rounded-none print:static print:block print:w-auto print:h-auto">
            
            {/* Modal Title bar */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100 print:hidden">
              <h3 className="font-extrabold text-[17px] text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-600" />
                ใบเสร็จรับเงิน เลขที่ {selectedOrder.orderNo}
              </h3>
              
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedOrder(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 print:hidden">
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-3.5 px-4 font-black text-sm transition-all border-b-2 ${
                  activeTab === 'tracking'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                ติดตามสถานะและพัสดุ
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`py-3.5 px-4 font-black text-sm transition-all border-b-2 ${
                  activeTab === 'invoice'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                ใบเสร็จรับเงิน
              </button>
            </div>

            {/* Modal scroll area */}
            <div className="max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible p-6">
              {activeTab === 'invoice' || window.matchMedia('print').matches ? (
                <Bill orderData={selectedOrder} />
              ) : (
                /* Tracking Tab Content */
                <div className="space-y-8 py-4 font-['Inter',sans-serif]">
                  
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    selectedOrder.status === 'RETURN_REFUNDED' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                    selectedOrder.status === 'RETURN_REQUESTED' ? 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse' :
                    selectedOrder.status === 'DELIVERED' ? 'bg-success-50 text-success-800 border-success-100' :
                    selectedOrder.status === 'CANCELLED' ? 'bg-danger-50 text-danger-800 border-danger-100' :
                    'bg-primary-50 text-primary-800 border-primary-100'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      {selectedOrder.status === 'RETURN_REFUNDED' ? <RotateCcw className="w-6 h-6 text-emerald-600" /> :
                       selectedOrder.status === 'RETURN_REQUESTED' ? <RotateCcw className="w-6 h-6 text-amber-600" /> :
                       selectedOrder.status === 'DELIVERED' ? <CheckCircle2 className="w-6 h-6 text-success-600" /> :
                       selectedOrder.status === 'CANCELLED' ? <XCircle className="w-6 h-6 text-danger-600" /> :
                       <Package className="w-6 h-6 text-primary-600" />}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">สถานะปัจจุบัน</span>
                      <span className="font-extrabold text-base block">
                        {selectedOrder.status === 'RETURN_REFUNDED' ? 'คืนเงินสำเร็จแล้ว' :
                         selectedOrder.status === 'RETURN_REQUESTED' ? 'ส่งคำขอคืนเงินแล้ว (อยู่ระหว่างตรวจสอบ)' :
                         selectedOrder.status === 'DELIVERED' ? 'จัดส่งพัสดุสำเร็จเรียบร้อยแล้ว' :
                         selectedOrder.status === 'CANCELLED' ? 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว' :
                         selectedOrder.status === 'SHIPPED' ? 'สินค้าได้รับการจัดส่งเรียบร้อยแล้ว' :
                         selectedOrder.status === 'PREPARING' ? 'ร้านค้ากำลังเตรียมบรรจุสินค้า' : 'คำสั่งซื้อรอการจัดเตรียม'}
                      </span>
                    </div>
                  </div>

                  {/* Dispute Status Banner */}
                  {selectedOrder.disputeOpened && (
                    <div className="p-4 bg-orange-50 border border-orange-100 text-orange-800 rounded-2xl flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">ข้อพิพาท (Dispute Case)</span>
                        <span className="font-extrabold text-base block">
                          อยู่ระหว่างการตรวจสอบข้อพิพาท: {selectedOrder.disputeReason}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedOrder.disputeStatus === 'RESOLVED' && (
                    <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">ข้อพิพาท (Dispute Case)</span>
                        <span className="font-extrabold text-base block">
                          ข้อพิพาทได้รับการแก้ไขยุติเคสเรียบร้อยแล้วค่ะ
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Horizontal Progress Timeline */}
                  {selectedOrder.status !== 'CANCELLED' && (
                    <div className="relative flex justify-between items-center w-full px-2 pt-6">
                      {/* Progress Line background */}
                      <div className="absolute left-8 right-8 top-12 h-1 bg-slate-100 -z-10 rounded-full" />
                      
                      {/* Active Progress Line */}
                      <div 
                        className="absolute left-8 top-12 h-1 bg-primary-600 -z-10 rounded-full transition-all duration-500" 
                        style={{
                          width: selectedOrder.status === 'PENDING' ? '0%' :
                                 selectedOrder.status === 'PREPARING' ? '33%' :
                                 selectedOrder.status === 'SHIPPED' ? '66%' : '100%'
                        }}
                      />

                      {/* Steps */}
                      {[
                        { key: 'PENDING', label: 'ยื่นคำสั่งซื้อ', icon: ShoppingBag },
                        { key: 'PREPARING', label: 'เตรียมจัดเตรียม', icon: Package },
                        { key: 'SHIPPED', label: 'จัดส่งแล้ว', icon: Truck },
                        { key: 'DELIVERED', label: 'นำส่งสำเร็จ', icon: CheckCircle2 }
                      ].map((step, idx) => {
                        const statuses = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'];
                        const currentIdx = statuses.indexOf(selectedOrder.status || 'PENDING');
                        const isActive = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center space-y-2.5 flex-1 relative">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                              isCurrent ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100 scale-110 z-10' :
                              isActive ? 'bg-primary-50 text-primary-600 border-primary-200' :
                              'bg-white text-slate-300 border-slate-200'
                            }`}>
                              <StepIcon className="w-5.5 h-5.5" />
                            </div>
                            <span className={`text-[12px] font-black text-center max-w-[80px] leading-tight ${
                              isActive ? 'text-slate-800' : 'text-slate-300'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Shipping Info & Checkpoint Timeline */}
                  {(selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED') && (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-6">
                      
                      {/* Carrier & Tracking details */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                        <div>
                          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">ผู้ให้บริการจัดส่ง</span>
                          <span className="font-extrabold text-base text-slate-900">{selectedOrder.carrier}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">เลขพัสดุจัดส่ง (Tracking No.)</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-extrabold text-base text-primary-600 select-all">{selectedOrder.trackingNumber}</span>
                            <button
                              onClick={() => {
                                if (selectedOrder.trackingNumber) {
                                  navigator.clipboard.writeText(selectedOrder.trackingNumber);
                                  alert('คัดลอกเลขพัสดุเรียบร้อยแล้วค่ะ');
                                }
                              }}
                              className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors border border-slate-300"
                              title="คัดลอกเลขพัสดุ"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Parcel Activity Timeline */}
                      <div className="space-y-5">
                        <span className="text-[13px] text-slate-400 font-extrabold uppercase tracking-wider block">ความเคลื่อนไหวพัสดุ</span>
                        
                        <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
                          {getMockTrackingHistory(selectedOrder).map((item, idx) => (
                            <div key={idx} className="relative">
                              {/* Connector dot */}
                              <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                                idx === 0 ? 'bg-primary-600 scale-125 shadow-md shadow-primary-50' : 'bg-slate-300'
                              }`} />
                              
                              <div className="space-y-0.5">
                                <span className={`text-[13px] font-black block leading-snug ${
                                  idx === 0 ? 'text-slate-900 font-extrabold' : 'text-slate-600'
                                }`}>
                                  {item.title}
                                </span>
                                <span className="text-[11px] text-slate-400 font-bold block">
                                  {item.date} • {item.time}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Order Items Summary */}
                  <div className="space-y-3.5">
                    <span className="text-[13px] text-slate-400 font-extrabold uppercase tracking-wider block">สรุปสินค้าที่สั่งซื้อ</span>
                    <div className="border border-slate-200 rounded-3xl p-5 space-y-3.5 bg-white">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-800 block truncate">{item.name}</span>
                              {item.variant && <span className="text-[10px] text-primary-600 font-bold block">ตัวเลือก: {item.variant}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-slate-400 text-xs font-semibold block">{item.quantity} x {item.price.toLocaleString()} บาท</span>
                              <span className="font-extrabold text-slate-900">{(item.price * item.quantity).toLocaleString()} บาท</span>
                            </div>
                            
                            {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'RETURN_REQUESTED' || selectedOrder.status === 'RETURN_REFUNDED') && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenReviewModal(item.id, item.name, e)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-all shadow-sm flex-shrink-0"
                              >
                                เขียนรีวิว
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Modal footer actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 print:hidden">
              {/* Return Request Button */}
              {selectedOrder.status === 'DELIVERED' && !selectedOrder.returnReason && (
                <button
                  type="button"
                  onClick={() => {
                    setReturnReason('สินค้าชำรุดเสียหาย');
                    setReturnDescription('');
                    setShowReturnModal(true);
                  }}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-100 transition-colors mr-auto"
                >
                  ขอคืนเงิน / คืนสินค้า
                </button>
              )}

              {/* Open Dispute Button (if return was rejected, or custom dispute) */}
              {((selectedOrder.status === 'DELIVERED' && selectedOrder.returnReason) || 
                (selectedOrder.status === 'RETURN_REQUESTED')) && 
                !selectedOrder.disputeOpened && 
                selectedOrder.disputeStatus !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => {
                    setDisputeReason('');
                    setShowDisputeModal(true);
                  }}
                  className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl border border-orange-100 transition-colors mr-auto"
                >
                  เปิดข้อพิพาท (Open Dispute)
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบเสร็จ (Print)</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedOrder(null);
                }}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-50"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Write Product Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-800">เขียนรีวิวสินค้า</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5 mt-4">
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">สินค้าที่รีวิว</span>
                <span className="font-extrabold text-sm text-slate-800 block mt-0.5">{reviewProductName}</span>
              </div>

              {/* Star Rating selector */}
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1.5">คะแนนความพึงพอใจ *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform p-1"
                    >
                      <Star
                        className="w-8 h-8"
                        fill={star <= reviewRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1">แสดงความคิดเห็น *</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="แบ่งปันความรู้สึกของคุณต่อสินค้านี้ เช่น คุณภาพของสินค้า รสชาติ หรือความคุ้มค่า..."
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 rounded-2xl text-[14px] focus:outline-none focus:bg-white transition-all font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                >
                  ส่งความคิดเห็น
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Return/Refund Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-800">ยื่นคำร้องขอคืนเงิน / คืนสินค้า</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-5 mt-4">
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1">เหตุผลการขอคืนสินค้า *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-primary-400 rounded-2xl text-[14px] focus:outline-none focus:bg-white transition-all font-bold text-slate-700"
                >
                  <option value="สินค้าชำรุดเสียหาย">สินค้าชำรุดเสียหาย</option>
                  <option value="สินค้าไม่ตรงตามคำอธิบาย">สินค้าไม่ตรงตามรายละเอียดที่ระบุ</option>
                  <option value="ได้รับสินค้าไม่ครบถ้วน">ได้รับจำนวนสินค้าไม่ครบถ้วน</option>
                  <option value="อื่นๆ">อื่นๆ (กรุณาระบุด้านล่าง)</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  rows={4}
                  placeholder="อธิบายปัญหาเพิ่มเติมเพื่อประกอบการพิจารณาตรวจสอบของทางร้าน เช่น สินค้าบุบ เสียหาย หรือหมดอายุ..."
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 rounded-2xl text-[14px] focus:outline-none focus:bg-white transition-all font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                >
                  ส่งคำขอคืนเงิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open Dispute Modal */}
      {showDisputeModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-800">เปิดข้อพิพาท (Open Dispute)</h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-5 mt-4">
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1">เหตุผลในการเปิดข้อพิพาท *</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={5}
                  placeholder="กรุณากรอกเหตุผลที่คุณต้องการคัดค้านผลการตัดสินคืนเงิน หรือปัญหาการบริการอื่นๆ เพื่อให้เจ้าหน้าที่ตรวจสอบใหม่อีกครั้ง..."
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 rounded-2xl text-[14px] focus:outline-none focus:bg-white transition-all font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!disputeReason.trim()}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                >
                  ยื่นข้อพิพาท
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
