import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border border-slate-200 rounded-3xl shadow-sm font-['Inter',sans-serif]">
      {/* Items count helper */}
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <div className="text-[15px] font-bold text-slate-500">
          แสดงรายการที่ <span className="text-slate-800">{startItem}</span> ถึง{' '}
          <span className="text-slate-800">{endItem}</span> จากทั้งหมด{' '}
          <span className="text-primary-600 font-extrabold text-lg">{totalItems}</span> รายการ
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-primary-300"
          title="ย้อนกลับไปหน้าก่อนหน้า"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="sr-only">หน้าก่อนหน้า</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((page) => {
            const isCurrent = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-12 h-12 flex items-center justify-center text-[16px] font-bold rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-50'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
                title={`ไปที่หน้า ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-primary-300"
          title="ไปยังหน้าถัดไป"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="sr-only">หน้าถัดไป</span>
        </button>
      </div>
    </div>
  );
};
