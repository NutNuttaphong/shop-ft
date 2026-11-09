export function getCarrierTrackingUrl(carrier?: string, trackingNumber?: string): string | null {
  if (!trackingNumber) return null;
  const c = (carrier || '').toLowerCase();
  if (c.includes('flash')) {
    return `https://www.flashexpress.co.th/tracking/?se=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('kerry') || c.includes('kex')) {
    return `https://th.kerryexpress.com/th/track/?track=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('j&t') || c.includes('jt')) {
    return `https://www.jtexpress.co.th/trajectoryQuery?bills=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('ไปรษณีย์') || c.includes('thai') || c.includes('ems')) {
    return `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(trackingNumber)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier || 'เช็คพัสดุ'} ${trackingNumber}`)}`;
}
