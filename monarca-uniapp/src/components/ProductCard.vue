<template>
  <view class="product-card" @click="go('product', { id: product.id })">
    <view class="product-image-wrap">
      <image class="product-image" :src="product.images[0]" mode="aspectFill" :alt="productName(product)" />
      <button class="wish-button" :aria-label="t('wishlist')" @click.stop="save">{{ state.wish.includes(product.id) ? '♥' : '♡' }}</button>
      <text v-if="product.stock === 0" class="stock-label">{{ t('unavailable') }}</text>
    </view>
    <text class="eyebrow">{{ t(product.category) }}</text><text class="product-name">{{ productName(product) }}</text>
    <view class="prices"><text>{{ money(product.price) }}</text><text v-if="product.oldPrice > product.price" class="old-price">{{ money(product.oldPrice) }}</text></view>
  </view>
</template>
<script setup>
import { state, go, toggleWish, toast } from '../store.js';
import { productName, money, t, errorText } from '../i18n.js';
const props = defineProps({ product: { type: Object, required: true } });
function save() { try { toggleWish(props.product.id); } catch (e) { toast(errorText(e)); } }
</script>
