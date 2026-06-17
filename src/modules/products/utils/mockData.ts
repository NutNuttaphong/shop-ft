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
  
  if (normalizedCategory.includes('อิเล็กทรอนิกส์')) {
    return {
      name: 'สบายดี เอนเตอร์เทนเมนท์ & ไอที มอลล์ ⚡',
      avatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'อิเล็กทรอนิกส์',
      followers: 18430,
      rating: 4.9,
      description: 'ศูนย์รวมอุปกรณ์ไอที โทรศัพท์มือถือ คอมพิวเตอร์ และแก็ดเจ็ตระดับพรีเมียมจากแบรนด์ชั้นนำ รับประกันของแท้ 100%'
    };
  } else if (normalizedCategory.includes('เสื้อผ้า') || normalizedCategory.includes('แฟชั่น')) {
    return {
      name: 'บิวตี้ แฟชั่น เฮาส์ ช็อป 👗',
      avatar: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'เสื้อผ้าและแฟชั่น',
      followers: 12450,
      rating: 4.8,
      description: 'สตรีทแฟชั่น เสื้อผ้าสไตล์เกาหลี ญี่ปุ่น และเทรนด์โมเดิร์นคลาสสิก เสื้อยืด กางเกงยีนส์ รองเท้า มีให้เลือกจุใจ'
    };
  } else if (normalizedCategory.includes('เครื่องใช้ในบ้าน') || normalizedCategory.includes('บ้าน')) {
    return {
      name: 'โฮม โปร มาสเตอร์ ออฟฟิเชียล 🏠',
      avatar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'เครื่องใช้ในบ้าน',
      followers: 9820,
      rating: 4.7,
      description: 'เครื่องใช้ไฟฟ้าภายในบ้านอัจฉริยะ อุปกรณ์ตกแต่งบ้าน และสินค้าอเนกประสงค์เพื่อความสะดวกสบายของคุณ'
    };
  } else if (normalizedCategory.includes('สุขภาพ') || normalizedCategory.includes('ความงาม') || normalizedCategory.includes('เครื่องสำอาง')) {
    return {
      name: 'แล็บ สกิน แอนด์ บิวตี้ แคร์ 🧪',
      avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'สุขภาพและความงาม',
      followers: 15400,
      rating: 4.9,
      description: 'ผลิตภัณฑ์สกินแคร์ เครื่องสำอาง อาหารเสริม เพื่อสุขภาพผิวพรรณและความงามอย่างอ่อนโยน ปลอดภัย'
    };
  } else if (normalizedCategory.includes('ซูเปอร์มาร์เก็ต') || normalizedCategory.includes('อาหาร') || normalizedCategory.includes('เครื่องปรุง')) {
    return {
      name: 'สบายดี ไฮเปอร์มาร์เก็ต 🌾',
      avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'ซูเปอร์มาร์เก็ตและอาหาร',
      followers: 24500,
      rating: 4.8,
      description: 'สินค้าอุปโภคบริโภค ข้าวสาร อาหารแห้ง เครื่องปรุงรส คัดสรรของดี มีคุณภาพ ราคาประหยัด'
    };
  } else if (normalizedCategory.includes('กีฬา') || normalizedCategory.includes('กลางแจ้ง')) {
    return {
      name: 'สปอร์ต พัลส์ เอาท์ดอร์ 🏃‍♂️',
      avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'กีฬาและกิจกรรมกลางแจ้ง',
      followers: 6730,
      rating: 4.7,
      description: 'อุปกรณ์กีฬา กิจกรรมแค้มปิ้ง ท่องเที่ยว และเครื่องแต่งกายออกกำลังกายอย่างมีระดับ'
    };
  } else {
    return {
      name: 'สบายดี มาร์เก็ต เพลส (สาขาใหญ่) 🛒',
      avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&h=150&q=80',
      category: 'สินค้าทั่วไป',
      followers: 35120,
      rating: 4.8,
      description: 'ศูนย์รวมสินค้าออนไลน์อเนกประสงค์ ครอบคลุมทุกความต้องการของคุณด้วยคุณภาพการบริการระดับสากล'
    };
  }
};

// 2. Follow Shop state management using LocalStorage
const FOLLOWED_SHOPS_KEY = 'app_followed_shops';

