import React, { useState, useEffect, useRef } from 'react';
import { restfulApi, Product, Promotion } from '../../../shared/services/api';
import { 
  Send, 
  MessageSquare, 
  Tv, 
  Video, 
  Users, 
  Heart, 
  Eye, 
  Play, 
  Square, 
  Radio, 
  Plus, 
  X, 
  ShoppingBag, 
  Check, 
  Sparkles,
  Volume2,
  VolumeX,
  TrendingUp,
  Paperclip
} from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  status: string;
  productIds: string[];
  pinnedProductId: string;
  viewerCount: number;
  likeCount: number;
}

interface ShopeeVideo {
  id: string;
  title: string;
  videoUrl: string;
  productId: string;
  viewCount: number;
  likeCount: number;
  clickCount: number;
}

interface FeedPost {
  id: string;
  caption: string;
  imageUrl: string;
  productId: string;
  likeCount: number;
  createdAt: string;
}

const mockComments = [
  "กล้วยหอมทองสดมากไหมคะ?",
  "นมลดราคารอบนี้ถึงวันไหนครับ?",
  "ส่งของไวรึเปล่าคะร้านนี้",
  "กดเพิ่มลงตะกร้าแล้วจ้าาา",
  "แชร์ให้แล้วนะครับ 👍",
  "มีของแถมไหมคะ?",
  "ผักสดอร่อยมาก สั่งรอบสองแล้ว",
  "จัดส่งเย็นไหมคะ กลัวเนื้อสัตว์เสีย",
  "แม่ค้าน่ารักจังเลยค่ะ",
  "โค้ดส่งฟรีใช้ได้อยู่ไหมน้า"
];

const mockUsers = [
  { name: 'คุณนพวรรณ ส.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80', time: '2 นาทีที่แล้ว' },
  { name: 'คุณอัครเดช ร.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80', time: '12 นาทีที่แล้ว' },
  { name: 'คุณกิตติศักดิ์ พ.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80', time: '40 นาทีที่แล้ว' },
  { name: 'คุณเบญจวรรณ ม.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80', time: '1 ชั่วโมงที่แล้ว' },
  { name: 'คุณสมควร น.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80', time: '3 ชั่วโมงที่แล้ว' }
];

