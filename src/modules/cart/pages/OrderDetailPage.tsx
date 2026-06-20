import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  History, Truck, ShoppingBag, 
  Printer, RotateCcw, Copy, Check, X, AlertCircle, 
  Package, CheckCircle2, XCircle, Star, ArrowLeft
} from 'lucide-react';
import Bill, { OrderData, OrderItem } from './Bill';
import { restfulApi } from '../../../shared/services/api';
import { useAuth } from '../../auth/hooks/useAuth';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracking' | 'invoice'>('tracking');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

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

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await restfulApi.get<any[]>('/api/orders/my');
      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.data) {
        const rawOrder = res.data.find(o => o.id === id || o.orderNo === id);
        if (!rawOrder) {
          setError('ไม่พบข้อมูลคำสั่งซื้อดังกล่าว');
          return;
        }

        // Process coin refund if applicable
        if (rawOrder.status === 'RETURN_REFUNDED' && rawOrder.coinsUsed > 0 && user) {
          const processedKey = `app_refunded_coins_processed_${user.username}`;
          try {
            const processedList = JSON.parse(localStorage.getItem(processedKey) || '[]');
            if (!processedList.includes(rawOrder.id)) {
              const coinsKey = `app_user_coins_${user.username}`;
              const currentCoins = Number(localStorage.getItem(coinsKey) || '150');
              const nextCoins = currentCoins + rawOrder.coinsUsed;
              localStorage.setItem(coinsKey, nextCoins.toString());
              processedList.push(rawOrder.id);
              localStorage.setItem(processedKey, JSON.stringify(processedList));
              window.dispatchEvent(new Event('coins-updated'));
            }
          } catch (err) {
            console.error('Failed to process coin refund', err);
          }
        }

        const formattedOrder: OrderData = {
          id: rawOrder.id,
          orderNo: rawOrder.orderNo,
          date: rawOrder.createdAt || new Date().toISOString(),
          items: rawOrder.items.map((item: any) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            category: item.category,
            variant: item.variant || null
          })),
          total: rawOrder.total,
          discount: rawOrder.discount,
          coinsUsed: rawOrder.coinsUsed,
          promoCode: rawOrder.promoCode || null,
          customer: {
            name: rawOrder.customer.name,
            phone: rawOrder.customer.phone,
            address: rawOrder.customer.address
          },
          paymentMethod: rawOrder.paymentMethod?.toLowerCase() === 'cod' ? 'cod' : 'qr',
          slipUploaded: rawOrder.slipUploaded,
          slipName: rawOrder.slipName,
          status: rawOrder.status || 'PENDING',
          trackingNumber: rawOrder.trackingNumber,
          carrier: rawOrder.carrier,
          returnReason: rawOrder.returnReason,
          returnDescription: rawOrder.returnDescription,
          disputeOpened: rawOrder.disputeOpened,
          disputeReason: rawOrder.disputeReason,
          disputeStatus: rawOrder.disputeStatus
        };

        setOrder(formattedOrder);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id, user]);

  const handleCopyOrderId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(text);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getMockTrackingHistory = (ord: OrderData) => {
    const orderDate = new Date(ord.date);
    const history = [
      { title: 'พัสดุถูกส่งมอบให้บริษัทขนส่ง', carrier: ord.carrier, timeOffset: 60 },
      { title: 'พัสดุถึงศูนย์คัดแยกสินค้ากรุงเทพฯ', timeOffset: 180 },
      { title: 'พัสดุอยู่ระหว่างการนำจ่ายโดยพนักงาน', timeOffset: 360 },
      { title: 'นำจ่ายสำเร็จ (เซ็นรับโดยคุณ)', timeOffset: 480 }
    ];

    const countToShow = ord.status === 'DELIVERED' ? 4 : 3;
    
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

  const handleOpenReviewModal = (productId: string, productName: string) => {
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
    if (!order || !order.id) return;

    try {
      const res = await restfulApi.put(`/api/orders/${order.id}/return`, {
        returnReason,
        returnDescription
      });

      if (res.error) {
        alert(res.error);
      } else {
        alert('ส่งคำร้องขอคืนเงินเรียบร้อยแล้วค่ะ แอดมินจะตรวจสอบโดยเร็วที่สุด');
        setShowReturnModal(false);
        fetchOrderDetails();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งคำร้องขอคืนเงิน');
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !order.id || !disputeReason.trim()) return;

    try {
      const res = await restfulApi.put(`/api/orders/${order.id}/dispute`, {
        disputeReason
      });

      if (res.error) {
        alert(res.error);
      } else {
        alert('เปิดข้อพิพาทสำเร็จแล้ว เจ้าหน้าที่กำลังดำเนินการตรวจสอบเคสของคุณค่ะ');
        setShowDisputeModal(false);
        fetchOrderDetails();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเปิดข้อพิพาท');
    }
  };

  const handleReorder = async (items: OrderItem[]) => {
    try {
      for (const item of items) {
        await restfulApi.post('/api/cart', {
          productId: item.id,
          quantity: item.quantity,
          variantName: item.variant
        });
      }
      window.dispatchEvent(new Event('cart-updated'));
      alert('เพิ่มสินค้าทั้งหมดในคำสั่งซื้อนี้ลงในตะกร้าเรียบร้อยแล้วค่ะ! 🛒');
      navigate('/cart');
    } catch (err) {
      console.error('Reorder error', err);
      alert('ไม่สามารถเพิ่มสินค้าลงในตะกร้าได้ในขณะนี้');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-extrabold text-[15px]">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm my-6">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto" />
        <h3 className="text-lg font-black text-slate-900">เกิดข้อผิดพลาด</h3>
        <p className="text-slate-500 text-sm font-semibold">{error || 'ไม่พบข้อมูลคำสั่งซื้อดังกล่าวในระบบ'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-6 py-2.5 rounded-2xl transition-colors text-xs cursor-pointer"
        >
          กลับไปหน้ารายการสั่งซื้อ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 print:pb-0">
      
      {/* Toast Alert for copy */}
      {copiedOrderId && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 text-xs font-bold">
          <Check className="w-4 h-4 text-success-500" />
          <span>คัดลอกรหัสเรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/orders')}
            className="w-10 h-10 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <History className="w-5.5 h-5.5 text-primary-600" />
              คำสั่งซื้อ {order.orderNo}
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              สั่งซื้อเมื่อ {new Date(order.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleReorder(order.items)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>สั่งซื้ออีกครั้ง</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-primary-100 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ใบเสร็จ (Print)</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 print:hidden">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-4 px-5 font-black text-[15px] transition-all border-b-2 -mb-[1px] cursor-pointer ${
              activeTab === 'tracking'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ติดตามสถานะและพัสดุ
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`py-4 px-5 font-black text-[15px] transition-all border-b-2 -mb-[1px] cursor-pointer ${
              activeTab === 'invoice'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ใบเสร็จรับเงิน
          </button>
        </div>

        {/* Content Pane */}
        <div className="p-6 sm:p-8">
          {activeTab === 'invoice' || window.matchMedia('print').matches ? (
            <Bill orderData={order} />
          ) : (
            <div className="space-y-8">
              
              {/* Status Banner */}
              <div className={`p-5 rounded-2xl flex items-center gap-4 border ${
                order.status === 'RETURN_REFUNDED' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                order.status === 'RETURN_REQUESTED' ? 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse' :
                order.status === 'DELIVERED' ? 'bg-success-50 text-success-800 border-success-100' :
                order.status === 'CANCELLED' ? 'bg-danger-50 text-danger-800 border-danger-100' :
                'bg-primary-50 text-primary-800 border-primary-100'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
                  {order.status === 'RETURN_REFUNDED' ? <RotateCcw className="w-6 h-6 text-emerald-600" /> :
                   order.status === 'RETURN_REQUESTED' ? <RotateCcw className="w-6 h-6 text-amber-600" /> :
                   order.status === 'DELIVERED' ? <CheckCircle2 className="w-6 h-6 text-success-600" /> :
                   order.status === 'CANCELLED' ? <XCircle className="w-6 h-6 text-danger-600" /> :
                   <Package className="w-6 h-6 text-primary-600" />}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">สถานะพัสดุสินค้า</span>
                  <span className="font-black text-base sm:text-lg block">
                    {order.status === 'RETURN_REFUNDED' ? 'คืนเงินสำเร็จแล้ว' :
                     order.status === 'RETURN_REQUESTED' ? 'ส่งคำขอคืนเงินแล้ว (อยู่ระหว่างตรวจสอบ)' :
                     order.status === 'DELIVERED' ? 'จัดส่งพัสดุสำเร็จเรียบร้อยแล้ว' :
                     order.status === 'CANCELLED' ? 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว' :
                     order.status === 'SHIPPED' ? 'สินค้าได้รับการจัดส่งเรียบร้อยแล้ว' :
                     order.status === 'PREPARING' ? 'ร้านค้ากำลังเตรียมบรรจุสินค้า' : 'คำสั่งซื้อรอการจัดเตรียม'}
                  </span>
                </div>
              </div>

              {/* Dispute Open Case info */}
              {order.disputeOpened && (
                <div className="p-4 bg-orange-50 border border-orange-100 text-orange-800 rounded-2xl flex items-center gap-3 animate-pulse">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-orange-400 font-bold block uppercase tracking-wider">ข้อพิพาท (Dispute Case)</span>
                    <span className="font-extrabold text-sm block">
                      อยู่ระหว่างการตรวจสอบข้อพิพาท: {order.disputeReason}
                    </span>
                  </div>
                </div>
              )}

              {order.disputeStatus === 'RESOLVED' && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">ข้อพิพาท (Dispute Case)</span>
                    <span className="font-extrabold text-sm block">
                      ข้อพิพาทได้รับการแก้ไขยุติเคสเรียบร้อยแล้วค่ะ
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Timeline */}
              {order.status !== 'CANCELLED' && (
                <div className="relative flex justify-between items-center w-full px-4 pt-4 pb-8 border-b border-slate-100">
                  <div className="absolute left-10 right-10 top-10 h-1.5 bg-slate-100 -z-10 rounded-full" />
                  <div 
                    className="absolute left-10 top-10 h-1.5 bg-primary-600 -z-10 rounded-full transition-all duration-500" 
                    style={{
                      width: order.status === 'PENDING' ? '0%' :
                             order.status === 'PREPARING' ? '33%' :
                             order.status === 'SHIPPED' ? '66%' : '100%'
                    }}
                  />

                  {[
                    { key: 'PENDING', label: 'ยื่นคำสั่งซื้อ', icon: ShoppingBag },
                    { key: 'PREPARING', label: 'จัดเตรียมพัสดุ', icon: Package },
                    { key: 'SHIPPED', label: 'จัดส่งแล้ว', icon: Truck },
                    { key: 'DELIVERED', label: 'นำส่งสำเร็จ', icon: CheckCircle2 }
                  ].map((step, idx) => {
                    const statuses = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'];
                    const currentIdx = statuses.indexOf(order.status || 'PENDING');
                    const isActive = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center space-y-3 flex-1">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                          isCurrent ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-110 z-10' :
                          isActive ? 'bg-primary-50 text-primary-600 border-primary-200' :
                          'bg-white text-slate-300 border-slate-200'
                        }`}>
                          <StepIcon className="w-5.5 h-5.5" />
                        </div>
                        <span className={`text-[12px] font-black text-center max-w-[85px] leading-tight ${
                          isActive ? 'text-slate-800' : 'text-slate-300'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Shipping Details */}
              {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">ผู้ให้บริการขนส่ง</span>
                      <span className="font-extrabold text-base text-slate-900">{order.carrier}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">เลขพัสดุจัดส่ง (Tracking ID)</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-extrabold text-base text-primary-600 select-all">{order.trackingNumber}</span>
                        <button
                          onClick={() => {
                            if (order.trackingNumber) {
                              handleCopyOrderId(order.trackingNumber);
                            }
                          }}
                          className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 border border-slate-300 transition-colors cursor-pointer"
                          title="คัดลอกเลขพัสดุ"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">เส้นทางนำส่งพัสดุ</span>
                    <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
                      {getMockTrackingHistory(order).map((item, idx) => (
                        <div key={idx} className="relative">
                          <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                            idx === 0 ? 'bg-primary-600 scale-125 shadow-md' : 'bg-slate-300'
                          }`} />
                          <div className="space-y-0.5">
                            <span className={`text-[13px] font-black block leading-snug ${
                              idx === 0 ? 'text-slate-900' : 'text-slate-600'
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

              {/* Order Items */}
              <div className="space-y-4">
                <span className="text-[13px] text-slate-400 font-extrabold uppercase tracking-wider block">สินค้าในคำสั่งซื้อนี้</span>
                <div className="border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 bg-white shadow-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-800 block truncate">{item.name}</span>
                          {item.variant && (
                            <span className="text-[10px] text-primary-600 font-bold block mt-0.5">
                              ตัวเลือก: {item.variant}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-slate-400 text-xs font-semibold block">
                            {item.quantity} x ฿{item.price.toLocaleString()}
                          </span>
                          <span className="font-extrabold text-slate-900">
                            ฿{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        
                        {(order.status === 'DELIVERED' || order.status === 'RETURN_REQUESTED' || order.status === 'RETURN_REFUNDED') && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(item.id, item.name)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-all shadow-xs cursor-pointer flex-shrink-0"
                          >
                            เขียนรีวิว
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Dispute/Return Panel */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
                {order.status === 'DELIVERED' && !order.returnReason && (
                  <button
                    type="button"
                    onClick={() => {
                      setReturnReason('สินค้าชำรุดเสียหาย');
                      setReturnDescription('');
                      setShowReturnModal(true);
                    }}
                    className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl border border-rose-100 transition-colors cursor-pointer mr-auto text-xs"
                  >
                    ขอคืนเงิน / คืนสินค้า
                  </button>
                )}

                {((order.status === 'DELIVERED' && order.returnReason) || 
                  (order.status === 'RETURN_REQUESTED')) && 
                  !order.disputeOpened && 
                  order.disputeStatus !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDisputeReason('');
                      setShowDisputeModal(true);
                    }}
                    className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold rounded-xl border border-orange-100 transition-colors cursor-pointer mr-auto text-xs"
                  >
                    เปิดข้อพิพาท (Open Dispute)
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Write Product Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-800">เขียนรีวิวสินค้า</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200"
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
                      className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-[14px] font-bold text-slate-700 mb-1.5">ความคิดเห็นของคุณ *</label>
                <textarea
                  id="comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="เขียนแชร์ความประทับใจ หรือข้อเสนอแนะเกี่ยวกับสินค้าชิ้นนี้ได้เลยค่ะ..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-md shadow-primary-50 cursor-pointer text-xs sm:text-sm"
                >
                  บันทึกรีวิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-800">ส่งคำร้องขอคืนเงิน / คืนสินค้า</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-5 mt-4">
              <div>
                <label htmlFor="returnReason" className="block text-[14px] font-bold text-slate-700 mb-1.5">เหตุผลการขอคืนเงิน *</label>
                <select
                  id="returnReason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-primary-500 cursor-pointer font-bold"
                >
                  <option value="สินค้าชำรุดเสียหาย">สินค้าชำรุดเสียหาย / เน่าเสียก่อนถึงปลายทาง</option>
                  <option value="ได้รับสินค้าไม่ครบ">ได้รับสินค้าไม่ครบถ้วน / ขาดตกหล่นบางรายการ</option>
                  <option value="ได้รับสินค้าผิดชนิด">ได้รับสินค้าผิดประเภท / ไม่ตรงตามที่ระบุในคำสั่งซื้อ</option>
                  <option value="บริการขนส่งล่าช้าเกินกำหนด">สินค้าเน่าเสียเพราะบริการขนส่งล่าช้าเกินกำหนด</option>
                </select>
              </div>

              <div>
                <label htmlFor="returnDesc" className="block text-[14px] font-bold text-slate-700 mb-1.5">รายละเอียดเพิ่มเติม</label>
                <textarea
                  id="returnDesc"
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="เขียนแชร์รายละเอียดความเสียหาย เช่น ผักเน่าเสียกี่ชิ้น หรือกล่องชำรุด เพื่อประกอบการพิจารณา..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-md shadow-primary-50 cursor-pointer text-xs sm:text-sm"
                >
                  ส่งคำร้องขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-800">เปิดข้อพิพาท (Open Dispute Case)</h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-5 mt-4">
              <div className="bg-orange-50 border border-orange-100 text-orange-800 p-4 rounded-2xl text-xs space-y-1 font-semibold leading-relaxed">
                <div className="font-black text-sm text-orange-900 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> ข้อแนะนำการเปิดข้อพิพาท
                </div>
                <p>การเปิดข้อพิพาทใช้สำหรับกรณีที่คุณส่งคำขอคืนเงินแล้ว แต่อยากให้เจ้าหน้าที่กลางของ FRIST SHOP เป็นผู้ไกล่เกลี่ยหรือต้องการยื่นหลักฐานร้องเรียนเพิ่มเติมแบบเร่งด่วน</p>
              </div>

              <div>
                <label htmlFor="disputeReason" className="block text-[14px] font-bold text-slate-700 mb-1.5">เหตุผลในการเปิดข้อพิพาท *</label>
                <textarea
                  id="disputeReason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="เขียนแชร์รายละเอียดหรือเหตุผลที่คุณประสงค์จะเปิดข้อพิพาทเพื่อนำเสนอแอดมินกลาง..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-md shadow-primary-50 cursor-pointer text-xs sm:text-sm"
                >
                  ยืนยันเปิดข้อพิพาท
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
