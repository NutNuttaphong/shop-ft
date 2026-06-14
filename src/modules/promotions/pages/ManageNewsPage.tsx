import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Plus, Edit2, Trash2, X, Image as ImageIcon, 
  Sparkles, Check, RefreshCw 
} from 'lucide-react';

interface NewsItem {
  id: number;
  tag: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  action: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 1,
    tag: 'โปรโมชันพิเศษ',
    title: 'ฉลองเปิดตัวระบบ สบายดีมาร์เก็ต 🛒',
    description: 'รับส่วนลดพิเศษทันที 10% สำหรับสมาชิกใหม่ทุกคน เพียงใช้คูปองส่วนลดที่กำหนดหน้าชำระเงิน ช้อปสินค้าสุขภาพดีวันนี้เลย!',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'ช้อปผักสดวันนี้',
    action: 'vegetables'
  },
  {
    id: 2,
    tag: 'ข่าวประชาสัมพันธ์',
    title: 'ส่งตรงความสดใหม่จากสวนออร์แกนิก 🥬',
    description: 'ผักสวนครัวและผลไม้ทุกประเภท ปลูกด้วยวิถีธรรมชาติ ปลอดสารพิษ 100% ปลอดภัยต่อสุขภาพตัวคุณและครอบครัวที่คุณรัก',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1590d333c?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'ดูสินค้าออร์แกนิก',
    action: 'vegetables'
  },
  {
    id: 3,
    tag: 'ข่าวประชาสัมพันธ์',
    title: 'บริการจัดส่งฟรีทั่วพื้นที่ชุมชน 🚚',
    description: 'เมื่อซื้อครบ 500 บาทขึ้นไป จัดส่งรวดเร็วทันใจในวันเดียว คงความสดใหม่ของอาหารเสมือนมาเลือกซื้อที่หน้าร้านด้วยตัวเอง',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'ดูเงื่อนไขส่งฟรี',
    action: 'free-delivery'
  },
  {
    id: 4,
    tag: 'เคล็ดลับสุขภาพ',
    title: 'วิธีเลือกผักและผลไม้สดที่ถูกต้อง 🍎',
    description: 'เรียนรู้ทริคเล็กๆ ในการสังเกตความสดใหม่และการล้างทำความสะอาดสารเคมีตกค้างอย่างถูกวิธี เพื่อโภชนาการที่ดีที่สุดในทุกมื้ออาหาร',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'อ่านเคล็ดลับสุขภาพ',
    action: 'health-tips'
  }
];