export const getFollowedShops = (): Shop[] => {
  try {
    const list = localStorage.getItem(FOLLOWED_SHOPS_KEY);
    if (!list) return [];
    
    const followedNames: string[] = JSON.parse(list);
    // Map back to Shop details
    const allShopCategories = ['อิเล็กทรอนิกส์', 'เสื้อผ้าและแฟชั่น', 'เครื่องใช้ในบ้าน', 'สุขภาพและความงาม', 'ซูเปอร์มาร์เก็ตและอาหาร', 'กีฬาและกิจกรรมกลางแจ้ง', 'ทั่วไป'];
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
  const allShopCategories = ['อิเล็กทรอนิกส์', 'เสื้อผ้าและแฟชั่น', 'เครื่องใช้ในบ้าน', 'สุขภาพและความงาม', 'ซูเปอร์มาร์เก็ตและอาหาร', 'กีฬาและกิจกรรมกลางแจ้ง', 'ทั่วไป'];
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
  if (normCategory.includes('อิเล็กทรอนิกส์')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-operating-a-smartphone-40539-large.mp4' });
    }
  } else if (normCategory.includes('เสื้อผ้า') || normCategory.includes('แฟชั่น')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-details-of-a-woman-in-a-red-coat-39832-large.mp4' });
    }
  } else if (normCategory.includes('เครื่องใช้ในบ้าน') || normCategory.includes('บ้าน')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1527515636458-747d28915ff4?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-robot-vacuum-cleaner-working-in-a-room-33534-large.mp4' });
    }
  } else if (normCategory.includes('สุขภาพ') || normCategory.includes('ความงาม')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-cream-being-spread-on-skin-33100-large.mp4' });
    }
  } else if (normCategory.includes('ซูเปอร์มาร์เก็ต') || normCategory.includes('อาหาร')) {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-grocery-shopping-in-the-supermarket-41584-large.mp4' });
    }
  } else {
    mediaList.push(
      { type: 'image', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' }
    );
    if (!videoUrl) {
      mediaList.push({ type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-delivery-guy-handing-over-packages-40763-large.mp4' });
    }
  }
  
  return mediaList;
};

// 4. Product Reviews & Ratings (Mock + Custom User Reviews)
const USER_REVIEWS_KEY = 'app_user_reviews';

const mockReviewTemplates: Record<string, { comment: string; rating: number }[]> = {
  electronics: [
    { comment: 'คุณภาพสินค้าดีมากกกก ของแท้ 100% สภาพกล่องมาสมบูรณ์ การทำงานลื่นไหล ไม่มีสะดุดเลยครับ คุ้มราคาสุดๆ', rating: 5 },
    { comment: 'จัดส่งรวดเร็วมาก แพ็คมาหนาแน่นใส่ใจรายละเอียด ตัวเครื่องสวยหรู ดีไซน์ทันสมัย ชอบมากค่ะ', rating: 5 },
    { comment: 'สินค้าดีตรงตามหน้าเว็บเป๊ะ แต่ตัวกล่องมีรอยบุบจากการขนส่งนิดหน่อย อุปกรณ์ข้างในไม่มีปัญหาอะไรครับ', rating: 4 }
  ],
  fashion: [
    { comment: 'เนื้อผ้าดีใส่สบายมาก ทรงสวยพรีเมียม ตัดเย็บดีเยี่ยมเหมาะสมกับแบรนด์ ใส่พอดีตัวเลยค่ะ แนะนำร้านนี้เลย', rating: 5 },
    { comment: 'การออกแบบสวย ทันสมัย สีสันตรงตามปก ยืดหยุ่นดี ใส่แล้วไม่ร้อน ระบายอากาศได้ดีมาก', rating: 5 },
    { comment: 'ขนาดคลาดเคลื่อนไปนิดหน่อยเมื่อเทียบกับตารางขนาด แต่แลกกับเนื้อผ้าที่ดี สวยงาม โดยรวมพึงพอใจค่ะ', rating: 4 }
  ],
  appliances: [
    { comment: 'ใช้ดีมากครับ ตั้งแต่ซื้อมาใช้งานแทบทุกวัน ประหยัดพลังงาน ทำความสะอาดง่าย คุ้มค่าชีวิตมากๆ', rating: 5 },
    { comment: 'ตัวเครื่องทำงานเงียบ ปลอดภัย ใช้งานง่ายสะดวดสบาย สีสวย มินิมอลเข้ากับห้องสุดๆ แพ็คสินค้าดีมาก', rating: 5 },
    { comment: 'ขนส่งเร็วมากค่ะ การใช้งานโดยรวมดีมาก แต่สายไฟสั้นไปนิดนึง ต้องใช้ปลั๊กพ่วงช่วยค่ะ', rating: 4 }
  ],
  beauty: [
    { comment: 'ซึมซาบเร็วมาก กลิ่นหอมละมุนอ่อนโยน ไม่แพ้เลยค่ะ ผิวชุ่มชื้นขึ้นมาก ซื้อซ้ำขวดที่สองแล้ว!', rating: 5 },
    { comment: 'คุ้มค่ามากๆ ค่ะ ใช้แล้วหน้านุ่มขึ้นอย่างเห็นได้ชัด ของแท้แน่นอน ร้านนี้ส่งของแท้แพ็คห่อกันกระแทกดีมาก', rating: 5 },
    { comment: 'แพ็คเกจสวยหรู ผลิตภัณฑ์ใช้ดี แต่อยากให้ลดราคาจัดโปรโมชันบ่อยๆ จะได้เป็นลูกค้าประจำค่ะ', rating: 4 }
  ],
  general: [
    { comment: 'ได้รับสินค้าถูกต้องครบถ้วน คุณภาพดีเหมาะสมกับราคา แนะนำร้านนี้เลยครับ', rating: 5 },
    { comment: 'สินค้าดี ใช้งานได้ดี ตรงตามปกอย่างทุกอย่าง แพ็คสินค้าดีเยี่ยม จัดส่งรวดเร็วทันใจค่ะ', rating: 5 },
    { comment: 'คุณภาพพอใช้ได้ตามราคาค่ะ การให้บริการจากร้านค้าและขนส่งดีมากค่ะ', rating: 4 }
  ]
};

const getBaseReviews = (productId: string, category: string): Review[] => {
  const normCategory = category ? category.trim() : 'ทั่วไป';
  let templates = mockReviewTemplates.general;
  
  if (normCategory.includes('อิเล็กทรอนิกส์')) {
    templates = mockReviewTemplates.electronics;
  } else if (normCategory.includes('เสื้อผ้า') || normCategory.includes('แฟชั่น')) {
    templates = mockReviewTemplates.fashion;
  } else if (normCategory.includes('เครื่องใช้ในบ้าน') || normCategory.includes('บ้าน')) {
    templates = mockReviewTemplates.appliances;
  } else if (normCategory.includes('สุขภาพ') || normCategory.includes('ความงาม')) {
    templates = mockReviewTemplates.beauty;
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
  
  if (normCategory.includes('อิเล็กทรอนิกส์')) {
    return [
      { name: 'สเปกมาตรฐาน (128GB)', priceAdjustment: 0 },
      { name: 'เพิ่มความจุพิเศษ (256GB)', priceAdjustment: Math.round(basePrice * 0.12) },
      { name: 'ระดับท็อปโปร (512GB)', priceAdjustment: Math.round(basePrice * 0.28) }
    ];
  } else if (normCategory.includes('เสื้อผ้า') || normCategory.includes('แฟชั่น')) {
    return [
      { name: 'ไซส์ M (สลิมฟิต)', priceAdjustment: 0 },
      { name: 'ไซส์ L (คอมฟอร์ทฟิต)', priceAdjustment: 0 },
      { name: 'ไซส์ XL (โอเวอร์ไซส์)', priceAdjustment: 20 }
    ];
  } else if (normCategory.includes('เครื่องใช้ในบ้าน') || normCategory.includes('บ้าน')) {
    return [
      { name: 'สีขาวคลาสสิก (มินิมอล)', priceAdjustment: 0 },
      { name: 'สีดำหรูหรา (สเปซแบล็ค)', priceAdjustment: 100 }
    ];
  } else if (normCategory.includes('สุขภาพ') || normCategory.includes('ความงาม')) {
    return [
      { name: 'ขนาดทดลอง (30ml)', priceAdjustment: 0 },
      { name: 'ขวดมาตรฐาน (50ml)', priceAdjustment: Math.round(basePrice * 0.5) },
      { name: 'ขวดสุดคุ้ม (100ml)', priceAdjustment: Math.round(basePrice * 1.1) }
    ];
  } else {
    return [
      { name: 'แพ็คเกจเดี่ยว', priceAdjustment: 0 },
      { name: 'แพ็คคู่สุดคุ้ม', priceAdjustment: Math.round(basePrice * 0.95) }
    ];
  }
};
