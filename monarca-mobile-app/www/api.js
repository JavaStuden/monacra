/* Monarca · Server API & Remote Sync Module
 * Communicates with Spring Boot backend at itsmonarca.com
 */
(() => {
  'use strict';

  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isServerDomain = window.location.hostname.includes('itsmonarca.com');
  
  // If running on itsmonarca.com, use relative /api/v1
  // If running locally or inside native Android/iOS app, use https://itsmonarca.com/api/v1
  const API_BASE = isServerDomain ? '/api/v1' : 'https://itsmonarca.com/api/v1';

  const unwrap = async response => {
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json.code !== 200) {
      throw new Error(json.message || 'Payment service is unavailable');
    }
    return json.data;
  };

  const orderPayload = (orderData, paymentMethod = orderData.payment || 'visa', chargeCurrency) => ({
    items: (orderData.items || []).map(l => ({
      productId: l.id,
      color: l.color || '',
      size: l.size || '',
      qty: l.qty || 1
    })),
    customerName: orderData.address?.name || '',
    customerPhone: orderData.address?.phone || '',
    city: orderData.address?.city || '',
    locality: orderData.address?.locality || orderData.address?.city || '',
    area: orderData.address?.area || '',
    street: orderData.address?.street || '',
    landmark: orderData.address?.landmark || '',
    building: orderData.address?.building || '',
    apartment: orderData.address?.apartment || '',
    paymentMethod,
    chargeCurrency: chargeCurrency || orderData.chargeCurrency || undefined,
    expectedTotal: orderData.total ?? undefined,
    couponCode: orderData.couponCode || '',
    deliveryNote: orderData.orderNote || ''
  });

  window.MonarcaAPI = {
    baseUrl: API_BASE,

    // 1. Fetch live product catalog
    async getProducts(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const url = `${API_BASE}/products${query ? '?' + query : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return json.code === 200 && Array.isArray(json.data) ? json.data : null;
      } catch (e) {
        console.warn('[MonarcaAPI] getProducts fallback to local:', e.message);
        return null;
      }
    },

    // 2. Fetch checkout quote with server dual-sourcing & COD rules
    async calculateQuote(items, couponCode = '') {
      try {
        const payload = {
          items: items.map(l => ({
            productId: l.id,
            color: l.color || '',
            size: l.size || '',
            qty: l.qty || 1
          })),
          couponCode: couponCode || ''
        };
        const res = await fetch(`${API_BASE}/checkout/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return json.data || null;
      } catch (e) {
        console.warn('[MonarcaAPI] calculateQuote fallback to local:', e.message);
        return null;
      }
    },

    // 3. Place order and record in backend database
    async placeOrder(orderData) {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload(orderData))
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return json.data || null;
      } catch (e) {
        console.warn('[MonarcaAPI] placeOrder offline fallback:', e.message);
        return null;
      }
    },

    async createStripeCheckout(orderData, chargeCurrency = 'USD') {
      const res = await fetch(`${API_BASE}/payments/stripe/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload(orderData, 'stripe', chargeCurrency))
      });
      return unwrap(res);
    },

    async createStripeCheckoutSession(orderId, chargeCurrency = 'USD') {
      const query = new URLSearchParams({ chargeCurrency }).toString();
      const res = await fetch(`${API_BASE}/payments/stripe/orders/${encodeURIComponent(orderId)}/checkout-session?${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return unwrap(res);
    },

    async getStripePaymentStatus(orderId) {
      const res = await fetch(`${API_BASE}/payments/stripe/orders/${encodeURIComponent(orderId)}/status`);
      return unwrap(res);
    },

    // 4. Fetch latest status of an order
    async getOrder(orderId) {
      try {
        const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || null;
      } catch (e) {
        return null;
      }
    },

    // 5. Submit return request
    async submitReturn(orderId, itemIndex, reason, qty, note = '') {
      try {
        const payload = {
          itemIndex: Number(itemIndex),
          reason: String(reason),
          quantity: Number(qty) || 1,
          note: String(note || '')
        };
        const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return json.data || null;
      } catch (e) {
        console.warn('[MonarcaAPI] submitReturn error:', e.message);
        return null;
      }
    },

    // 6. Fetch store config
    async getConfig() {
      try {
        const res = await fetch(`${API_BASE}/config`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || null;
      } catch (e) {
        return null;
      }
    }
  };

  const productImagePattern = /^\/api\/v1\/product-images\/[0-9a-f-]{36}\.(?:jpg|png)$/;
  const csv = value => String(value ?? '').split(',').map(item => item.trim()).filter(Boolean);

  function syncProduct(store, remote) {
    const id = Number(remote.id);
    if (!Number.isSafeInteger(id) || id < 1) return;
    let product = store.products.find(item => item.id === id);
    if (!product) {
      product = {
        id, introduced: id, sku: 'MON-' + String(id).padStart(4, '0'),
        name: '', en: '', colors: ['black'], sizes: ['مقاس موحّد']
      };
      store.products.push(product);
    }
    const colorOptions = (Array.isArray(remote.colorOptions) ? remote.colorOptions : []).slice(0, 20).filter(o =>
      o && typeof o.key === 'string' && !['__proto__', 'constructor', 'prototype'].includes(o.key)
      && /^[\p{L}\p{M}\p{N} _-]{1,24}$/u.test(o.key) && /^#[0-9a-f]{6}$/i.test(o.hex || '')
      && ['nameAr', 'nameEn'].every(k => typeof o[k] === 'string' && o[k].trim() && o[k].length <= 40 && !/[<>&"'\x00-\x1f]/.test(o[k])));
    for (const o of colorOptions) store.colors[o.key] = [o.nameAr, o.hex, o.nameEn];
    const colors = csv(remote.colors).filter(color => Object.hasOwn(store.colors, color));
    const sizes = csv(remote.sizes);
    const paths = Array.isArray(remote.imageUrls) ? remote.imageUrls : [remote.imageUrl];
    const imageUrls = paths.filter(path => productImagePattern.test(path))
      .map(path => 'https://itsmonarca.com' + path);
    const imageColors = {};
    for (const [path, color] of Object.entries(remote.imageColors || {})) {
      const url = 'https://itsmonarca.com' + path;
      if (imageUrls.includes(url) && colors.includes(color)) imageColors[url] = color;
    }
    Object.assign(product, {
      name: remote.name || product.name,
      en: remote.enName || remote.name || product.en,
      cat: remote.category || product.cat,
      gender: remote.gender ?? 'women',
      sub: remote.subCategory || product.sub,
      img: remote.imgIndex ?? product.img,
      imageUrl: imageUrls[0] || '',
      imageUrls,
      imageColors,
      colorOptions,
      measure: typeof remote.measure === 'string' ? remote.measure : '',
      sizeChartUrl: productImagePattern.test(remote.sizeChartUrl || '') ? 'https://itsmonarca.com' + remote.sizeChartUrl : '',

      videoUrl: /^\/api\/v1\/product-videos\/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\.mp4$/.test(remote.videoUrl || '')
        ? 'https://itsmonarca.com' + remote.videoUrl : '',
      catalogUnavailable: false,
      price: Number(remote.price),
      old: remote.oldPrice == null ? null : Number(remote.oldPrice),
      stock: Number(remote.stock) || 0,
      fulfillmentSource: remote.fulfillmentSource,
      fulfillment: remote.fulfillment,
      shippingWeightGrams: remote.shippingWeightGrams ?? null,
      badge: remote.badge || '',
      colors: colors.length ? colors : product.colors,
      sizes: sizes.length ? sizes : product.sizes,
      unavailable: Object.hasOwn(remote, 'unavailableSize') ? remote.unavailableSize || '' : product.unavailable
    });
  }

  // Automatically sync products from server when app loads
  async function initServerSync() {
    try {
      const serverProducts = await window.MonarcaAPI.getProducts();
      const store = window.Monarca;
      if (Array.isArray(serverProducts) && store) {
        const listedIds = new Set(serverProducts.map(product => Number(product.id)));
        serverProducts.forEach(product => syncProduct(store, product));
        for (const product of store.products) {
          if (!listedIds.has(product.id)) {
            product.catalogUnavailable = true;
            product.stock = 0;
          }
        }
        const cart = store.state.cart;
        const availableCart = cart.filter(line => listedIds.has(Number(line.id)));
        const savedItems = store.state.savedItems || [];
        const availableSavedItems = savedItems.filter(line => listedIds.has(Number(line.id)));
        if (availableCart.length !== cart.length || availableSavedItems.length !== savedItems.length) {
          store.state.cart = availableCart;
          store.state.savedItems = availableSavedItems;
          store.save();
        }
        if (store.ui.buyNow?.some(line => !listedIds.has(Number(line.id)))) {
          store.ui.buyNow = null;
        }
        store.render(true);
        if (availableCart.length !== cart.length) {
          store.toast(window.MonarcaI18n?.language() === 'en'
            ? 'An unavailable product was removed from your bag.'
            : 'تمت إزالة منتج غير متاح من حقيبة التسوق.');
        }
      }
    } catch (err) {
      console.warn('[MonarcaAPI] initServerSync error:', err);
    }
  }

  // Hook into route changes to sync order status when viewing an order
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('hashchange', async () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('order/') || hash.startsWith('tracking/')) {
        const orderId = hash.split('/')[1];
        if (orderId) {
          const remoteOrder = await window.MonarcaAPI.getOrder(orderId);
          if (remoteOrder && remoteOrder.status) {
            const state = window.Monarca?.state;
            const localOrder = state?.orders?.find(o => o.id === orderId || o.serverId === orderId);
            if (localOrder && localOrder.status !== remoteOrder.status) {
              localOrder.status = remoteOrder.status;
              localOrder.paymentStatus = remoteOrder.paymentStatus;
              if (typeof window.Monarca?.save === 'function') window.Monarca.save();
              if (typeof window.Monarca?.render === 'function') window.Monarca.render(true);
            }
          }
        }
      }
    });

    // Run on startup
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initServerSync);
    } else {
      initServerSync();
    }
  }

})();
