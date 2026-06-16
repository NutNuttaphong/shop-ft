export interface Shop {
  name: string;
  avatar: string;
  category: string;
  followers: number;
  rating: number;
  description: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
}

export interface ProductMedia {
  type: 'image' | 'video';
  url: string;
}

// 1. Mock Shops data based on product categories
export const getShopForProduct = (category: string): Shop => {
  const normalizedCategory = category ? category.trim() : 'ทั่วไป';
  
  if (normalizedCategory.includes('ผัก')) {
    return {
      name: 'สวนผักออร์แกนิก ลุงสมศักดิ์ 🥬',
      avatar: 'https://images.unsplash.com/photo-1500937386664-56d1590d333c?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'ผักสวนครัว',
      followers: 1245,
      rating: 4.9,
      description: 'ผักสดๆ ส่งตรงจากสวนออร์แกนิก ปลอดสารเคมี 100% ปลูกด้วยใจเพื่อสุขภาพที่ดีของคุณ'
    };
  } else if (normalizedCategory.includes('ผลไม้')) {
    return {
      name: 'ผลไม้สดเมืองหนาว เจ๊อรวรรณ 🍎',
      avatar: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'ผลไม้ตามฤดูกาล',
      followers: 890,
      rating: 4.8,
      description: 'คัดสรรผลไม้เกรดพรีเมียม ทั้งผลไม้นำเข้าและผลไม้ไทยตามฤดูกาล หวาน ฉ่ำ ชื่นใจ'
    };
  } else if (normalizedCategory.includes('เนื้อ') || normalizedCategory.includes('ทะเล') || normalizedCategory.includes('สัตว์') || normalizedCategory.includes('สด')) {
    return {
      name: 'ฟาร์มเนื้อสดคุณภาพ สบายดีบีฟ 🥩',
      avatar: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'เนื้อสัตว์และอาหารสด',
      followers: 2450,
      rating: 4.7,
      description: 'เนื้อสัตว์คัดสรรคุณภาพดี สะอาด ปลอดภัย ผ่านการตรวจสอบมาตรฐานอนามัยทุกขั้นตอน'
    };
  } else if (normalizedCategory.includes('อาหารแห้ง') || normalizedCategory.includes('เครื่องปรุง') || normalizedCategory.includes('โชห่วย')) {
    return {
      name: 'สบายดี โชห่วย ขายส่ง 🌾',
      avatar: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'ของชำและเครื่องปรุง',
      followers: 1620,
      rating: 4.6,
      description: 'สินค้าอุปโภคบริโภค ของแห้ง เครื่องปรุงรส ราคาประหยัด คุ้มค่าสำหรับทุกครัวเรือน'
    };
  } else {
    return {
      name: 'สบายดีมาร์เก็ต สาขาใหญ่ 🛒',
      avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'สินค้าทั่วไป',
      followers: 5410,
      rating: 4.8,
      description: 'ศูนย์รวมสินค้าอเนกประสงค์หลากหลายประเภท คัดสรรเพื่อคุณภาพชีวิตที่ดีของชุมชนสบายดี'
    };
  }
};

// 2. Follow Shop state management using LocalStorage
const FOLLOWED_SHOPS_KEY = 'app_followed_shops';

export const getFollowedShops = (): Shop[] => {
  try {
    const list = localStorage.getItem(FOLLOWED_SHOPS_KEY);
    if (!list) return [];
    
    // Parse followed shop names
    const followedNames: string[] = JSON.parse(list);
    // Map back to Shop details (categories: vegetables, fruits, meats, grocer, default)
    const allShopCategories = ['ผัก', 'ผลไม้', 'เนื้อสัตว์', 'อาหารแห้ง', 'ทั่วไป'];
    const uniqueShops = allShopCategories.map(cat => getShopForProduct(cat));
    
    return uniqueShops.filter(shop => followedNames.includes(shop.name));
  } catch {
    return [];
  }
};

export const isShopFollowed = (shopName: string): boolean => {
  try {
    const list = localStorage.getItem(FOLLOWED_SHOPS_KEY);
    if (!list) return false;
    const followedNames: string[] = JSON.parse(list);
    return followedNames.includes(shopName);
  } catch {
    return false;
  }
};

export const toggleFollowShop = (shopName: string): boolean => {
  try {
    const list = localStorage.getItem(FOLLOWED_SHOPS_KEY);
    let followedNames: string[] = list ? JSON.parse(list) : [];
    
    const isCurrentlyFollowed = followedNames.includes(shopName);
    if (isCurrentlyFollowed) {
      followedNames = followedNames.filter(name => name !== shopName);
    } else {
      followedNames.push(shopName);
    }
    
    localStorage.setItem(FOLLOWED_SHOPS_KEY, JSON.stringify(followedNames));
    
    // Dispatch custom event to notify other components (e.g. Profile page)
    window.dispatchEvent(new Event('follow-status-changed'));
    
    return !isCurrentlyFollowed;
  } catch {
    return false;
  }
};