export const ManageNewsPage: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

  // Form states
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [action, setAction] = useState('vegetables');

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้นนะคะ');
      return;
    }
    // Limit file size to 2MB to prevent localStorage limit issues
    if (file.size > 2 * 1024 * 1024) {
      alert('ขออภัยค่ะ รูปภาพต้องมีขนาดไม่เกิน 2MB เพื่อรักษาประสิทธิภาพการบันทึกข้อมูล');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const [notification, setNotification] = useState<string | null>(null);

  // Load news from localStorage or set defaults
  useEffect(() => {
    const stored = localStorage.getItem('app_news_items');
    if (stored) {
      try {
        setNewsList(JSON.parse(stored));
      } catch {
        setNewsList(DEFAULT_NEWS);
        localStorage.setItem('app_news_items', JSON.stringify(DEFAULT_NEWS));
      }
    } else {
      setNewsList(DEFAULT_NEWS);
      localStorage.setItem('app_news_items', JSON.stringify(DEFAULT_NEWS));
    }
  }, []);

  const saveToStorage = (updatedList: NewsItem[]) => {
    setNewsList(updatedList);
    localStorage.setItem('app_news_items', JSON.stringify(updatedList));
    // Dispatch event to sync CatalogPage instantly if running
    window.dispatchEvent(new Event('news-updated'));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTag('ข่าวประชาสัมพันธ์');
    setTitle('');
    setDescription('');
    setImage('');
    setCtaText('อ่านเพิ่มเติม');
    setAction('vegetables');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: NewsItem) => {
    setEditingItem(item);
    setTag(item.tag);
    setTitle(item.title);
    setDescription(item.description);
    setImage(item.image);
    setCtaText(item.ctaText);
    setAction(item.action);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?')) {
      const updated = newsList.filter(item => item.id !== id);
      saveToStorage(updated);
      showNotification('ลบข่าวสารเสร็จเรียบร้อยแล้วค่ะ');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('กรุณากรอกข้อมูลหัวข้อข่าวสารและรายละเอียดให้ครบถ้วนด้วยค่ะ');
      return;
    }

    const defaultImages: Record<string, string> = {
      'vegetables': 'https://images.unsplash.com/photo-1500937386664-56d1590d333c?auto=format&fit=crop&w=1200&q=85',
      'free-delivery': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
      'health-tips': 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?auto=format&fit=crop&w=1200&q=85'
    };

    const finalImage = image.trim() || defaultImages[action] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85';

    if (editingItem) {
      // Edit mode
      const updated = newsList.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            tag,
            title,
            description,
            image: finalImage,
            ctaText,
            action
          };
        }
        return item;
      });
      saveToStorage(updated);
      showNotification('แก้ไขข้อมูลข่าวสารเรียบร้อยแล้วค่ะ');
    } else {
      // Add mode
      const newId = newsList.length > 0 ? Math.max(...newsList.map(i => i.id)) + 1 : 1;
      const newItem: NewsItem = {
        id: newId,
        tag,
        title,
        description,
        image: finalImage,
        ctaText,
        action
      };
      const updated = [...newsList, newItem];
      saveToStorage(updated);
      showNotification('เพิ่มข่าวสารใหม่เรียบร้อยแล้วค่ะ');
    }

    setIsModalOpen(false);
  };

  const handleResetToDefault = () => {
    if (confirm('คุณต้องการรีเซ็ตข่าวสารทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      saveToStorage(DEFAULT_NEWS);
      showNotification('รีเซ็ตข้อมูลเป็นค่าเริ่มต้นเรียบร้อยแล้วค่ะ');
    }
  };

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-xs">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">การจัดการข่าวสารประชาสัมพันธ์</h1>
            <p className="text-sm text-slate-500 font-medium">เพิ่ม แก้ไข และจัดการข่าวสาร/โปรโมชันหน้าแรกของร้านค้า</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetToDefault}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>คืนค่าเริ่มต้น</span>
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มข่าวสารใหม่</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-50 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in font-bold text-sm">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* News grid list */}
      {newsList.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีข่าวสารใดๆ</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            คุณสามารถเพิ่มข่าวสารหรือโปรโมชันใหม่เพื่อให้ผู้ใช้มองเห็นบนหน้าแรกได้ทันทีค่ะ
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> เพิ่มข่าวสารแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsList.map((news) => (
            <div 
              key={news.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* News Image Preview */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/75 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold">
                    {news.tag}
                  </div>
                </div>

                {/* News Info */}
                <div className="p-6 space-y-2">
                  <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1">{news.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 font-medium h-[60px]">{news.description}</p>
                  
                  <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-400">
                    <span>ข้อความปุ่ม:</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">{news.ctaText}</span>
                    <span>•</span>
                    <span>ลิงก์:</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      {news.action === 'vegetables' ? 'กรองหมวดผักผลไม้' : news.action === 'free-delivery' ? 'เงื่อนไขส่งฟรี' : 'เคล็ดลับสุขภาพ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => handleOpenEditModal(news)}
                  className="flex items-center gap-1 px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
                
                <button
                  onClick={() => handleDelete(news.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-danger-50 hover:bg-danger-100 text-danger-700 font-bold rounded-xl text-xs border border-danger-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบออก</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative animate-scale-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary-600" />
              <span>{editingItem ? 'แก้ไขข้อมูลข่าวสาร' : 'เพิ่มข่าวสารใหม่'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 font-sans">
              {/* Tag Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">ป้ายกำกับข่าวสาร</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-bold"
                >
                  <option value="ข่าวประชาสัมพันธ์">ข่าวประชาสัมพันธ์</option>
                  <option value="โปรโมชันพิเศษ">โปรโมชันพิเศษ</option>
                  <option value="เคล็ดลับสุขภาพ">เคล็ดลับสุขภาพ</option>
                  <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">หัวข้อข่าวสาร</label>
                <input
                  type="text"
                  placeholder="เช่น ลดครึ่งราคาผักสวนครัววันนี้!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-medium"
                  maxLength={60}
                  required
                />
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">คำโปรย / รายละเอียดข่าวสาร</label>
                <textarea
                  placeholder="พิมพ์รายละเอียดเนื้อหาของข่าวสารหรือโปรโมชัน..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-medium placeholder-slate-400"
                  maxLength={300}
                  required
                />
              </div>

              {/* Drag and Drop Image Upload */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">รูปภาพประกอบข่าวสาร</label>
                
                {image ? (
                  /* Image Preview Area */
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      เปลี่ยนรูปภาพ
                    </button>
                  </div>
                ) : (
                  /* Drag and Drop Area */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('news-image-input')?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[140px] ${
                      isDragActive 
                        ? 'border-primary-500 bg-primary-50/50' 
                        : 'border-slate-300 hover:border-primary-500 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      id="news-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <ImageIcon className={`w-8 h-8 ${isDragActive ? 'text-primary-600' : 'text-slate-400'}`} />
                    <div className="text-sm font-bold text-slate-700">
                      ลากรูปภาพมาวางที่นี่ หรือ <span className="text-primary-600">เลือกไฟล์จากเครื่อง</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">รองรับไฟล์ JPG, PNG, GIF (แนะนำสัดส่วน 16:9)</p>
                  </div>
                )}
              </div>

              {/* CTA & Link row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">ข้อความบนปุ่ม</label>
                  <input
                    type="text"
                    placeholder="เช่น ช้อปเลย"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-bold"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">ปุ่มทำงานสำหรับ</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-bold"
                  >
                    <option value="vegetables">กรองผักและผลไม้</option>
                    <option value="free-delivery">เปิดหน้าจัดส่งฟรี</option>
                    <option value="health-tips">เปิดหน้าเคล็ดลับสุขภาพ</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-50 transition-colors"
                >
                  {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มข่าวสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
