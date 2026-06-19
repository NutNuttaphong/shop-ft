import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, AlertCircle, Paperclip } from 'lucide-react';
import { restfulApi } from '../../services/api';
import { useAuth } from '../../../modules/auth/hooks/useAuth';

interface Message {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string;
}

export const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('กรุณาเลือกไฟล์รูปภาพหรือวิดีโอเท่านั้น');
      return;
    }

    if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
      setError('ขนาดรูปภาพต้องไม่เกิน 2MB');
      return;
    }

    if (file.type.startsWith('video/') && file.size > 15 * 1024 * 1024) {
      setError('ขนาดวิดีโอต้องไม่เกิน 15MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const isVid = file.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If user is Admin or not logged in, don't show the chat widget
  if (!user || user.role === 'admin') {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await restfulApi.get<Message[]>('/api/chat/history?contact=admin@1234');
      if (res.data) {
        setMessages(res.data);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลประวัติการแชทได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch history when drawer is opened
  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  // Auto-scroll when messages change or drawer is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Listen to SSE updates via Custom Event
  useEffect(() => {
    const handleIncomingMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const chatMsg = customEvent.detail as Message;
      
      // If the message is part of our conversation (with admin)
      if (chatMsg.sender === 'admin@1234' || chatMsg.receiver === 'admin@1234') {
        setMessages(prev => {
          if (prev.some(m => m.id === chatMsg.id)) return prev;
          return [...prev, chatMsg];
        });
      }
    };

    window.addEventListener('chat-message-received', handleIncomingMessage);
    return () => {
      window.removeEventListener('chat-message-received', handleIncomingMessage);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !mediaPreview) return;

    const textToSend = inputText.trim();
    const mediaUrlToSend = mediaPreview;
    const mediaTypeToSend = mediaType;

    setInputText('');
    removeSelectedFile();

    try {
      const res = await restfulApi.post<Message>('/api/chat/send', {
        receiver: 'admin@1234',
        message: textToSend,
        mediaUrl: mediaUrlToSend,
        mediaType: mediaTypeToSend
      });

      if (res.data) {
        setMessages(prev => [...prev, res.data as Message]);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError('ส่งข้อความล้มเหลว');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-['Outfit',sans-serif] print:hidden">
      {/* Chat Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 relative group"
          title="ติดต่อร้านค้า"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="absolute right-0 top-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          <span className="absolute -top-10 right-0 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
            แชทคุยกับร้านค้า
          </span>
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-slide-in relative">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 font-bold text-white text-[15px]">
                FS
              </div>
              <div>
                <h4 className="font-extrabold text-[15px] leading-tight">FRIST SHOP (ร้านค้า)</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[11px] text-primary-100 font-medium">ออนไลน์</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-2xl text-[12px] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-6 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-semibold">ยินดีต้อนรับสู่ FRIST SHOP!</p>
                <p className="text-[10px] text-slate-400">คุณสามารถส่งข้อความสอบถาม แนะนำสินค้า หรือปรึกษาปัญหาหลังการขายได้ทันทีค่ะ</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender === user.username;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div
                      className={`rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm overflow-hidden ${
                        isOwn
                          ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                      }`}
                    >
                      {/* Render Media attachment if present */}
                      {msg.mediaUrl && (
                        <div className="p-1 max-w-[240px]">
                          {msg.mediaType === 'image' ? (
                            <img
                              src={msg.mediaUrl}
                              alt="Uploaded Media"
                              className="rounded-xl w-full object-cover max-h-48 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                              onClick={() => window.open(msg.mediaUrl, '_blank')}
                            />
                          ) : msg.mediaType === 'video' ? (
                            <video
                              src={msg.mediaUrl}
                              controls
                              className="rounded-xl w-full object-cover max-h-48"
                            />
                          ) : null}
                        </div>
                      )}
                      
                      {/* Render text message if present */}
                      {msg.message && (
                        <div className="px-4 py-2.5">
                          {msg.message}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Media Preview Box */}
          {mediaPreview && (
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2 max-w-[80%]">
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300">
                    <span className="text-[9px] font-bold text-slate-500">VIDEO</span>
                  </div>
                )}
                <span className="text-xs text-slate-600 truncate font-semibold">
                  {selectedFile?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              title="แนบรูปภาพหรือวิดีโอ"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mediaPreview ? "เพิ่มคำอธิบายใต้ภาพ..." : "พิมพ์ข้อความของคุณ..."}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:border-primary-500 font-medium placeholder-slate-400 bg-slate-50 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() && !mediaPreview}
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
