import { ORIGIN, validOrderId } from './core/commerce.js';
let base = `${ORIGIN}/api/v1`;
// #ifdef H5
if (import.meta.env?.DEV) base = '/api/v1';
// #endif
export function request(path, method = 'GET', data) {
  return new Promise((resolve, reject) => uni.request({
    url: base + path, method, data, timeout: 20000,
    header: { 'Content-Type': 'application/json' },
    success: response => {
      const json = response.data;
      if (response.statusCode >= 200 && response.statusCode < 300 && json?.code === 200) resolve(json.data);
      else reject(new Error(json?.message || `HTTP ${response.statusCode}`));
    },
    fail: () => reject(new Error('NETWORK_UNAVAILABLE'))
  }));
}
const orderPath = id => { if (!validOrderId(id)) throw new Error('Invalid order number'); return encodeURIComponent(id); };
export const api = {
  products: () => request('/products'),
  categories: () => request('/categories'),
  quote: (items, couponCode) => request('/checkout/quote', 'POST', { items, couponCode }),
  checkout: payload => request('/payments/stripe/checkout-session', 'POST', payload),
  retry: (id, currency) => request(`/payments/stripe/orders/${orderPath(id)}/checkout-session?chargeCurrency=${currency}`, 'POST'),
  order: id => request(`/orders/${orderPath(id)}`),
  status: id => request(`/payments/stripe/orders/${orderPath(id)}/status`),
  returnRequest: values => request('/returns?' + Object.entries(values).map(([k, v]) => `${k}=${encodeURIComponent(v ?? '')}`).join('&'), 'POST')
};
