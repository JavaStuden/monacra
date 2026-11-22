import test from 'node:test';
import assert from 'node:assert/strict';
import { aedAmount, validateCheckoutSession, orderPayload, normalizeProduct, consumePurchasedLines, validateVariant, addressValid } from '../src/core/commerce.js';

test('AED amount follows fixed 3.67 conversion, rounded once to minor units', () => {
  assert.equal(aedAmount(140), 513.80); assert.equal(aedAmount(0.5), 1.84); assert.equal(aedAmount(350), 1284.5);
});
test('Checkout accepts only the expected currency, total and Stripe-hosted URL', () => {
  const session = { orderId: 'M-ORD-12345678-ABC', chargeCurrency: 'AED', chargeAmount: 513.80, url: 'https://checkout.stripe.com/c/pay/test' };
  assert.equal(validateCheckoutSession(session, 'AED', 140), session);
  for (const patch of [{ chargeAmount: 140 }, { chargeCurrency: 'USD' }, { url: 'https://checkout.stripe.com.evil.test/pay' }, { orderId: 'invalid' }]) {
    assert.throws(() => validateCheckoutSession({ ...session, ...patch }, 'AED', 140));
  }
});
test('Checkout payload takes expectedTotal and applied coupon from the server quote', () => {
  const result = orderPayload([{ productId: 3, color: 'cream', size: 'M', qty: 1, price: 1 }], { name: 'Customer', phone: '+9647700000000', city: 'Baghdad', area: 'Area', street: 'Street' }, { total: 140, appliedCoupon: 'M10' }, 'USD');
  assert.equal(result.expectedTotal, 140); assert.equal(result.couponCode, 'M10'); assert.equal(result.paymentMethod, 'stripe');
  assert.deepEqual(result.items, [{ productId: 3, color: 'cream', size: 'M', qty: 1 }]);
  assert.throws(() => orderPayload([], {}, { total: 0 }, 'USD'));
});
test('Only a paid order consumes its purchased quantities and variants', () => {
  const cart = [{ productId: 1, color: 'brown', size: 'M', qty: 3 }, { productId: 1, color: 'black', size: 'M', qty: 1 }, { productId: 2, color: 'cream', size: '38', qty: 1 }];
  const remaining = consumePurchasedLines(cart, [{ ...cart[0], qty: 2 }, cart[2]]);
  assert.equal(cart.length, 3); assert.equal(cart[0].qty, 3);
  assert.deepEqual(remaining.map(x => [x.color, x.qty]), [['brown', 1], ['black', 1]]);
});
test('Uploaded images use approved same-origin paths; unknown artwork has a placeholder', () => {
  const image = '/api/v1/product-images/12345678-1234-1234-1234-123456789abc.png';
  assert.equal(normalizeProduct({ id: 1, imageUrls: [image] }).images[0], 'https://itsmonarca.com' + image);
  assert.equal(normalizeProduct({ id: 1, imgIndex: 2, imageUrls: ['javascript:alert(1)'] }).images[0], '/static/products/2.jpg');
  assert.equal(normalizeProduct({ id: 18, imgIndex: null }).images[0], '/static/product-placeholder.png');
});
test('Unavailable variants and invalid Iraqi mobile addresses cannot start checkout', () => {
  const product = { colors: ['black'], sizes: ['S', 'M'], unavailableSize: 'S', stock: 2 };
  assert.equal(validateVariant(product, { color: 'black', size: 'M', qty: 2 }), true);
  for (const line of [{ color: 'black', size: 'S', qty: 1 }, { color: 'red', size: 'M', qty: 1 }, { color: 'black', size: 'M', qty: 3 }]) assert.equal(validateVariant(product, line), false);
  const address = { name: 'Customer', phone: '+964 770 000 0000', city: 'Baghdad', area: 'Area', street: 'Street' };
  assert.equal(addressValid(address), true); assert.equal(addressValid({ ...address, phone: '1234' }), false);
});