export const getShopFollowerCount = (shopName: string): number => {
  // Base follower count from static data
  const allShopCategories = ['ผัก', 'ผลไม้', 'เนื้อสัตว์', 'อาหารแห้ง', 'ทั่วไป'];
  const shop = allShopCategories.map(cat => getShopForProduct(cat)).find(s => s.name === shopName);
  const baseFollowers = shop ? shop.followers : 100;
  
  // Plus 1 if followed by user
  return isShopFollowed(shopName) ? baseFollowers + 1 : baseFollowers;
};

export const base64ToBlobUrl = (base64Data: string): string => {
  try {
    const parts = base64Data.split(';base64,');
    if (parts.length < 2) return base64Data;
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: contentType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to convert base64 to blob url', e);
    return base64Data;
  }
};

// 3. Media Gallery (Images & Videos) Generator based on Category/ID
export const getProductMedia = (_productId: string, primaryImageUrl: string, category: string, videoUrl?: string): ProductMedia[] => {
  const mediaList: ProductMedia[] = [];
  
  // 1. Primary image (always first)
  mediaList.push({ type: 'image', url: primaryImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' });
  
  // 2. If a custom video is uploaded, show it
  if (videoUrl) {
    const finalVideoUrl = videoUrl.startsWith('data:') ? base64ToBlobUrl(videoUrl) : videoUrl;
    mediaList.push({ type: 'video', url: finalVideoUrl });
  }

  const normCategory = category ? category.trim() : 'ทั่วไป';
  
  // 3. Extra images based on category
  if (normCategory.includes('ผัก')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-being-washed-in-a-sink-40546-large.mp4' });
    }
  } else if (normCategory.includes('ผลไม้')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-fresh-red-apples-covered-in-water-droplets-34287-large.mp4' });
    }
  } else if (normCategory.includes('เนื้อ') || normCategory.includes('ทะเล') || normCategory.includes('สัตว์')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-cutting-raw-meat-on-a-wooden-board-40618-large.mp4' });
    }
  } else {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1488459718432-010558b15930?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-grocery-shopping-in-the-supermarket-41584-large.mp4' });
    }
  }
  
  return mediaList;
};

// 4. Product Reviews & Ratings (Mock + Custom User Reviews)
const USER_REVIEWS_KEY = 'app_user_reviews';

const mockReviewTemplates: Record<string, { comment: string; rating: number }[]> = {
  vegetables: [
    { comment: 'ผักสดมากๆ ครับ มีดินติดมานิดหน่อยแสดงว่าสดจริง ล้างเสร็จแล้วกรอบอร่อยมาก แนะนำเลย!', rating: 5 },
    { comment: 'คุณภาพดีมากค่ะ จัดส่งไวแพ็คมาดีมาก ใบไม่ช้ำเลย ราคาไม่แพง สั่งต่อแน่นอน', rating: 5 },
    { comment: 'ผักสดสะอาดดี แต่บางชิ้นขนาดค่อนข้างเล็กไปนิดนึง โดยรวมพึงพอใจค่ะ', rating: 4 }
  ],
  fruits: [
    { comment: 'ผลไม้หวานฉ่ำมาก กลิ่นหอมฟุ้งเลย ลูกใหญ่และไม่มีรอยช้ำเลย สดจริงๆ ครับ', rating: 5 },
    { comment: 'สดสะอาด อร่อยหวานเจี๊ยบ เด็กๆ ชอบมากค่ะ การขนส่งดีมากผลไม้ไม่ช้ำเลย', rating: 5 },
    { comment: 'รสชาติดีมากค่ะ แต่อยากให้ลดราคาลงอีกนิดนึงจะเยียมมาก แต่ของเค้าดีจริง', rating: 4 }
  ],
  meats: [
    { comment: 'เนื้อสดมากครับ สีแดงสวย ไม่มีกลิ่นเหม็นอับเลย เอามาทำอาหารอร่อยมาก เนื้อนุ่มดี', rating: 5 },
    { comment: 'แพ็คซีลสูญญากาศมาอย่างดี สะอาดมากค่ะ ซื้อมาทำกับข้าวทานสบายใจ ปลอดภัย', rating: 5 },
    { comment: 'เนื้อสดคุณภาพดี แต่การจัดส่งช้าไปนิดนึง น้ำแข็งละลายไปหน่อย แต่โชคดีเนื้อยังเย็นอยู่', rating: 4 }
  ],
  general: [
    { comment: 'ได้รับสินค้าถูกต้องครบถ้วน คุณภาพดีเหมาะสมกับราคา แนะนำร้านนี้เลยครับ', rating: 5 },
    { comment: 'สินค้าดี ใช้งานได้ดี ตรงตามปกทุกอย่าง แพ็คสินค้าดีเยี่ยม จัดส่งรวดเร็วทันใจค่ะ', rating: 5 },
    { comment: 'คุณภาพพอใช้ได้ตามราคาค่ะ การให้บริการจากร้านค้าและขนส่งดีมากค่ะ', rating: 4 }
  ]
};

