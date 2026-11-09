import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>

        <span className="text-6xl font-black text-primary-600 tracking-tight block mb-2">404</span>
        <h1 className="text-2xl font-black text-slate-900 mb-2">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือที่อยู่ URL ไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
