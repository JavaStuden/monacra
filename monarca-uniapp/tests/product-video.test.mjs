import test from 'node:test';
import assert from 'node:assert/strict';
import { safeVideo, normalizeProduct } from '../src/core/commerce.js';

test('video media accepts only uploaded same-origin MP4 paths and remains optional for old products', () => {
  const path = '/api/v1/product-videos/12345678-1234-1234-1234-123456789abc.mp4';
  assert.equal(safeVideo(path), 'https://itsmonarca.com' + path);
  for (const bad of ['https://example.com/a.mp4', '//example.com/a.mp4', path + '?x=1', '/api/v1/product-videos/../a.mp4', null]) assert.equal(safeVideo(bad), '');
  const base = { id: 1, price: 12, colors: 'brown', sizes: 'M' };
  assert.equal(normalizeProduct(base).videoUrl, '');
  assert.equal(normalizeProduct({ ...base, videoUrl: path }).videoUrl, 'https://itsmonarca.com' + path);
  assert.deepEqual(normalizeProduct({ ...base, videoUrl: path }).colors, ['brown']);
});