const getBaseReviews = (productId: string, category: string): Review[] => {
  const normCategory = category ? category.trim() : 'ทั่วไป';
  let templates = mockReviewTemplates.general;
  
  if (normCategory.includes('ผัก')) {
    templates = mockReviewTemplates.vegetables;
  } else if (normCategory.includes('ผลไม้')) {
    templates = mockReviewTemplates.fruits;
  } else if (normCategory.includes('เนื้อ') || normCategory.includes('ทะเล') || normCategory.includes('สัตว์')) {
    templates = mockReviewTemplates.meats;
  }
  
  // Use character codes in productId to seed stable reviewer names and dates
  const reviewers = ['คุณมานะ', 'คุณพิสมัย', 'คุณสมชาย', 'คุณกนกวรรณ', 'คุณสุรเดช'];
  const dates = ['2026-06-05', '2026-06-03', '2026-05-28', '2026-05-15', '2026-05-01'];
  
  return templates.map((template, idx) => {
    const charCodeSum = productId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const rIdx = (charCodeSum + idx) % reviewers.length;
    const dIdx = (charCodeSum + idx) % dates.length;
    
    return {
      id: `mock-${productId}-${idx}`,
      reviewerName: reviewers[rIdx],
      rating: template.rating,
      comment: template.comment,
      date: dates[dIdx],
      helpfulCount: (charCodeSum * (idx + 1)) % 15
    };
  });
};

export const getProductReviews = (productId: string, category: string): Review[] => {
  const baseReviews = getBaseReviews(productId, category);
  
  try {
    const list = localStorage.getItem(USER_REVIEWS_KEY);
    if (!list) return baseReviews;
    
    const userReviews: any[] = JSON.parse(list);
    const productUserReviews = userReviews
      .filter(r => r.productId === productId)
      .map(r => ({
        id: r.id || `user-${Date.now()}-${Math.random()}`,
        reviewerName: r.reviewerName || 'ผู้ใช้งานทดสอบ',
        rating: r.rating,
        comment: r.comment,
        date: r.date || new Date().toISOString().split('T')[0],
        helpfulCount: r.helpfulCount || 0
      }));
      
    // User reviews first, followed by base reviews
    return [...productUserReviews, ...baseReviews];
  } catch {
    return baseReviews;
  }
};

export const submitProductReview = (productId: string, rating: number, comment: string, reviewerName: string): Review => {
  const newReview = {
    id: `user-${Date.now()}-${Math.random()}`,
    productId,
    reviewerName: reviewerName || 'ผู้ซื้อทั่วไป',
    rating,
    comment,
    date: new Date().toISOString().split('T')[0],
    helpfulCount: 0
  };
  
  try {
    const list = localStorage.getItem(USER_REVIEWS_KEY);
    const userReviews: any[] = list ? JSON.parse(list) : [];
    userReviews.push(newReview);
    localStorage.setItem(USER_REVIEWS_KEY, JSON.stringify(userReviews));
  } catch (e) {
    console.error('Failed to save user review', e);
  }
  
  return {
    id: newReview.id,
    reviewerName: newReview.reviewerName,
    rating: newReview.rating,
    comment: newReview.comment,
    date: newReview.date,
    helpfulCount: 0
  };
};

export const getAverageRating = (productId: string, category: string) => {
  const reviews = getProductReviews(productId, category);
  if (reviews.length === 0) {
    return { rating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  
  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  const avg = parseFloat((sum / reviews.length).toFixed(1));
  
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const roundedRating = Math.round(r.rating);
    if (distribution[roundedRating] !== undefined) {
      distribution[roundedRating] += 1;
    }
  });
  
  return {
    rating: avg,
    totalReviews: reviews.length,
    distribution
  };
};

export interface ProductVariant {
  name: string;
  priceAdjustment: number;
}

export const getVariantsForProduct = (category: string, basePrice: number): ProductVariant[] => {
  const normCategory = category ? category.trim() : 'ทั่วไป';
  
  if (normCategory.includes('ผัก') || normCategory.includes('ผลไม้')) {
    return [
      { name: 'ขนาดปกติ (500ก.)', priceAdjustment: 0 },
      { name: 'แพ็คใหญ่จุใจ (1กก.)', priceAdjustment: Math.round(basePrice * 0.8) }
    ];
  } else if (normCategory.includes('เนื้อ') || normCategory.includes('ทะเล') || normCategory.includes('สัตว์') || normCategory.includes('สด')) {
    return [
      { name: 'ขนาด 1 กิโลกรัม', priceAdjustment: 0 },
      { name: 'แพ็คพรีเมียม 2 กิโลกรัม', priceAdjustment: Math.round(basePrice * 0.9) }
    ];
  } else {
    return [
      { name: 'แพ็คเกจเดี่ยว', priceAdjustment: 0 },
      { name: 'แพ็คคู่สุดคุ้ม', priceAdjustment: Math.round(basePrice * 0.95) }
    ];
  }
};
