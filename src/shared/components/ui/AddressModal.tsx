import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Home, Building2, Tag, AlertCircle } from 'lucide-react';
import { DeliveryAddress, ADDRESS_LABELS } from '../../utils/addressBook';

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: {
    id?: string;
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    isDefault?: boolean;
  }) => void;
  initialData?: DeliveryAddress | null;
  defaultRecipientName?: string;
  defaultPhone?: string;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultRecipientName = '',
  defaultPhone = ''
}) => {
  const [label, setLabel] = useState<string>('บ้าน');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    recipientName?: string;
    phone?: string;
    addressLine?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      if ((ADDRESS_LABELS as readonly string[]).includes(initialData.label)) {
        setLabel(initialData.label);
        setCustomLabel('');
      } else {
        setLabel('อื่นๆ');
        setCustomLabel(initialData.label);
      }
      setRecipientName(initialData.recipientName || '');
      setPhone(initialData.phone || '');
      setAddressLine(initialData.addressLine || '');
      setIsDefault(initialData.isDefault || false);
    } else {
      setLabel('บ้าน');
      setCustomLabel('');
      setRecipientName(defaultRecipientName);
      setPhone(defaultPhone);
      setAddressLine('');
      setIsDefault(false);
    }
    setErrors({});
  }, [initialData, isOpen, defaultRecipientName, defaultPhone]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: typeof errors = {};
    if (!recipientName.trim()) {
      errs.recipientName = 'กรุณาระบุชื่อ-นามสกุลผู้รับ';
    }
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!cleanPhone) {
      errs.phone = 'กรุณาระบุเบอร์โทรศัพท์ผู้รับ';
    } else if (!/^0[689]\d{8}$/.test(cleanPhone)) {
      errs.phone = 'กรุณาระบุเบอร์มือถือ 10 หลักที่ถูกต้อง (เช่น 0812345678)';
    }

    if (!addressLine.trim()) {
      errs.addressLine = 'กรุณาระบุที่อยู่จัดส่งอย่างละเอียด';
    } else if (addressLine.trim().length < 15) {
      errs.addressLine = 'กรุณาระบุที่อยู่อย่างละเอียด (บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalLabel = label === 'อื่นๆ' && customLabel.trim() ? customLabel.trim() : label;

    onSave({
      id: initialData?.id,
      label: finalLabel,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      isDefault
    });
    onClose();
  };

  const getLabelIcon = (l: string) => {
    switch (l) {
      case 'บ้าน': return <Home className="w-4 h-4" />;
      case 'ที่ทำงาน': return <Building2 className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="address-modal-title" className="font-extrabold text-lg text-slate-900">
                {initialData ? 'แก้ไขที่อยู่จัดส่ง' : 'เพิ่มที่อยู่จัดส่งใหม่'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">บันทึกข้อมูลเพื่อใช้สั่งซื้อสินค้าได้อย่างรวดเร็ว</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Label selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              ประเภทที่อยู่
            </label>
            <div className="flex flex-wrap gap-2">
              {ADDRESS_LABELS.map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setLabel(lbl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    label === lbl
                      ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {getLabelIcon(lbl)}
                  <span>{lbl}</span>
                </button>
              ))}
            </div>
            {label === 'อื่นๆ' && (
              <input
                type="text"
                placeholder="ระบุชื่อที่อยู่ (เช่น คอนโดริมน้ำ, บ้านพ่อแม่)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Recipient Name */}
            <div className="space-y-1">
              <label htmlFor="address-recipient-name" className="text-xs font-bold text-slate-700 block">
                ชื่อผู้รับ <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="address-recipient-name"
                  type="text"
                  placeholder="ชื่อ-นามสกุล"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    if (errors.recipientName) setErrors(prev => ({ ...prev, recipientName: undefined }));
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border ${
                    errors.recipientName ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:border-primary-500'
                  } rounded-xl text-sm focus:outline-none focus:bg-white transition-all`}
                />
              </div>
              {errors.recipientName && (
                <p className="text-[11px] font-bold text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.recipientName}
                </p>
              )}
            </div>

            {/* Recipient Phone */}
            <div className="space-y-1">
              <label htmlFor="address-recipient-phone" className="text-xs font-bold text-slate-700 block">
                เบอร์โทรศัพท์ <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="address-recipient-phone"
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border ${
                    errors.phone ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:border-primary-500'
                  } rounded-xl text-sm focus:outline-none focus:bg-white transition-all`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] font-bold text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Detailed Address Line */}
          <div className="space-y-1">
            <label htmlFor="address-line" className="text-xs font-bold text-slate-700 block">
              ที่อยู่จัดส่งอย่างละเอียด <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="address-line"
              rows={3}
              placeholder="บ้านเลขที่, อาคาร, ซอย, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
              value={addressLine}
              onChange={(e) => {
                setAddressLine(e.target.value);
                if (errors.addressLine) setErrors(prev => ({ ...prev, addressLine: undefined }));
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                errors.addressLine ? 'border-danger-500 focus:ring-danger-200' : 'border-slate-200 focus:border-primary-500'
              } rounded-xl text-sm focus:outline-none focus:bg-white transition-all resize-none`}
            />
            {errors.addressLine && (
              <p className="text-[11px] font-bold text-danger-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.addressLine}
              </p>
            )}
          </div>

          {/* Is Default Checkbox */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700">ตั้งเป็นที่อยู่จัดส่งเริ่มต้น</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-100"
            >
              {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มที่อยู่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
