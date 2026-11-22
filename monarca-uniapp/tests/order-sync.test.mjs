import test from 'node:test';
import assert from 'node:assert/strict';

let paymentStatus = 'pending', disk = null, statusCalls = 0, publicListCalls = 0;
const id = 'M-ORD-12345678-ABC';
globalThis.uni = {
  getStorageSync: () => disk,
  setStorageSync: (key, value) => { disk = JSON.parse(JSON.stringify(value)); },
  request: options => {
    const isStatus = options.url.endsWith('/status');
    if (isStatus) statusCalls++;
    if (options.url.endsWith('/orders')) publicListCalls++;
    const data = isStatus
      ? { orderId: id, paymentStatus, orderStatus: paymentStatus === 'paid' ? 'placed' : 'payment_pending', paidTotal: paymentStatus === 'paid' ? 140 : 0 }
      : { id, total: 140, items: [], status: 'payment_pending', paymentStatus: 'pending' };
    queueMicrotask(() => options.success({ statusCode: 200, data: { code: 200, data } }));
  }
};
const { state, syncOrder, persist, addCart } = await import('../src/store.js');

test('Server confirmation consumes checkout quantities once, including after restoring app storage', async () => {
  state.cart = [{ productId: 3, color: 'cream', size: 'M', qty: 3 }];
  state.pending[id] = { consumed: false, cartLines: [{ productId: 3, color: 'cream', size: 'M', qty: 1 }] };
  await syncOrder(id);
  assert.equal(state.orders[0].paymentStatus, 'pending');
  assert.equal(state.cart[0].qty, 3);
  assert.equal(state.pending[id].consumed, false);
  paymentStatus = 'paid';
  await syncOrder(id); await syncOrder(id);
  assert.equal(state.orders[0].status, 'placed');
  assert.equal(state.cart[0].qty, 2);
  assert.equal(disk.pending[id].consumed, true);
  const restored = await import('../src/store.js?restart');
  await restored.syncOrder(id);
  assert.equal(restored.state.cart[0].qty, 2);
  assert.equal(statusCalls, 4); assert.equal(publicListCalls, 0);
});

test('Cart selections survive restart and adding a variant selects only that variant', async () => {
  state.cart = [
    { productId: 3, color: 'cream', size: 'M', qty: 1, selected: false },
    { productId: 3, color: 'cream', size: 'L', qty: 2, selected: false },
    { productId: 4, color: 'black', size: 'M', qty: 1 }
  ];
  addCart({ productId: 3, color: 'cream', size: 'M', qty: 1 });
  const restored = await import('../src/store.js?selection-restart');
  assert.equal(restored.state.cart[0].qty, 2);
  assert.equal(restored.state.cart[0].selected, true);
  assert.equal(restored.state.cart[1].selected, false);
  // Older saved carts without a selected field remain included at checkout.
  assert.deepEqual(restored.state.cart.filter(line => line.selected !== false).map(line => line.qty), [2, 1]);
});

test('Storage errors are surfaced; the app does not claim an order was saved', () => {
  uni.setStorageSync = () => { throw new Error('quota exceeded'); };
  assert.throws(persist, /STORAGE_UNAVAILABLE/);
  assert.equal(state.storageError, 'STORAGE_UNAVAILABLE');
});
