import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, imagesForColor } from '../src/core/commerce.js';

const paths = [1, 2, 3, 4].map(n => `/api/v1/product-images/12345678-1234-1234-1234-123456789ab${n}.png`);
const product = () => normalizeProduct({ id: 1, colors: 'brown,black,cream', imageUrls: paths,
  imageColors: { [paths[0]]: 'brown', [paths[1]]: 'black', [paths[2]]: 'brown' } });

test('Colour selection shows its multiple photos first, followed by general photos', () => {
  const p = product();
  assert.deepEqual(imagesForColor(p, 'brown'), [p.images[0], p.images[2], p.images[3]]);
  assert.deepEqual(imagesForColor(p, 'black'), [p.images[1], p.images[3]]);
  assert.deepEqual(imagesForColor(p, 'cream'), [p.images[3]]);
});
test('Legacy and incomplete galleries remain viewable without changing purchase colour', () => {
  const p = product();
  delete p.imageColors;
  assert.deepEqual(imagesForColor(p, 'black'), p.images);
  p.imageColors = Object.fromEntries(p.images.map(url => [url, 'brown']));
  assert.deepEqual(imagesForColor(p, 'cream'), p.images);
  assert.deepEqual(imagesForColor(undefined, 'cream'), []);
});
test('Colour photo mappings cannot introduce foreign URLs, removed photos or invalid colours', () => {
  const p = normalizeProduct({ imageUrls: paths.slice(0, 2), colors: 'black', imageColors: {
    [paths[0]]: 'black', [paths[1]]: 'red', [paths[2]]: 'black', 'https://evil.test/photo.png': 'black'
  } });
  assert.deepEqual(p.imageColors, { [p.images[0]]: 'black' });
});
