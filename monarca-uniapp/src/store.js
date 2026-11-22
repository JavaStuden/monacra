import { reactive } from 'vue';
import { api } from './api.js';
import { normalizeProduct, lineKey, consumePurchasedLines, matchesDepartment } from './core/commerce.js';
const STORAGE_KEY = 'monarca-uniapp-v1';
function restore() { try { const s = uni.getStorageSync(STORAGE_KEY); return s && typeof s === 'object' ? s : {}; } catch { return {}; } }
const saved = restore();
export const state = reactive({
  language: saved.language === 'en' ? 'en' : 'ar',
  department: saved.department === 'men' ? 'men' : 'women',
  cart: Array.isArray(saved.cart) ? saved.cart : [], wish: Array.isArray(saved.wish) ? saved.wish : [],
  addresses: Array.isArray(saved.addresses) ? saved.addresses : [], selectedAddressId: saved.selectedAddressId || '',
  orders: Array.isArray(saved.orders) ? saved.orders : [], pending: saved.pending || {},
  returns: Array.isArray(saved.returns) ? saved.returns : [], products: [], loading: false, catalogError: '',
  storageError: ''
});
export function persist() {
  try {
    const { language, department, cart, wish, addresses, selectedAddressId, orders, pending, returns } = state;
    uni.setStorageSync(STORAGE_KEY, JSON.parse(JSON.stringify({ language, department, cart, wish, addresses, selectedAddressId, orders, pending, returns })));
    state.storageError = '';
  } catch { state.storageError = 'STORAGE_UNAVAILABLE'; throw new Error('STORAGE_UNAVAILABLE'); }
}
let catalogPromise;
export function refreshProducts() {
  if (catalogPromise) return catalogPromise;
  state.loading = true;
  catalogPromise = api.products().then(rows => {
    if (!Array.isArray(rows)) throw new Error('Invalid catalogue response');
    state.products = rows.map(normalizeProduct); state.catalogError = '';
  }).catch(error => { state.catalogError = error.message; throw error; }).finally(() => { state.loading = false; catalogPromise = null; });
  return catalogPromise;
}
export function addCart(line) {
  const existing = state.cart.find(item => lineKey(item) === lineKey(line));
  if (existing) { existing.qty += line.qty; existing.selected = true; } else state.cart.push({ ...line, selected: true });
  persist();
}
export function toggleWish(id) { state.wish = state.wish.includes(id) ? state.wish.filter(x => x !== id) : [...state.wish, id]; persist(); }
export function saveOrder(order) {
  const existing = state.orders.find(x => x.id === order.id);
  if (existing) Object.assign(existing, order); else state.orders.unshift(order);
  persist(); return existing || order;
}
export async function syncOrder(id) {
  const [order, status] = await Promise.all([api.order(id), api.status(id)]);
  const pending = state.pending[id];
  if (status.paymentStatus === 'paid' && pending && !pending.consumed) {
    state.cart = consumePurchasedLines(state.cart, pending.cartLines || []); pending.consumed = true;
  }
  return saveOrder({ ...order, ...status, id, status: status.orderStatus || order.status });
}
export function toast(value) { uni.showToast({ title: String(value), icon: 'none', duration: 2600 }); }
export function go(page, query = {}) {
  if (['catalog', 'categories', 'search'].includes(page)) query = { gender: state.department, ...query };
  const suffix = Object.entries(query).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  uni.navigateTo({ url: `/pages/${page}/index${suffix ? '?' + suffix : ''}`, fail: () => uni.redirectTo({ url: `/pages/${page}/index${suffix ? '?' + suffix : ''}` }) });
}
export function root(page) { uni.reLaunch({ url: `/pages/${page}/index` }); }
export function setLanguage(language) { state.language = language; persist(); }
export const browseProducts = () => state.products.filter(product => matchesDepartment(product, state.department));
export function setDepartment(department) {
  if (!['women', 'men'].includes(department)) return;
  state.department = department;
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const [path, query = ''] = window.location.hash.slice(1).split('?');
    if (['/pages/catalog/index', '/pages/categories/index', '/pages/search/index'].includes(path)) {
      const parameters = new URLSearchParams(query);
      parameters.set('gender', department);
      parameters.delete('sub');
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${path}?${parameters}`);
    }
  }
  // #endif
  persist();
}
export function openExternal(url) {
  // #ifdef APP-PLUS
  plus.runtime.openURL(url, () => toast('Could not open the link'));
  // #endif
  // #ifdef H5
  window.open(url, '_blank', 'noopener,noreferrer');
  // #endif
}
