<template>
  <AppShell :key="state.language" :title="t('catalog')">
    <view v-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
    <text v-if="state.loading && !product" class="muted">{{ t('loading') }}</text>
    <template v-else-if="product">
      <swiper class="detail-gallery" :indicator-dots="product.images.length > 1"><swiper-item v-for="image in product.images" :key="image"><image class="detail-image" :src="image" mode="aspectFit" :alt="productName(product)" @click="uniPreview" /></swiper-item></swiper>
      <text class="eyebrow">{{ t(product.category) }}</text><text class="detail-title">{{ productName(product) }}</text>
      <view class="row"><text class="section-title ltr">{{ money(product.price) }}</text><button class="chip" @click="saveWish">{{ state.wish.includes(product.id) ? '♥' : '♡' }} {{ t('wishlist') }}</button></view>
      <text class="muted">{{ t(product.fulfillmentSource === 'china' ? 'international' : 'local') }}</text>
      <text class="field-label">{{ t('color') }}</text><view class="chips"><button v-for="c in product.colors" :key="c" class="chip" :class="{ selected: color === c }" @click="color = c">{{ t(c) }}</button></view>
      <text class="field-label">{{ t('size') }}</text><view class="chips"><button v-for="s in product.sizes" :key="s" class="chip" :class="{ selected: size === s }" :disabled="s === product.unavailableSize" @click="size = s">{{ sizeName(s, state.language === 'en') }}</button></view>
      <view class="row"><text>{{ t('quantity') }}</text><view class="stepper"><button @click="qty = Math.max(1, qty - 1)">−</button><text>{{ qty }}</text><button @click="qty = Math.min(maxQty, qty + 1)">+</button></view></view>
      <button class="primary" :disabled="product.stock === 0" @click="add(false)">{{ t('addBag') }}</button><button class="secondary" :disabled="product.stock === 0" @click="add(true)">{{ t('buyNow') }}</button>
      <view class="card"><text class="section-title">{{ t('material') }}</text><text class="body-copy">{{ product.material }}</text><text class="body-copy">{{ product.fabric }}</text><text class="body-copy">{{ product.care }}</text></view>
      <view v-if="product.measure" class="card"><text class="section-title">{{ t('sizeGuide') }}</text><text class="body-copy">{{ product.measure }}</text></view>
    </template>
    <EmptyState v-else-if="!state.loading" :title="t('unavailable')" />
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onLoad } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import EmptyState from '../../components/EmptyState.vue';
import { state, addCart, toggleWish, go, toast, refreshProducts } from '../../store.js'; import { t, productName, money, errorText } from '../../i18n.js'; import { validateVariant, lineKey, sizeName } from '../../core/commerce.js';
const id = ref(0), color = ref(''), size = ref(''), qty = ref(1); const product = computed(() => state.products.find(p => p.id === id.value)); const maxQty = computed(() => Math.min(99, product.value?.stock ?? 99));
async function refresh() { try { await refreshProducts(); if (!color.value) color.value = product.value?.colors[0] || ''; } catch {} }
onLoad(options => { id.value = Number(options.id); refresh(); });
function saveWish() { try { toggleWish(id.value); } catch (e) { toast(errorText(e)); } }
function uniPreview() { uni.previewImage({ urls: product.value.images }); }
function add(buy) {
  const line = { productId: id.value, color: color.value, size: size.value, qty: qty.value };
  if (!validateVariant(product.value, line)) { toast(t('choose')); return; }
  try {
    if (buy) { uni.setStorageSync('monarca-buy-now', line); go('checkout', { source: 'buy' }); }
    else {
      const existing = state.cart.find(x => lineKey(x) === lineKey(line));
      if (!validateVariant(product.value, { ...line, qty: qty.value + (existing?.qty || 0) })) { toast(t('unavailable')); return; }
      addCart(line); toast(t('added'));
    }
  } catch (e) { toast(errorText(e)); }
}
</script>
