import React, { useState, useEffect } from 'react';
import { restfulApi, Promotion, Product } from '../../../shared/services/api';
import { Plus, Edit2, Trash2, X, AlertCircle, FolderOpen, RefreshCw, Calendar, Tag, Layers, Flame, ShoppingBag } from 'lucide-react';
import { Pagination } from '../../../shared/components/ui/Pagination';

export const ManagePromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 3 items per page to show paginator clearly

  // Reset pagination on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '0',
    imageUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
    type: 'COUPON',
    productIds: [] as string[],
    bundleQty: '2',
    targetCategory: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Extract unique categories from products list
  const categoriesList = allProducts.length > 0
    ? Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean)
    : ['อาหารแห้งและเครื่องปรุง', 'ของหวาน/เบเกอรี่', 'เครื่องดื่ม', 'ผักและผลไม้สด'];

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restfulApi.get<Promotion[]>('/api/promotions');
      if (response.error) {
        setError(response.error);
      } else {
        setPromotions(response.data || []);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลโปรโมชั่นได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await restfulApi.get<Product[]>('/api/products');
      if (!response.error && response.data) {
        setAllProducts(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch products for promotion configuration:', err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchAllProducts();
  }, []);

  const openAddModal = () => {
    setEditingPromotion(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '0',
      imageUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      type: 'COUPON',
      productIds: [],
      bundleQty: '2',
      targetCategory: categoriesList[0] || 'อาหารแห้งและเครื่องปรุง',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description,
      discountType: (promo.discountType || 'percentage').toLowerCase(),
      discountValue: promo.discountValue.toString(),
      minPurchase: promo.minPurchase.toString(),
      imageUrl: promo.imageUrl || '',
      startDate: promo.startDate,
      endDate: promo.endDate,
      isActive: promo.isActive,
      type: promo.type || 'COUPON',
      productIds: promo.productIds || [],
      bundleQty: promo.bundleQty ? promo.bundleQty.toString() : '2',
      targetCategory: promo.targetCategory || categoriesList[0] || 'อาหารแห้งและเครื่องปรุง',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบโปรโมชั่น "${name}" ออกจากระบบจริงหรือไม่?`)) return;

    try {
      const res = await restfulApi.delete<string>(`/api/promotions/${id}`);
      if (res.error) {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      } else {
        fetchPromotions(); // Refresh list
      }
    } catch {
      alert('ไม่สามารถทำรายการลบโปรโมชั่นได้ในขณะนี้');
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      const payload = {
        ...promo,
        discountType: promo.discountType.toUpperCase() as 'PERCENTAGE' | 'FIXED',
        isActive: !promo.isActive,
      };
      const res = await restfulApi.put<Promotion>(`/api/promotions/${promo.id}`, payload);
      if (res.error) {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      } else {
        fetchPromotions(); // Refresh list
      }
    } catch {
      alert('ไม่สามารถอัปเดตสถานะโปรโมชั่นได้');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleProductSelectToggle = (productId: string) => {
    setFormData(prev => {
      const isSelected = prev.productIds.includes(productId);
      const updated = isSelected
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId];
      return { ...prev, productIds: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!formData.code.trim()) {
      setFormError('กรุณากรอกรหัสโปรโมชั่น');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('กรุณากรอกชื่อโปรโมชั่น');
      return;
    }
    const val = Number(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError('กรุณากรอกมูลค่าส่วนลดเป็นตัวเลขที่มากกว่า 0');
      return;
    }
    if (formData.discountType === 'percentage' && val > 100) {
      setFormError('สำหรับส่วนลดเป็นเปอร์เซ็นต์ มูลค่าห้ามเกิน 100%');
      return;
    }
    if (formData.type === 'COUPON' && (isNaN(Number(formData.minPurchase)) || Number(formData.minPurchase) < 0)) {
      setFormError('กรุณากรอกมูลค่าซื้อขั้นต่ำเป็นตัวเลขตั้งแต่ 0 ขึ้นไป');
      return;
    }
    if ((formData.type === 'FLASH_SALE' || formData.type === 'BUNDLE_DEAL') && formData.productIds.length === 0) {
      setFormError('กรุณาเลือกสินค้าเข้าร่วมแคมเปญอย่างน้อย 1 ชิ้น');
      return;
    }
    if (formData.type === 'BUNDLE_DEAL' && (isNaN(Number(formData.bundleQty)) || Number(formData.bundleQty) < 2)) {
      setFormError('จำนวนสั่งซื้อขั้นต่ำสำหรับ Bundle Deal ต้องไม่ต่ำกว่า 2 ชิ้น');
      return;
    }
    if (formData.type === 'DISCOUNT_CAMPAIGN' && !formData.targetCategory) {
      setFormError('กรุณาระบุหมวดหมู่เป้าหมายสำหรับแคมเปญ');
      return;
    }
    if (!formData.startDate) {
      setFormError('กรุณาระบุวันเริ่มต้นโปรโมชั่น');
      return;
    }
    if (!formData.endDate) {
      setFormError('กรุณาระบุวันสิ้นสุดโปรโมชั่น');
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormError('วันเริ่มต้นโปรโมชั่นต้องไม่ช้ากว่าวันสิ้นสุดโปรโมชั่น');
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType.toUpperCase() as 'PERCENTAGE' | 'FIXED',
        discountValue: Number(formData.discountValue),
        minPurchase: formData.type === 'COUPON' ? Number(formData.minPurchase) : 0,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        type: formData.type,
        productIds: (formData.type === 'FLASH_SALE' || formData.type === 'BUNDLE_DEAL') ? formData.productIds : [],
        bundleQty: formData.type === 'BUNDLE_DEAL' ? Number(formData.bundleQty) : null,
        targetCategory: formData.type === 'DISCOUNT_CAMPAIGN' ? formData.targetCategory : null,
      };

      let result;
      if (editingPromotion) {
        // Edit Mode
        result = await restfulApi.put<Promotion>(`/api/promotions/${editingPromotion.id}`, payload);
      } else {
        // Add Mode
        result = await restfulApi.post<Promotion>('/api/promotions', payload);
      }

      if (result.error) {
        setFormError(result.error);
      } else {
        setModalOpen(false);
        fetchPromotions(); // Refresh list
      }
    } catch (err) {
      setFormError('ไม่สามารถบันทึกข้อมูลโปรโมชั่นได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter logic
  const filteredPromotions = promotions.filter(p =>
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper to format date
  const formatThaiDateShort = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to render type badge
  const renderTypeBadge = (type?: string) => {
    switch (type) {
      case 'FLASH_SALE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-black uppercase">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            Flash Sale
          </span>
        );
      case 'BUNDLE_DEAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-black uppercase">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Bundle Deal
          </span>
        );
      case 'DISCOUNT_CAMPAIGN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-black uppercase">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />
            Campaign
          </span>
        );
      case 'COUPON':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-200 text-pink-700 rounded-xl text-xs font-black uppercase">
            <Tag className="w-3.5 h-3.5 text-pink-500" />
            คูปองร้านค้า
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900">การจัดการโปรโมชั่น</h1>
          <p className="text-slate-500 text-[16px]">เพิ่ม แก้ไข หรือเปิด/ปิดใช้งาน โค้ดส่วนลด Flash Sale, Bundle Deal และแคมเปญต่างๆ</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-6 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-pink-50 hover:shadow-pink-100 transition-all min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มโปรโมชั่นใหม่</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาโปรโมชั่นด้วยรหัสโค้ด หรือชื่อ..."
            className="w-full pl-5 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[17px] focus:bg-white focus:border-primary-500 transition-all"
          />
        </div>

        <div className="text-[15px] font-bold text-slate-500">
          พบโปรโมชั่นทั้งหมด <span className="text-pink-600 font-extrabold text-lg">{filteredPromotions.length}</span> รายการ
        </div>
      </div>

      {/* Main content table */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center">
          <div className="w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-500 font-medium">กำลังโหลดข้อมูลโปรโมชั่น...</span>
        </div>
      ) : error ? (
        <div className="bg-danger-50 border-l-4 border-danger-500 p-6 rounded-r-3xl text-center">
          <p className="text-danger-700 font-bold mb-4">{error}</p>
          <button
            onClick={fetchPromotions}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-2xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> ลองใหม่
          </button>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบรายการโปรโมชั่น</h3>
          <p className="text-slate-500 mb-4">ไม่มีรายการโปรโมชั่นที่ตรงกับเงื่อนไขในระบบ ลองเพิ่มโปรโมชั่นใหม่ดูนะคะ</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[15px]">
                  <th className="p-5 pl-8">รูปภาพ</th>
                  <th className="p-5">ประเภท / รหัสโค้ด</th>
                  <th className="p-5">รายละเอียดโปรโมชั่น</th>
                  <th className="p-5">เงื่อนไขส่วนลด</th>
                  <th className="p-5 text-center">ระยะเวลาแคมเปญ</th>
                  <th className="p-5 text-center">สถานะการทำงาน</th>
                  <th className="p-5 pr-8 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[16px] text-slate-700 font-medium">
                {paginatedPromotions.map((p) => {
                  const isPercent = p.discountType === 'PERCENTAGE' || p.discountType === 'percentage';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Image */}
                      <td className="p-5 pl-8">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      </td>

                      {/* Type & Code */}
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5">
                          {renderTypeBadge(p.type)}
                          <span className="w-fit px-3 py-1 bg-pink-50 border border-pink-100 text-pink-700 rounded-xl font-black tracking-wider text-sm">
                            {p.code}
                          </span>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="p-5 font-bold text-slate-900">
                        <div>
                          <span>{p.name}</span>
                          <span className="block text-[13px] text-slate-400 font-normal line-clamp-1 mt-0.5 max-w-xs">
                            {p.description || 'ไม่มีรายละเอียด'}
                          </span>
                          {/* Display target items based on type */}
                          {p.type === 'FLASH_SALE' && p.productIds && (
                            <span className="block text-xs text-amber-600 font-semibold mt-1">
                              สินค้าเข้าร่วม: {p.productIds.length} รายการ
                            </span>
                          )}
                          {p.type === 'BUNDLE_DEAL' && p.productIds && (
                            <span className="block text-xs text-indigo-600 font-semibold mt-1">
                              ซื้อขั้นต่ำ: {p.bundleQty} ชิ้น (สินค้าเข้าร่วม: {p.productIds.length} รายการ)
                            </span>
                          )}
                          {p.type === 'DISCOUNT_CAMPAIGN' && p.targetCategory && (
                            <span className="block text-xs text-purple-600 font-semibold mt-1">
                              หมวดหมู่: {p.targetCategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Discount Conditions */}
                      <td className="p-5">
                        <div>
                          <span className="font-bold text-slate-900 block text-[17px]">
                            {isPercent ? `ลด ${p.discountValue}%` : `ลด ${p.discountValue} บาท`}
                          </span>
                          <span className="block text-[12px] text-slate-400 font-medium">
                            {p.type === 'COUPON' ? (p.minPurchase > 0 ? `ขั้นต่ำ ${p.minPurchase.toLocaleString()} บาท` : 'ไม่มีขั้นต่ำ') : 'ลดราคาอัตโนมัติ'}
                          </span>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="p-5 text-center">
                        <div className="inline-flex flex-col items-center justify-center text-xs font-bold text-slate-500 gap-0.5 bg-slate-100/70 p-2 rounded-xl border border-slate-200/50">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatThaiDateShort(p.startDate)}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">ถึง</span>
                          <span>{formatThaiDateShort(p.endDate)}</span>
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                            p.isActive
                              ? 'bg-success-50 hover:bg-success-100 text-success-700 border border-success-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200'
                          }`}
                          title="คลิกเพื่อสลับสถานะเปิด/ปิดการใช้งาน"
                        >
                          {p.isActive ? 'เปิดการใช้งาน' : 'ปิดการใช้งาน'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-5 pr-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                            title="แก้ไขรายละเอียด"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2.5 text-danger-600 hover:bg-danger-50 rounded-xl transition-all"
                            title="ลบโปรโมชั่น"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredPromotions.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredPromotions.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Creation & Editing Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-600" />
                {editingPromotion ? 'แก้ไขข้อมูลรายละเอียดโปรโมชั่น' : 'สร้างข้อมูลโปรโมชั่นส่วนลดใหม่'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

              {formError && (
                <div className="p-4 bg-danger-50 border-l-4 border-danger-600 text-danger-700 rounded-r-xl flex items-start space-x-2 text-[15px]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Promotion Type Selector */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-1">ประเภทโปรโมชั่น *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold text-[15px]"
                >
                  <option value="COUPON">คูปองร้านค้า (Store Coupon - ลูกค้ากรอกรับส่วนลด)</option>
                  <option value="FLASH_SALE">Flash Sale (ลดราคาสินค้าช่วงเวลาพิเศษอัตโนมัติ)</option>
                  <option value="BUNDLE_DEAL">Bundle Deal (ลดราคาอัตโนมัติเมื่อซื้อจำนวนชิ้นถึงกำหนด)</option>
                  <option value="DISCOUNT_CAMPAIGN">Discount Campaign (แคมเปญลดราคายกหมวดหมู่สินค้า)</option>
                </select>
              </div>

              {/* Promo Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">รหัสแคมเปญ / คูปอง (Code) *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="เช่น BUNDLE-MILK หรือ GIFT10"
                    disabled={!!editingPromotion}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400 font-bold tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">ชื่อโปรโมชั่น/แคมเปญ *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="เช่น ซื้อนมเยอะประหยัดกว่า"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">ประเภทส่วนลด *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  >
                    <option value="percentage">ลดเป็นเปอร์เซ็นต์ (%)</option>
                    <option value="fixed">ลดจำนวนคงที่ (บาท)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">
                    {formData.discountType === 'percentage' ? 'จำนวนเปอร์เซ็นต์ส่วนลด *' : 'จำนวนเงินส่วนลด (บาท) *'}
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="เช่น 10 หรือ 50"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold"
                  />
                </div>
              </div>

              {/* Conditional Fields based on Promotion Type */}
              {formData.type === 'COUPON' && (
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">มูลค่าสั่งซื้อขั้นต่ำ (บาท) *</label>
                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    placeholder="เช่น 0 หรือ 300"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold"
                  />
                </div>
              )}

              {formData.type === 'BUNDLE_DEAL' && (
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">จำนวนสั่งซื้อขั้นต่ำขึ้นไป (ชิ้น) *</label>
                  <input
                    type="number"
                    name="bundleQty"
                    value={formData.bundleQty}
                    onChange={handleInputChange}
                    placeholder="เช่น 2, 3"
                    min="2"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold"
                  />
                </div>
              )}

              {formData.type === 'DISCOUNT_CAMPAIGN' && (
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">หมวดหมู่เป้าหมาย *</label>
                  <select
                    name="targetCategory"
                    value={formData.targetCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product selector for FLASH_SALE & BUNDLE_DEAL */}
              {(formData.type === 'FLASH_SALE' || formData.type === 'BUNDLE_DEAL') && (
                <div className="space-y-1.5">
                  <label className="block text-[16px] font-bold text-slate-700">เลือกสินค้าที่ร่วมรายการ *</label>
                  {allProducts.length === 0 ? (
                    <p className="text-slate-400 text-sm">ไม่พบสินค้าในระบบ</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border-2 border-slate-200 rounded-xl p-2.5 space-y-2 bg-slate-50">
                      {allProducts.map(prod => {
                        const isSelected = formData.productIds.includes(prod.id);
                        return (
                          <label key={prod.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100 shadow-xs">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleProductSelectToggle(prod.id)}
                              className="w-5 h-5 text-pink-600 rounded border-slate-300 focus:ring-pink-500 cursor-pointer"
                            />
                            <img src={prod.imageUrl} className="w-9 h-9 object-cover rounded-lg border border-slate-200" />
                            <div className="text-sm">
                              <span className="font-extrabold block text-slate-800 leading-tight">{prod.name}</span>
                              <span className="text-slate-400 text-xs font-semibold">
                                หมวดหมู่: {prod.category} | ราคา: {prod.price} บาท | สต็อก: {prod.stock}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Campaign Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">วันเริ่มต้นแคมเปญ *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">วันสิ้นสุดแคมเปญ *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold text-[15px]"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-1">ลิงก์รูปภาพประกอบ (Image URL)</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="เช่น https://images.unsplash.com/..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-1">รายละเอียดเงื่อนไขเพิ่มเติม</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="เงื่อนไขการใช้งาน..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Active Status Checkbox */}
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer text-[15px]">
                  เปิดใช้งานแคมเปญนี้ทันที (Active Promotion)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-md shadow-pink-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึกข้อมูล</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
