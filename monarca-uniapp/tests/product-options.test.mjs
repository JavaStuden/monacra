import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, validateVariant } from '../src/core/commerce.js';
import { safeColorOptions, defaultColorOptions } from '../src/core/product-options.js';

test('per-model XS and M-to-4XL choices and red/custom colours remain valid purchase variants', () => {
  const option={key:'dark-cherry',nameAr:'كرزي داكن',nameEn:'Dark cherry',hex:'#702b40'};
  const p=normalizeProduct({id:1,price:120,stock:4,colors:'red,dark-cherry',sizes:'M,L,XL,2XL,3XL,4XL',colorOptions:[option]});
  assert.ok(validateVariant(p,{qty:1,color:'red',size:'4XL'}));
  assert.ok(validateVariant(p,{qty:1,color:'dark-cherry',size:'M'}));
  assert.equal(validateVariant(p,{qty:1,color:'red',size:'XS'}),false);
  assert.equal(validateVariant(p,{qty:1,color:'black',size:'M'}),false);
  assert.deepEqual(p.colorOptions,[option]);
  assert.equal(defaultColorOptions.find(c=>c.key==='red').nameAr,'أحمر');
});
test('size charts accept uploaded image paths only and cannot replace the product gallery', () => {
  const path='/api/v1/product-images/12345678-1234-1234-1234-123456789abc.png';
  const base={id:1,price:1,colors:'black',sizes:'XS,4XL',imgIndex:0};
  const p=normalizeProduct({...base,sizeChartUrl:path,measure:'Units: cm'});
  assert.equal(p.sizeChartUrl,'https://itsmonarca.com'+path);assert.equal(p.images.length,1);assert.notEqual(p.images[0],p.sizeChartUrl);
  assert.equal(normalizeProduct({...base,sizeChartUrl:'https://example.com/table.png'}).sizeChartUrl,'');
  assert.equal(normalizeProduct(base).sizeChartUrl,'');
});
test('custom swatches reject scriptable colours, markup labels and prototype keys', () => {
  const good={key:'cherry',nameAr:'كرزي',nameEn:'Cherry',hex:'#702b40'};
  for(const bad of [{...good,key:'__proto__'},{...good,hex:'url(javascript:bad)'},{...good,nameAr:'<img onerror=x>'}])assert.deepEqual(safeColorOptions([bad]),[]);
  assert.deepEqual(safeColorOptions([good]),[good]);
});
