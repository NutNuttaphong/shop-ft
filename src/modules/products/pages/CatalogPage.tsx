import React, { useState, useEffect } from 'react';
import { restfulApi, Product } from '../../../shared/services/api';
import { ShoppingCart, Search, Filter, Sparkles, RefreshCw } from 'lucide-react';
import { Pagination } from '../../../shared/components/ui/Pagination';

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 3 items per page to show paginator clearly
  
  // Notification State
  const [addedItem, setAddedItem] = useState<string | null>(null);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restfulApi.get<Product[]>('/api/products');
      if (response.error) {
        setError(response.error);
      } else {
        const data = response.data || [];
        setProducts(data);
        
        // Extract categories dynamically
        const uniqueCategories = ['ทั้งหมด', ...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
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

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) return;

    try {
      const res = await restfulApi.post<any>('/api/cart', {
        productId: product.id,
        quantity: 1,
      });

      if (res.error) {
        alert(res.error);
        return;
      }

      // Dispatch custom storage event to alert MainLayout immediately
      window.dispatchEvent(new Event('cart-updated'));

      // Show toast alert
      setAddedItem(product.name);
      setTimeout(() => setAddedItem(null), 2500);
    } catch (e) {
      console.error('ไม่สามารถบันทึกข้อมูลตะกร้าได้', e);
    }
  };

  // Filter and Search logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Intro Hero banner */}
      <div className="bg-gradient-to-r from-primary-600 to-sky-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <ShoppingCart className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" /> สิทธิประโยชน์สำหรับคุณในวันนี้
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            เลือกสินค้าสุขภาพดี สดใหม่ทุกวัน
          </h1>
          <p className="text-primary-50 text-[16px] sm:text-[18px] leading-relaxed">
            สินค้าทุกชิ้นผ่านการตรวจสอบความสะอาด ปลอดภัย คัดเกรดอย่างดีในราคาเป็นกันเอง พร้อมจัดส่งตรงถึงบ้านคุณ
          </p>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedItem && (
        <div className="fixed bottom-8 right-8 z-50 bg-success-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-success-500 animate-fade-in text-[17px] font-bold">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span>เพิ่ม "{addedItem}" ลงในตะกร้าสินค้าสำเร็จแล้ว!</span>
        </div>
      )}

      {/* Controls Bar (Search / Filters) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="search" className="sr-only">ค้นหาสินค้า</label>
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า หรือรายละเอียดที่คุณต้องการ..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[17px] placeholder-slate-400 focus:bg-white focus:border-primary-500 transition-all"
          />
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-bold text-sm mr-1 flex items-center gap-1">
            <Filter className="w-4 h-4" /> หมวดหมู่:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[15px] font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Main product display */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center">
          <div className="w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-500 font-medium">กำลังเตรียมโหลดรายการสินค้าจากร้านค้า...</span>
        </div>
      ) : error ? (
        <div className="bg-danger-50 border-l-4 border-danger-500 p-6 rounded-r-3xl text-center">
          <p className="text-danger-700 font-bold mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-2xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> ลองโหลดใหม่อีกครั้ง
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบสินค้าที่ต้องการ</h3>
          <p className="text-slate-500 leading-relaxed">
            ลองใช้คำค้นหาอื่น หรือเลือกหมวดหมู่อื่นดูนะคะ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow group"
              >
                {/* Product Image */}
                <div className="relative pt-[70%] bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {outOfStock ? (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-danger-600 text-white font-extrabold px-4 py-2 rounded-xl text-sm tracking-wide">
                        สินค้าหมดชั่วคราว
                      </span>
                    </div>
                  ) : product.stock <= 5 ? (
                    <div className="absolute top-4 left-4 bg-warning-500 text-white font-bold px-3 py-1 rounded-lg text-xs">
                      เหลือแค่ {product.stock} ชิ้นเท่านั้น!
                    </div>
                  ) : null}
                  <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-semibold">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-lg text-slate-950 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[14px] text-slate-500 line-clamp-2 leading-relaxed h-[42px]">
                      {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">ราคาต่อชิ้น</span>
                      <span className="text-2xl font-black text-slate-900">
                        {product.price.toLocaleString()} <span className="text-sm font-bold text-slate-500">บาท</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">สถานะคลัง</span>
                      <span className={`text-sm font-extrabold ${outOfStock ? 'text-danger-600' : 'text-success-600'}`}>
                        {outOfStock ? 'ของหมดแล้ว' : `มีสินค้าอยู่ ${product.stock} ชิ้น`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={outOfStock}
                    className={`w-full py-3 px-4 font-bold text-[16px] rounded-2xl flex items-center justify-center gap-2 border transition-all ${
                      outOfStock
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600 shadow-md shadow-primary-50 hover:shadow-primary-100 min-h-[48px]'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{outOfStock ? 'ขออภัย สินค้าหมดแล้ว' : 'เพิ่มลงในตะกร้า'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
        />
      )}

    </div>
  );
};
