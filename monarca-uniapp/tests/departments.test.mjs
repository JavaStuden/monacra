import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesDepartment } from '../src/core/commerce.js';

test('Each department contains its products and the same shared unisex product', () => {
  const products = [{ id: 1, gender: 'women' }, { id: 2, gender: 'men' }, { id: 3, gender: 'unisex' }];
  const women = products.filter(p => matchesDepartment(p, 'women'));
  const men = products.filter(p => matchesDepartment(p, 'men'));
  assert.deepEqual(women.map(p => p.id), [1, 3]);
  assert.deepEqual(men.map(p => p.id), [2, 3]);
  assert.equal(women[1], men[1]);
});
test('Unclassified legacy records stay in women; unknown values never leak into a department', () => {
  assert.equal(matchesDepartment({ id: 1 }, 'women'), true);
  assert.equal(matchesDepartment({ id: 1, gender: null }, 'men'), false);
  assert.equal(matchesDepartment({ gender: 'invalid' }, 'women'), false);
  assert.equal(matchesDepartment({ gender: 'unisex' }, 'invalid'), false);
});