export const SocialCommercePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'live' | 'video' | 'followers' | 'feed'>('chat');
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // 1. Chat States
  const [contacts, setContacts] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadContacts, setUnreadContacts] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Admin Chat Media States for Social Commerce
  const [selectedFileSC, setSelectedFileSC] = useState<File | null>(null);
  const [mediaPreviewSC, setMediaPreviewSC] = useState<string | null>(null);
  const [mediaTypeSC, setMediaTypeSC] = useState<'image' | 'video' | null>(null);
  const [chatErrorSC, setChatErrorSC] = useState<string | null>(null);
  const fileInputRefSC = useRef<HTMLInputElement>(null);

  const handleFileChangeSC = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setChatErrorSC('กรุณาเลือกไฟล์รูปภาพหรือวิดีโอเท่านั้น');
      return;
    }

    if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
      setChatErrorSC('ขนาดรูปภาพต้องไม่เกิน 2MB');
      return;
    }

    if (file.type.startsWith('video/') && file.size > 15 * 1024 * 1024) {
      setChatErrorSC('ขนาดวิดีโอต้องไม่เกิน 15MB');
      return;
    }

    setChatErrorSC(null);
    setSelectedFileSC(file);
    const isVid = file.type.startsWith('video/');
    setMediaTypeSC(isVid ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreviewSC(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedFileSC = () => {
    setSelectedFileSC(null);
    setMediaPreviewSC(null);
    setMediaTypeSC(null);
    if (fileInputRefSC.current) {
      fileInputRefSC.current.value = '';
    }
  };

  // 2. Shopee Live States
  const [, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [liveTitle, setLiveTitle] = useState('');
  const [selectedLiveProducts, setSelectedLiveProducts] = useState<string[]>([]);
  const [liveComments, setLiveComments] = useState<{ sender: string; message: string }[]>([]);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveHeartCount, setLiveHeartCount] = useState(0);
  const [floatHearts, setFloatHearts] = useState<{ id: number; left: number }[]>([]);

  // 3. Shopee Video States
  const [videos, setVideos] = useState<ShopeeVideo[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-grocery-shopping-in-the-supermarket-41584-large.mp4');
  const [newVideoProductId, setNewVideoProductId] = useState('');

  // 4. Followers & Broadcast States
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedBroadcastCoupon, setSelectedBroadcastCoupon] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // 5. Feed/Content States
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [newFeedCaption, setNewFeedCaption] = useState('');
  const [newFeedImageUrl] = useState('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80');
  const [newFeedProductId, setNewFeedProductId] = useState('');

  // Fetch Base Data
  const fetchData = async () => {
    try {
      const prodRes = await restfulApi.get<Product[]>('/api/products');
      if (prodRes.data) setProducts(prodRes.data);

      const promoRes = await restfulApi.get<Promotion[]>('/api/promotions');
      if (promoRes.data) setPromotions(promoRes.data);

      // Fetch Video and Feed from DB
      fetchVideos();
      fetchFeeds();
      fetchLiveStreams();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLiveStreams = async () => {
    try {
      const res = await restfulApi.get<LiveStream[]>('/api/social/live');
      if (res.data) {
        setStreams(res.data);
        const streaming = res.data.find(s => s.status === 'STREAMING');
        if (streaming) {
          setActiveStream(streaming);
          setLiveHeartCount(streaming.likeCount);
        }
      }
    } catch {
      // Ignore errors when fetching live streams
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await restfulApi.get<ShopeeVideo[]>('/api/social/videos');
      if (res.data) setVideos(res.data);
    } catch {
      // Ignore errors when fetching videos
    }
  };

  const fetchFeeds = async () => {
    try {
      const res = await restfulApi.get<FeedPost[]>('/api/social/feed');
      if (res.data) setFeeds(res.data);
    } catch {
      // Ignore errors when fetching feeds
    }
  };

  useEffect(() => {
    fetchData();
    fetchContacts();
  }, []);

  // --- 1. CHAT LOGIC ---
  const fetchContacts = async () => {
    try {
      const res = await restfulApi.get<string[]>('/api/chat/contacts');
      if (res.data) setContacts(res.data);
    } catch {
      // Ignore errors when fetching contacts
    }
  };

  const fetchChatHistory = async (contact: string) => {
    try {
      const res = await restfulApi.get<any[]>(`/api/chat/history?contact=${contact}`);
      if (res.data) setChatMessages(res.data);
    } catch {
      // Ignore errors when fetching chat history
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory(selectedContact);
      setUnreadContacts(prev => {
        const next = new Set(prev);
        next.delete(selectedContact);
        return next;
      });
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const handleIncomingMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const msg = customEvent.detail;
      if (selectedContact && (msg.sender === selectedContact || msg.receiver === selectedContact)) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else {
        setUnreadContacts(prev => {
          const next = new Set(prev);
          next.add(msg.sender);
          return next;
        });
      }
      fetchContacts();
    };

    window.addEventListener('chat-message-received', handleIncomingMessage);
    return () => {
      window.removeEventListener('chat-message-received', handleIncomingMessage);
    };
  }, [selectedContact]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || (!chatInput.trim() && !mediaPreviewSC)) return;
    const text = chatInput.trim();
    const mediaUrlToSend = mediaPreviewSC;
    const mediaTypeToSend = mediaTypeSC;

    setChatInput('');
    removeSelectedFileSC();

    try {
      const res = await restfulApi.post<any>('/api/chat/send', {
        receiver: selectedContact,
        message: text,
        mediaUrl: mediaUrlToSend,
        mediaType: mediaTypeToSend
      });
      if (res.data) {
        setChatMessages(prev => [...prev, res.data]);
      }
    } catch {
      // Ignore errors when sending chat message
    }
  };

  // --- 2. SHOPEE LIVE LOGIC ---

  // Live streaming simulator ticker (viewer comments & viewers count)
  useEffect(() => {
    let interval: any;
    if (activeStream) {
      interval = setInterval(async () => {
        // 1. Generate visitor comments
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)].name;
        const randomMsg = mockComments[Math.floor(Math.random() * mockComments.length)];
        setLiveComments(prev => [...prev.slice(-15), { sender: randomUser, message: randomMsg }]);
        
        // 2. Increment like/viewers count randomly on backend
        const dLikes = Math.floor(Math.random() * 5);
        const dViewers = Math.floor(Math.random() * 3) - 1; // can fluctuate
        try {
          const res = await restfulApi.put<LiveStream>(`/api/social/live/${activeStream.id}/interact?addLikes=${dLikes}&addViewers=${dViewers}`, {});
          if (res.data) {
            setActiveStream(res.data);
            setLiveHeartCount(res.data.likeCount);
          }
        } catch {
          // Ignore interaction broadcast errors
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [activeStream]);

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle.trim()) return;
    try {
      const res = await restfulApi.post<LiveStream>('/api/social/live', {
        title: liveTitle.trim(),
        productIds: selectedLiveProducts,
      });
      if (res.data) {
        setActiveStream(res.data);
        setLiveTitle('');
        setSelectedLiveProducts([]);
        setIsLiveModalOpen(false);
        setLiveComments([{ sender: 'ระบบไลฟ์สด', message: 'เริ่มต้นการจำลองไลฟ์สดเรียบร้อยแล้ว ยินดีต้อนรับผู้ชมทุกท่านค่ะ! 🎥✨' }]);
        fetchLiveStreams();
      }
    } catch {
      // Ignore live startup errors
    }
  };

  const handleStopLive = async () => {
    if (!activeStream) return;
    if (!confirm('คุณต้องการปิดการไลฟ์สดนี้จริงหรือไม่?')) return;
    try {
      const res = await restfulApi.put<LiveStream>(`/api/social/live/${activeStream.id}/status?status=ENDED`, {});
      if (res.data) {
        setActiveStream(null);
        setLiveComments([]);
        fetchLiveStreams();
      }
    } catch {
      // Ignore live shutdown errors
    }
  };

  const handlePinLiveProduct = async (prodId: string) => {
    if (!activeStream) return;
    const isCurrentlyPinned = activeStream.pinnedProductId === prodId;
    const targetPin = isCurrentlyPinned ? '' : prodId;
    try {
      const res = await restfulApi.put<LiveStream>(`/api/social/live/${activeStream.id}/pin?productId=${targetPin}`, {});
      if (res.data) {
        setActiveStream(res.data);
        if (targetPin) {
          const prod = products.find(p => p.id === prodId);
          setLiveComments(prev => [...prev, { sender: 'แม่ค้าไลฟ์สด 📢', message: `ปักหมุดสินค้าพิเศษ: ${prod?.name || ''} ช้อปด่วนคุ้มค่าสุดๆ!` }]);
        }
      }
    } catch {
      // Ignore pinning errors
    }
  };

  const handleAdminHeartClick = async () => {
    if (!activeStream) return;
    // float animation
    const heartId = Date.now();
    setFloatHearts(prev => [...prev, { id: heartId, left: 30 + Math.random() * 40 }]);
    setTimeout(() => {
      setFloatHearts(prev => prev.filter(h => h.id !== heartId));
    }, 1500);

    try {
      const res = await restfulApi.put<LiveStream>(`/api/social/live/${activeStream.id}/interact?addLikes=5&addViewers=0`, {});
      if (res.data) {
        setActiveStream(res.data);
        setLiveHeartCount(res.data.likeCount);
      }
    } catch {
      // Ignore heart click broadcast errors
    }
  };

  // --- 3. SHOPEE VIDEO LOGIC ---
  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim()) return;
    try {
      const res = await restfulApi.post<ShopeeVideo>('/api/social/videos', {
        title: newVideoTitle.trim(),
        videoUrl: newVideoUrl,
        productId: newVideoProductId
      });
      if (res.data) {
        setNewVideoTitle('');
        setNewVideoProductId('');
        setIsVideoModalOpen(false);
        fetchVideos();
      }
    } catch {
      // Ignore video creation errors
    }
  };

  // --- 4. FOLLOWERS & BROADCAST ---
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setBroadcastMessage('');
    setSelectedBroadcastCoupon('');
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  // --- 5. FEED / CONTENT LOGIC ---
  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedCaption.trim()) return;
    try {
      const res = await restfulApi.post<FeedPost>('/api/social/feed', {
        caption: newFeedCaption.trim(),
        imageUrl: newFeedImageUrl,
        productId: newFeedProductId
      });
      if (res.data) {
        setNewFeedCaption('');
        setNewFeedProductId('');
        setIsFeedModalOpen(false);
        fetchFeeds();
      }
    } catch {
      // Ignore feed creation errors
    }
  };

  const handleLikeFeed = async (feedId: string) => {
    try {
      const res = await restfulApi.put<FeedPost>(`/api/social/feed/${feedId}/like`, {});
      if (res.data) fetchFeeds();
    } catch {
      // Ignore feed like errors
    }
  };

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Radio className="w-8 h-8 text-pink-600 animate-pulse" />
            Social Commerce Hub
          </h1>
          <p className="text-slate-500 text-[16px]">จัดการแชท จำลองการไลฟ์สด ขายสินค้าผ่านวิดีโอสั้น ฟีดข่าวสาร และบรอดแคสต์ส่งถึงผู้ติดตาม</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
        {[
          { id: 'chat', label: 'แชทกับผู้ซื้อ', icon: MessageSquare },
          { id: 'live', label: 'จำลองไลฟ์สด (Live)', icon: Tv },
          { id: 'video', label: 'วิดีโอรีวิว (Video)', icon: Video },
          { id: 'followers', label: 'ผู้ติดตาม (Followers)', icon: Users },
          { id: 'feed', label: 'ฟีดข่าวสาร (Feed)', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-pink-600 text-pink-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xs min-h-[500px]">
        
        {/* --- TAB 1: SELLER CHAT HUB --- */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 h-[500px] bg-white">
            
            {/* Contacts Column */}
            <div className="border-r border-slate-200 flex flex-col h-full overflow-y-auto">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-sm">
                รายชื่อลูกค้าร้านค้า
              </div>
              {contacts.length === 0 ? (
                <p className="text-slate-400 p-8 text-center text-xs">ไม่มีลูกค้าเปิดห้องแชทในปัจจุบัน</p>
              ) : (
                <div className="divide-y divide-slate-100 flex-1">
                  {contacts.map((contact, idx) => {
                    const isSelected = selectedContact === contact;
                    const isUnread = unreadContacts.has(contact);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedContact(contact)}
                        className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                          isSelected ? 'bg-pink-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-extrabold flex items-center justify-center border border-pink-200 uppercase">
                          {contact.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-slate-800 block text-xs truncate">{contact}</span>
                          <span className="text-[11px] text-slate-400 block truncate">ทักหาผู้ขาย...</span>
                        </div>
                        {isUnread && (
                          <span className="w-2.5 h-2.5 bg-pink-600 rounded-full flex-shrink-0 animate-ping"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="md:col-span-2 flex flex-col h-full bg-slate-50/40 relative">
              {selectedContact ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-pink-600 text-white font-extrabold flex items-center justify-center text-xs uppercase">
                      {selectedContact.substring(0, 2)}
                    </div>
                    <span className="font-extrabold text-slate-800 text-xs">{selectedContact}</span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg, i) => {
                      const isMe = msg.sender === 'admin@1234';
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md rounded-2xl text-xs font-semibold leading-relaxed shadow-xs overflow-hidden ${
                            isMe 
                              ? 'bg-pink-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          }`}>
                            {/* Render Media attachment if present */}
                            {msg.mediaUrl && (
                              <div className="p-1 max-w-[280px]">
                                {msg.mediaType === 'image' ? (
                                  <img
                                    src={msg.mediaUrl}
                                    alt="Uploaded Media"
                                    className="rounded-xl w-full object-cover max-h-56 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                                    onClick={() => window.open(msg.mediaUrl, '_blank')}
                                  />
                                ) : msg.mediaType === 'video' ? (
                                  <video
                                    src={msg.mediaUrl}
                                    controls
                                    className="rounded-xl w-full object-cover max-h-56"
                                  />
                                ) : null}
                              </div>
                            )}

                            {/* Render text message if present */}
                            {msg.message && (
                              <div className="px-3 py-2.5">
                                <p>{msg.message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Media Preview Box */}
                  {mediaPreviewSC && (
                    <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 mx-4 rounded-xl">
                      <div className="flex items-center gap-2 max-w-[80%]">
                        {mediaTypeSC === 'image' ? (
                          <img
                            src={mediaPreviewSC}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300">
                            <span className="text-[9px] font-bold text-slate-500">VIDEO</span>
                          </div>
                        )}
                        <span className="text-xs text-slate-600 truncate font-semibold">
                          {selectedFileSC?.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeSelectedFileSC}
                        className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Error Box */}
                  {chatErrorSC && (
                    <div className="mx-4 px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold border rounded-xl border-rose-100">
                      {chatErrorSC}
                    </div>
                  )}

                  {/* Input Form */}
                  <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-slate-200 flex gap-2.5 items-center">
                    <input
                      type="file"
                      ref={fileInputRefSC}
                      onChange={handleFileChangeSC}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefSC.current?.click()}
                      className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                      title="แนบรูปภาพหรือวิดีโอ"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={mediaPreviewSC ? "เพิ่มคำอธิบายใต้ภาพ..." : "พิมพ์ข้อความคุยกับลูกค้า..."}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none text-xs font-bold"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() && !mediaPreviewSC}
                      className="px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-pink-50 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ส่ง</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-400 p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="font-bold text-xs">กรุณาเลือกผู้ซื้อเพื่อเริ่มคุยสนทนาแบบ Real-time</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TAB 2: SHOPEE LIVE SIMULATOR --- */}
        {activeTab === 'live' && (
          <div className="p-6 space-y-6">
            
            {activeStream ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Stream simulated player */}
                <div className="lg:col-span-2 relative bg-slate-950 aspect-video rounded-3xl overflow-hidden border-2 border-slate-800 flex flex-col justify-between p-4 shadow-xl">
                  {/* Streaming Video Simulation Background (Mixkit or beautiful canvas) */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-pink-950 flex justify-center items-center">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-grocery-shopping-in-the-supermarket-41584-large.mp4"
                      className="w-full h-full object-cover opacity-60"
                      autoPlay
                      loop
                      muted={isVideoMuted}
                    />
                    
                    {/* Floating hearts emitter wrapper */}
                    <div className="absolute bottom-20 right-6 w-20 h-48 pointer-events-none z-30 overflow-visible">
                      {floatHearts.map(h => (
                        <div 
                          key={h.id} 
                          className="absolute bottom-0 text-pink-500 text-2xl animate-float-heart"
                          style={{ left: `${h.left}%` }}
                        >
                          ❤️
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Header HUD */}
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-danger-600 text-white text-[10px] font-black rounded-lg uppercase flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        LIVE
                      </span>
                      <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg font-extrabold flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-350" />
                        {activeStream.viewerCount} คนดู
                      </span>
                      <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg font-extrabold flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                        {liveHeartCount} ถูกใจ
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl"
                      >
                        {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={handleStopLive}
                        className="px-3.5 py-1.5 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        จบไลฟ์
                      </button>
                    </div>
                  </div>

                  {/* Pinned Product Popup overlay */}
                  <div className="relative z-10 flex justify-between items-end gap-4 mt-auto">
                    {activeStream.pinnedProductId ? (
                      (() => {
                        const pinned = products.find(p => p.id === activeStream.pinnedProductId);
                        if (!pinned) return null;
                        return (
                          <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/50 flex items-center gap-3 shadow-2xl max-w-sm animate-bounce-subtle">
                            <img src={pinned.imageUrl} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                            <div className="text-left">
                              <span className="px-2 py-0.5 bg-pink-50 text-pink-700 font-extrabold text-[9px] uppercase rounded border border-pink-100">ปักหมุดไลฟ์สด</span>
                              <span className="font-extrabold block text-slate-800 text-xs line-clamp-1">{pinned.name}</span>
                              <span className="font-black text-pink-600 block text-xs">{pinned.price} บาท</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-white/40 text-xs font-semibold italic bg-black/40 px-3 py-2 rounded-xl">ไม่มีสินค้าปักหมุด</div>
                    )}

                    {/* Like stream button */}
                    <button 
                      onClick={handleAdminHeartClick}
                      className="w-14 h-14 bg-pink-600 hover:bg-pink-700 hover:scale-105 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <Heart className="w-7 h-7 fill-white" />
                    </button>
                  </div>

                </div>

                {/* Right Column: Live Chat & Product tagging dashboard */}
                <div className="space-y-6 flex flex-col">
                  {/* Simulated comments feed */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex-1 flex flex-col max-h-[300px]">
                    <h3 className="font-extrabold text-slate-800 text-xs border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-pink-600" />
                      ไลฟ์แชทผู้ชมสตรีม (Live Chat)
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 text-xs font-semibold">
                      {liveComments.map((comment, idx) => (
                        <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100 leading-normal">
                          <span className="text-pink-600 font-black block mb-0.5">{comment.sender}</span>
                          <span className="text-slate-700">{comment.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected products list & Pinning tools */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-xs border-b border-slate-100 pb-2">
                      สินค้าเข้าร่วมไลฟ์สด
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {products.filter(p => activeStream.productIds?.includes(p.id)).map(prod => {
                        const isPinned = activeStream.pinnedProductId === prod.id;
                        return (
                          <div key={prod.id} className="p-2 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                              <img src={prod.imageUrl} className="w-8 h-8 object-cover rounded-lg border" />
                              <div className="text-[11px]">
                                <span className="font-bold text-slate-800 block truncate w-28">{prod.name}</span>
                                <span className="text-slate-400 block">{prod.price} บาท</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePinLiveProduct(prod.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                isPinned
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {isPinned ? 'ปักหมุดอยู่' : 'ปักหมุดขาย'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              // Empty Live Room Screen
              <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center max-w-md mx-auto shadow-sm space-y-6">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Tv className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900">ไม่มีการไลฟ์สดที่เปิดอยู่</h3>
                  <p className="text-slate-500 text-sm">
                    คุณยังไม่ได้เปิดเซสชันไลฟ์สด เริ่มจำลองไลฟ์ขายสินค้าเพื่อดึงดูดใจผู้ซื้อและดูสถิติได้เลยค่ะ!
                  </p>
                </div>
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-5 h-5" />
                  <span>เริ่มไลฟ์สดใหม่</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* --- TAB 3: SHOPEE VIDEO MANAGEMENT --- */}
        {activeTab === 'video' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-slate-800 text-base">รายการวิดีโอรีวิวสินค้าทั้งหมด</span>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs"
              >
                <Plus className="w-4 h-4" /> สร้างคลิปวิดีโอใหม่
              </button>
            </div>

            {videos.length === 0 ? (
              <p className="text-slate-400 text-center py-12">ไม่มีวิดีโอรีวิวในระบบ</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map(video => {
                  const taggedProd = products.find(p => p.id === video.productId);
                  return (
                    <div key={video.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow">
                      <div className="w-32 bg-slate-950 aspect-[9/16] rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                        <video src={video.videoUrl} className="w-full h-full object-cover opacity-60" loop muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white/80" />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-sm line-clamp-2">{video.title}</h4>
                          {taggedProd && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold">
                              <ShoppingBag className="w-3 h-3 text-pink-600" />
                              สินค้า: {taggedProd.name}
                            </span>
                          )}
                        </div>

                        {/* Stats counters */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-[10px] font-bold text-slate-500">
                          <div>
                            <span className="block text-slate-400">ผู้เข้าชม (Views)</span>
                            <span className="text-slate-800 text-xs font-black">{video.viewCount}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400">ถูกใจ (Likes)</span>
                            <span className="text-slate-800 text-xs font-black">{video.likeCount}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400">ยอดคลิกซื้อ (Clicks)</span>
                            <span className="text-slate-800 text-xs font-black">{video.clickCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* --- TAB 4: FOLLOWERS & PROMOTION BROADCAST --- */}
        {activeTab === 'followers' && (
          <div className="p-6 space-y-6">
            
            {/* KPI follower summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Followers count Card */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">ผู้ติดตามร้านค้าทั้งหมด</span>
                  <span className="text-4xl font-black text-slate-900 block">5,410 คน</span>
                  <span className="text-xs font-bold text-success-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +5% จากสัปดาห์ก่อน
                  </span>
                </div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <Users className="w-7 h-7" />
                </div>
              </div>

              {/* Broadcast Coupon form */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  บรอดแคสต์แคมเปญส่งเสริมการขาย
                </h3>

                {broadcastSuccess && (
                  <div className="p-3 bg-success-50 border-l-4 border-success-600 text-success-700 text-xs font-bold rounded-r-xl flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-4 h-4 text-success-600" />
                    <span>บรอดแคสต์ส่งถึงผู้ติดตาม 5,410 คนสำเร็จแล้ว!</span>
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">เลือกคูปองร้านค้าที่เข้าร่วม</label>
                    <select
                      value={selectedBroadcastCoupon}
                      onChange={(e) => setSelectedBroadcastCoupon(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-xs font-bold"
                    >
                      <option value="">-- ไม่รวมคูปอง --</option>
                      {promotions.filter(p => p.type === 'COUPON').map(promo => (
                        <option key={promo.id} value={promo.code}>{promo.name} ({promo.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ข้อความบรอดแคสต์</label>
                    <textarea
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="เขียนข้อความประชาสัมพันธ์สิทธิพิเศษให้กับแฟนร้านค้า..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-xs font-medium resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    ส่งบรอดแคสต์
                  </button>
                </form>
              </div>

            </div>

            {/* Followers list mock */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">
                ผู้ติดตามล่าสุด
              </h3>
              <div className="divide-y divide-slate-100">
                {mockUsers.map((usr, i) => (
                  <div key={i} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-3">
                      <img src={usr.avatar} className="w-9 h-9 rounded-full object-cover border" />
                      <span>{usr.name}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{usr.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 5: FEED POSTS & STORIES --- */}
        {activeTab === 'feed' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-slate-800 text-base">โพสต์ข่าวสารในหน้าฟีดของร้าน (Feed)</span>
              <button
                onClick={() => setIsFeedModalOpen(true)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs"
              >
                <Plus className="w-4 h-4" /> เขียนโพสต์ข่าวสารใหม่
              </button>
            </div>

            {feeds.length === 0 ? (
              <p className="text-slate-400 text-center py-12">ไม่มีโพสต์ข่าวสารในระบบ</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feeds.map(feed => {
                  const tagged = products.find(p => p.id === feed.productId);
                  return (
                    <div key={feed.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      {/* Visual Header */}
                      <div className="p-4 flex items-center gap-2.5 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-extrabold text-xs">FS</div>
                        <div className="text-xs">
                          <span className="font-extrabold text-slate-800 block">FRIST SHOP</span>
                          <span className="text-slate-400 font-semibold block">เมื่อกี้นี้</span>
                        </div>
                      </div>

                      {/* Image container */}
                      <div className="aspect-square bg-slate-50 relative overflow-hidden border-b border-slate-100">
                        <img src={feed.imageUrl} alt="Feed Post" className="w-full h-full object-cover" />
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-3">{feed.caption}</p>
                          {tagged && (
                            <div className="p-2 border border-pink-100 bg-pink-50/30 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span className="line-clamp-1 w-32">🛒 {tagged.name}</span>
                              <span className="text-pink-600 font-black">{tagged.price} บ.</span>
                            </div>
                          )}
                        </div>

                        {/* Interactive bar */}
                        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-slate-400 text-xs">
                          <button 
                            onClick={() => handleLikeFeed(feed.id)}
                            className="flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors font-bold"
                          >
                            <Heart className="w-4 h-4 fill-pink-550 text-pink-600" />
                            <span>{feed.likeCount} Likes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- LIVE SESSION MODAL --- */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Tv className="w-4 h-4 text-pink-600" />
                เริ่มต้นการจำลองไลฟ์สดใหม่
              </h3>
              <button onClick={() => setIsLiveModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStartLive} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">หัวข้อการสตรีม (Title) *</label>
                <input
                  type="text"
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  placeholder="เช่น ไลฟ์แจกโค้ดผลไม้สดเมืองหนาว"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none text-xs font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">เลือกสินค้าเข้ามาในไลฟ์สด</label>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-2 bg-slate-50 space-y-1.5">
                  {products.map(prod => {
                    const isSelected = selectedLiveProducts.includes(prod.id);
                    return (
                      <label key={prod.id} className="flex items-center gap-3 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedLiveProducts(prev => 
                              isSelected ? prev.filter(id => id !== prod.id) : [...prev, prod.id]
                            );
                          }}
                          className="w-4 h-4 text-pink-600 rounded border-slate-350"
                        />
                        <img src={prod.imageUrl} className="w-7 h-7 object-cover rounded border" />
                        <span className="truncate flex-1">{prod.name} ({prod.price} บ.)</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsLiveModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">ยกเลิก</button>
                <button type="submit" className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold">เริ่มไลฟ์สด</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIDEO CREATION MODAL --- */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-pink-600" />
                จำหน่ายสินค้าด้วยคลิปวิดีโอใหม่
              </h3>
              <button onClick={() => setIsVideoModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVideo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อคลิปวิดีโอรีวิว *</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="เช่น มื้อเช้าแสนอร่อยด้วยกล้วยหอมทองสด"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">แท็กสินค้าคู่กับวิดีโอ</label>
                <select
                  value={newVideoProductId}
                  onChange={(e) => setNewVideoProductId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-pink-500 text-xs font-bold focus:outline-none"
                >
                  <option value="">-- ไม่รวมสินค้า --</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name} ({prod.price} บาท)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsVideoModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">ยกเลิก</button>
                <button type="submit" className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold">โพสต์วิดีโอ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FEED CREATION MODAL --- */}
      {isFeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
                เขียนโพสต์อัปเดตฟีดข่าวสารใหม่
              </h3>
              <button onClick={() => setIsFeedModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFeed} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ข้อความแคปชั่นโพสต์ *</label>
                <textarea
                  value={newFeedCaption}
                  onChange={(e) => setNewFeedCaption(e.target.value)}
                  placeholder="เขียนแคปชั่นแนะนำโปรโมชัน หรือการมาของสินค้าล็อตใหม่..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none text-xs font-medium resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">แนบแท็กสินค้าขายดี</label>
                <select
                  value={newFeedProductId}
                  onChange={(e) => setNewFeedProductId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-pink-500 text-xs font-bold focus:outline-none"
                >
                  <option value="">-- ไม่ร่วมสินค้า --</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name} ({prod.price} บาท)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsFeedModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">ยกเลิก</button>
                <button type="submit" className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold">โพสต์ลงฟีด</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
