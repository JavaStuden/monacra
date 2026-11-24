import { safeColorOptions } from './product-options.js';
export const ORIGIN = 'https://itsmonarca.com';
export const USD_AED_RATE = 3.67;
export const csv = value => Array.isArray(value) ? value : String(value || '').split(',').map(x => x.trim()).filter(Boolean);
export const sizeName = (size, english) => english && size === 'مقاس موحّد' ? 'One size' : size;
export const lineKey = line => JSON.stringify([Number(line.productId), line.color || '', line.size || '']);
export const toMinor = value => Math.round((Number(value) + Number.EPSILON) * 100);
export const aedAmount = usd => Math.round(toMinor(usd) * 367 / 100) / 100;
export const validOrderId = id => /^M-ORD-[A-Z0-9-]{4,64}$/.test(String(id));
export function matchesDepartment(product, department) {
  const gender = product?.gender ?? 'women';
  return ['women', 'men'].includes(department) && (gender === department || gender === 'unisex');
}
export function safeImage(value) {
  if (typeof value !== 'string') return '';
  return /^\/api\/v1\/product-images\/[a-f0-9-]{36}\.(jpg|png)$/.test(value) ? ORIGIN + value : '';
}
export function safeVideo(value) {
  return typeof value === 'string' && /^\/api\/v1\/product-videos\/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\.mp4$/.test(value) ? ORIGIN + value : '';
}
export function normalizeProduct(p) {
  const remote = csv(p.imageUrls?.length ? p.imageUrls : p.imageUrl).map(safeImage).filter(Boolean);
  const index = p.imgIndex == null ? -1 : Number(p.imgIndex);
  const fallback = Number.isInteger(index) && index >= 0 && index <= 6 ? `/static/products/${index}.jpg` : '/static/product-placeholder.png';
  const colors = csv(p.colors), imageColors = {};
  for (const [path, color] of Object.entries(p.imageColors || {})) {
    const url = safeImage(path);
    if (remote.includes(url) && colors.includes(color)) imageColors[url] = color;
  }
  return { ...p, id: Number(p.id), price: Number(p.price), colors, sizes: csv(p.sizes), images: remote.length ? remote : [fallback], imageColors, videoUrl: safeVideo(p.videoUrl), colorOptions: safeColorOptions(p.colorOptions), sizeChartUrl: safeImage(p.sizeChartUrl) };
}
export function imagesForColor(product, color) {
  const images = product?.images || [], assignments = product?.imageColors || {};
  const matched = images.filter(url => assignments[url] === color);
  const general = images.filter(url => !assignments[url]);
  return matched.length ? [...matched, ...general] : general.length ? general : images;
}
export function validateVariant(product, line) {
  if (!product || !Number.isSafeInteger(line.qty) || line.qty < 1 || line.qty > 99) return false;
  return product.colors.includes(line.color) && product.sizes.includes(line.size)
    && line.size !== product.unavailableSize && (product.stock == null || product.stock >= line.qty);
}
export function orderPayload(lines, address, quote, currency, note = '') {
  if (!['USD', 'AED'].includes(currency)) throw new Error('Unsupported currency');
  if (!lines.length || !quote || !Number.isFinite(Number(quote.total)) || Number(quote.total) <= 0) throw new Error('A live quote is required');
  return {
    items: lines.map(({ productId, color, size, qty }) => ({ productId, color, size, qty })),
    customerName: address.name, customerPhone: address.phone, city: address.city,
    locality: address.locality || address.city, area: address.area, street: address.street,
    landmark: address.landmark || '', building: address.building || '', apartment: address.apartment || '',
    deliveryNote: note, paymentMethod: 'stripe', chargeCurrency: currency,
    expectedTotal: Number(quote.total), couponCode: quote.appliedCoupon || ''
  };
}
export function validateCheckoutSession(session, currency, usdTotal) {
  const expected = currency === 'AED' ? aedAmount(usdTotal) : Number(usdTotal);
  if (!validOrderId(session?.orderId) || !/^https:\/\/checkout\.stripe\.com\//.test(session.url || '')
      || session.chargeCurrency !== currency || toMinor(session.chargeAmount) !== toMinor(expected)) {
    throw new Error('Payment session could not be verified. Contact the store before retrying.');
  }
  return session;
}
export function consumePurchasedLines(cart, purchased) {
  const result = cart.map(line => ({ ...line }));
  for (const item of purchased) {
    const line = result.find(x => lineKey(x) === lineKey(item));
    if (line) line.qty = Math.max(0, line.qty - item.qty);
  }
  return result.filter(x => x.qty > 0);
}
export function checkoutFingerprint(payload) { return JSON.stringify(payload); }
export function addressValid(a) {
  return !!a?.name?.trim() && /^(?:\+964|00964|0)7\d{9}$/.test((a.phone || '').replace(/[\s()-]/g, ''))
    && ['city', 'area', 'street'].every(key => !!a[key]?.trim());
}
