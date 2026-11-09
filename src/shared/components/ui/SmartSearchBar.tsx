import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Clock, Sparkles, ChevronRight, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { Product } from '../../services/api';
import { 
  getSearchHistory, 
  addSearchHistory, 
  removeSearchHistory, 
  clearSearchHistory 
} from '../../utils/searchHistory';

export interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (term: string) => void;
  products?: Product[];
  placeholder?: string;
  className?: string;
  onSelectProduct?: (product: Product) => void;
  autoFocus?: boolean;
  id?: string;
}

const POPULAR_TAGS = ['ผักสด', 'ผลไม้', 'ข้าวสาร', 'ไข่ไก่', 'ออร์แกนิก', 'เครื่องดื่ม'];

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  products = [],
  placeholder = 'ค้นหาชื่อสินค้า หรือหมวดหมู่ที่คุณต้องการ...',
  className = '',
  onSelectProduct,
  autoFocus = false,
  id = 'smart-search-input'
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load search history on mount and when dropdown opens
  useEffect(() => {
    setHistory(getSearchHistory());
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const updated = addSearchHistory(trimmed);
    setHistory(updated);
    onChange(trimmed);
    setIsOpen(false);
    inputRef.current?.blur();

    if (onSearch) {
      onSearch(trimmed);
    }
  };

  const handleSelectProduct = (product: Product) => {
    addSearchHistory(product.name);
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = removeSearchHistory(item);
    setHistory(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
  };

  const handleClearInput = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // Filter products based on search term
  const query = value.trim().toLowerCase();
  const matchedProducts = query
    ? products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      )
    : [];
  
  const topMatches = matchedProducts.slice(0, 5);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <label htmlFor={id} className="sr-only">ค้นหาสินค้า</label>
        <span className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
          <Search className="w-5 h-5" />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchSubmit(value);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-12 pr-12 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-2 border-slate-200 focus:border-primary-500 rounded-2xl text-[16px] text-slate-900 placeholder-slate-400 transition-all focus:outline-none shadow-xs"
        />

        {value && (
          <button
            type="button"
            onClick={handleClearInput}
            aria-label="ล้างคำค้นหา"
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div 
          data-testid="search-suggestions-dropdown"
          className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in divide-y divide-slate-100 text-slate-700"
        >
          {/* STATE A: Empty Query -> History & Popular tags */}
          {!query && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {history.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ประวัติการค้นหาล่าสุด
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-primary-600 hover:text-primary-700 font-bold lowercase hover:underline"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((term, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleSearchSubmit(term)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-600 text-slate-700 rounded-xl text-sm font-medium transition-all cursor-pointer"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, term)}
                          aria-label={`ลบ ${term}`}
                          className="opacity-50 group-hover:opacity-100 hover:text-rose-500 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  คำค้นหายอดนิยม
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSearchSubmit(tag)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-600 rounded-xl text-sm font-medium border border-slate-200/80 transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE B: Query entered -> Matching Results */}
          {query && topMatches.length > 0 && (
            <div>
              <div className="px-4 py-2.5 bg-slate-50/70 text-xs font-bold text-slate-400 flex items-center justify-between uppercase tracking-wider">
                <span>ผลลัพธ์ด่วน ({matchedProducts.length} รายการ)</span>
                <span className="text-slate-400 font-normal">กด Enter เพื่อดูทั้งหมด</span>
              </div>
              <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {topMatches.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-50/90 transition-colors text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md flex-shrink-0">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-extrabold text-primary-600">
                            ฿{product.price.toLocaleString()}
                          </span>
                          <span className={`text-[11px] font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {product.stock > 0 ? '• มีสินค้า' : '• สินค้าหมด'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* View all matches action */}
              <button
                type="button"
                onClick={() => handleSearchSubmit(query)}
                className="w-full px-4 py-3 bg-primary-50/60 hover:bg-primary-50 text-primary-700 font-bold text-sm flex items-center justify-between transition-colors"
              >
                <span>ดูผลการค้นหาทั้งหมด {matchedProducts.length} รายการสำหรับ &ldquo;{query}&rdquo;</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE C: Query entered but no matches found */}
          {query && topMatches.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                ไม่พบสินค้าที่ตรงกับ &ldquo;{value}&rdquo;
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                ลองตรวจสอบตัวสะกด หรือใช้คำค้นหาที่กว้างขึ้น เช่น ผัก, ผลไม้ หรือ ข้าว
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
