import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, Search, Calendar, CreditCard, Truck, ShoppingBag, 
  RotateCcw, Copy, Check, Eye, AlertCircle
} from 'lucide-react';
import { OrderData, OrderItem } from './Bill';
import { restfulApi, RawOrder } from '../../../shared/services/api';
import { useAuth } from '../../auth/hooks/useAuth';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'qr'>('all');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  
  

  const fetchMyOrders = useCallback(async () => {
    try {
      const res = await restfulApi.get<RawOrder[]>('/api/orders/my');
      if (res.data) {
        const formattedOrders: OrderData[] = res.data.map((order) => {
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
            items: order.items.map((item) => ({
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
  }, [user]);

  useEffect(() => {
    fetchMyOrders();

    const handleOrdersUpdated = () => {
      fetchMyOrders();
    };
    window.addEventListener('orders-updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders-updated', handleOrdersUpdated);
    };
  }, [fetchMyOrders]);

  

  // Redirect to order details page based on orderNo query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderNoParam = searchParams.get('orderNo');
    if (orderNoParam && orders.length > 0) {
      const matchingOrder = orders.find(o => o.orderNo === orderNoParam);
      if (matchingOrder) {
        navigate(`/orders/${matchingOrder.id || matchingOrder.orderNo}`, { replace: true });
      }
    }
  }, [orders, navigate]);

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
                onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'cod' | 'qr')}
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
                    onClick={() => navigate(`/orders/${order.id || order.orderNo}`)}
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
                        onClick={() => navigate(`/orders/${order.id || order.orderNo}`)}
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

    </div>
  );
};
