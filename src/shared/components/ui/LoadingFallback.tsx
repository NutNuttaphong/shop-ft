import React from 'react';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
    </div>
  );
};
