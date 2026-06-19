import React, { useState, useEffect } from 'react';
import { restfulApi, Product } from '../../../shared/services/api';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles, FolderOpen, RefreshCw, Upload, Play, Video } from 'lucide-react';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { base64ToBlobUrl } from '../utils/mockData';

export const ManageProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'อิเล็กทรอนิกส์',
    imageUrl: '',
    videoUrl: '',
    description: ''
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restfulApi.get<Product[]>('/api/products');
      if (response.error) {
        setError(response.error);
      } else {
        setProducts(response.data || []);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: 'อิเล็กทรอนิกส์',
      imageUrl: '',
      videoUrl: '',
      description: ''
    });
    setImagePreview(null);
    setVideoPreview(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      videoUrl: product.videoUrl || '',
      description: product.description
    });
    setImagePreview(product.imageUrl || null);
    setVideoPreview(product.videoUrl ? (product.videoUrl.startsWith('data:') ? base64ToBlobUrl(product.videoUrl) : product.videoUrl) : null);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบสินค้า "${name}" ออกจากระบบจริงหรือไม่?`)) return;

    try {
      const res = await restfulApi.delete<string>(`/api/products/${id}`);
      if (res.error) {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      } else {
        fetchProducts(); // Refresh list
      }
    } catch {
      alert('ไม่สามารถทำรายการลบได้ในขณะนี้');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, JPEG, WebP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('ขนาดรูปภาพต้องไม่เกิน 2MB เพื่อความรวดเร็วในการโหลด');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: base64String }));
      setImagePreview(base64String);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  const handleVideoFileChange = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setFormError('กรุณาเลือกไฟล์วิดีโอเท่านั้น (MP4, WebM, OGG)');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFormError('ขนาดวิดีโอต้องไม่เกิน 15MB เพื่อป้องกันความล่าช้าในการส่งข้อมูล');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, videoUrl: base64String }));
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFileChange(file);
    }
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, videoUrl: '' }));
    setVideoPreview(null);
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoFileChange(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!formData.name.trim()) {
      setFormError('กรุณากรอกชื่อสินค้า');
      return;
    }
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setFormError('กรุณากรอกราคาสินค้าเป็นตัวเลขที่มากกว่า 0');
      return;
    }
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setFormError('กรุณากรอกจำนวนสินค้าในคลังเป็นตัวเลขศูนย์ขึ้นไป');
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        videoUrl: formData.videoUrl,
        description: formData.description
      };

      let result;
      if (editingProduct) {
        // Edit Mode
        result = await restfulApi.put<Product>(`/api/products/${editingProduct.id}`, payload);
      } else {
        // Add Mode
        result = await restfulApi.post<Product>('/api/products', payload);
      }

      if (result.error) {
        setFormError(result.error);
      } else {
        setModalOpen(false);
        fetchProducts(); // Refresh list
      }
    } catch (err) {
      setFormError('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter logic
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900">จัดการรายการสินค้า</h1>
          <p className="text-slate-500 text-[16px]">เพิ่ม แก้ไข หรือลบสินค้าออกจากระบบร้านค้า FRIST SHOP</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-50 hover:shadow-emerald-100 transition-all min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มสินค้าใหม่เข้าระบบ</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="พิมพ์ค้นหาสินค้าด้วยชื่อ หรือหมวดหมู่..."
            className="w-full pl-5 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[17px] focus:bg-white focus:border-primary-500 transition-all"
          />
        </div>
        
        <div className="text-[15px] font-bold text-slate-500">
          พบสินค้าทั้งหมด <span className="text-primary-600 font-extrabold text-lg">{filteredProducts.length}</span> รายการ
        </div>
      </div>

      {/* Main content table */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center">
          <div className="w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-500 font-medium">กำลังโหลดข้อมูลสินค้า...</span>
        </div>
      ) : error ? (
        <div className="bg-danger-50 border-l-4 border-danger-500 p-6 rounded-r-3xl text-center">
          <p className="text-danger-700 font-bold mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-2xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> ลองใหม่
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบคลังสินค้า</h3>
          <p className="text-slate-500 mb-4">ไม่มีสินค้าที่ค้นหาในขณะนี้ ลองเพิ่มสินค้าใหม่ดูสิคะ</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[15px]">
                  <th className="p-5 pl-8">รูปภาพ</th>
                  <th className="p-5">ชื่อสินค้า</th>
                  <th className="p-5">หมวดหมู่</th>
                  <th className="p-5 text-right">ราคา</th>
                  <th className="p-5 text-center">สินค้าคงเหลือ</th>
                  <th className="p-5 pr-8 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[16px] text-slate-700 font-medium">
                {paginatedProducts.map((p) => {
                  const isLowStock = p.stock <= 5;
                  const isOutOfStock = p.stock === 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-5 pl-8">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          {p.videoUrl && (
                            <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center text-white" title="สินค้านี้มีวิดีโอตัวอย่าง">
                              <Play className="w-5 h-5 fill-current text-white animate-pulse" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-slate-900">
                        <div>
                          <span>{p.name}</span>
                          <span className="block text-[13px] text-slate-400 font-normal line-clamp-1 mt-0.5 max-w-sm">
                            {p.description || 'ไม่มีรายละเอียด'}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-5 text-right font-bold text-slate-900">
                        {p.price.toLocaleString()} บาท
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isOutOfStock
                            ? 'bg-danger-50 text-danger-700'
                            : isLowStock
                            ? 'bg-warning-50 text-warning-700 font-black animate-pulse'
                            : 'bg-success-50 text-success-700'
                        }`}>
                          {isOutOfStock ? 'ของหมดแล้ว' : `${p.stock} ชิ้น`}
                        </span>
                      </td>
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
                            title="ลบออกจากร้าน"
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
          {filteredProducts.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Creation & Editing Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                {editingProduct ? 'แก้ไขข้อมูลรายละเอียดสินค้า' : 'เพิ่มรายการสินค้าใหม่เข้าร้าน'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              
              {formError && (
                <div className="p-4 bg-danger-50 border-l-4 border-danger-600 text-danger-700 rounded-r-xl flex items-start space-x-2 text-[15px]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="เช่น ข้าวหอมมะลิตราเรือทอง"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">ราคาต่อหน่วย (บาท) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="เช่น 150"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[16px] font-bold text-slate-700 mb-1">จำนวนสินค้าในคลัง *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="เช่น 50"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-1">หมวดหมู่สินค้า *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                >
                  <option value="อิเล็กทรอนิกส์">อิเล็กทรอนิกส์</option>
                  <option value="เสื้อผ้าและแฟชั่น">เสื้อผ้าและแฟชั่น</option>
                  <option value="เครื่องใช้ในบ้าน">เครื่องใช้ในบ้าน</option>
                  <option value="สุขภาพและความงาม">สุขภาพและความงาม</option>
                  <option value="ซูเปอร์มาร์เก็ตและอาหาร">ซูเปอร์มาร์เก็ตและอาหาร</option>
                  <option value="กีฬาและกิจกรรมกลางแจ้ง">กีฬาและกิจกรรมกลางแจ้ง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-2">รูปภาพสินค้า *</label>
                
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group aspect-video bg-slate-50 flex items-center justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-sm transition-all shadow-md">
                        เปลี่ยนรูปภาพ
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileInputChange} 
                          className="hidden" 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                      >
                        ลบรูปภาพ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50/50 scale-[0.98]'
                        : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50/50'
                    }`}
                    onClick={() => document.getElementById('product-image-file')?.click()}
                  >
                    <input
                      id="product-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-700 text-[16px] text-center">
                      ลากไฟล์รูปภาพมาวางที่นี่ หรือ <span className="text-primary-600 hover:underline">คลิกเพื่อเลือกไฟล์</span>
                    </span>
                    <span className="text-[13px] text-slate-400 mt-1.5">
                      รองรับไฟล์ PNG, JPG, JPEG, WebP (ขนาดไม่เกิน 2MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Video Upload Zone */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-2">วิดีโอตัวอย่างสินค้า (ไม่บังคับ)</label>
                
                {videoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group aspect-video bg-slate-950 flex items-center justify-center">
                    <video 
                      src={videoPreview} 
                      controls
                      className="max-h-full max-w-full object-contain" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-sm transition-all shadow-md">
                        เปลี่ยนวิดีโอ
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleVideoFileInputChange} 
                          className="hidden" 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                      >
                        ลบวิดีโอ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleVideoDragOver}
                    onDragLeave={handleVideoDragLeave}
                    onDrop={handleVideoDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDraggingVideo
                        ? 'border-primary-500 bg-primary-50/50 scale-[0.98]'
                        : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50/50'
                    }`}
                    onClick={() => document.getElementById('product-video-file')?.click()}
                  >
                    <input
                      id="product-video-file"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileInputChange}
                      className="hidden"
                    />
                    <Video className={`w-10 h-10 mb-3 transition-colors ${isDraggingVideo ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-700 text-[16px] text-center">
                      ลากไฟล์วิดีโอมาวางที่นี่ หรือ <span className="text-primary-600 hover:underline">คลิกเพื่อเลือกไฟล์</span>
                    </span>
                    <span className="text-[13px] text-slate-400 mt-1.5">
                      รองรับไฟล์ MP4, WebM, OGG (ขนาดไม่เกิน 15MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[16px] font-bold text-slate-700 mb-1">คำอธิบายเพิ่มเติม</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="รายละเอียดสินค้า เช่น ปริมาตรสุทธิ ข้อมูลความปลอดภัย เป็นต้น"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
                />
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
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
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
