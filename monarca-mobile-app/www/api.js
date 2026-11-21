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
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return json.data || [];
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

    async createStripeCheckout(orderData) {
      const res = await fetch(`${API_BASE}/payments/stripe/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload(orderData, 'stripe', 'AED'))
      });
      return unwrap(res);
    },

    async createStripeCheckoutSession(orderId, chargeCurrency = 'AED') {
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

  // Automatically sync products from server when app loads
  async function initServerSync() {
    try {
      const serverProducts = await window.MonarcaAPI.getProducts();
      if (serverProducts && Array.isArray(serverProducts) && serverProducts.length > 0) {
        const localProducts = window.Monarca?.products;
        if (Array.isArray(localProducts)) {
          serverProducts.forEach(sp => {
            const p = localProducts.find(x => x.id === sp.id);
            if (p) {
              p.price = Number(sp.price);
              if (sp.oldPrice) p.old = Number(sp.oldPrice);
              p.stock = sp.stock;
              p.fulfillmentSource = sp.fulfillmentSource;
              p.fulfillment = sp.fulfillment;
              if (sp.name) p.name = sp.name;
              if (sp.enName) p.en = sp.enName;
            }
          });
          // Re-render if home or catalog is active
          if (typeof window.Monarca?.render === 'function') {
            window.Monarca.render(true);
          }
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
