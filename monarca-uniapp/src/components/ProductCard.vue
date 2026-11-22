<template>
  <view class="product-card" @click="go('product', { id: product.id })">
    <view class="product-image-wrap">
      <image class="product-image" :src="product.images[0]" mode="aspectFill" :alt="productName(product)" />
      <button class="wish-button" :class="{ saved: state.wish.includes(product.id) }" :aria-label="t('wishlist')" @click.stop="save"><LineIcon name="heart" :size="20" /></button>
      <text v-if="product.stock === 0" class="stock-label">{{ t('unavailable') }}</text>
    </view>
    <text class="fulfillment-tag" :class="{ international: product.fulfillmentSource === 'china' }">{{ t(product.fulfillmentSource === 'china' ? 'international' : 'local') }}</text><text class="product-name">{{ productName(product) }}</text>
    <text v-if="product.material" class="product-material">{{ product.material }}</text>
    <view class="prices"><text>{{ money(product.price) }}</text><text v-if="product.oldPrice > product.price" class="old-price">{{ money(product.oldPrice) }}</text></view>
  </view>
</template>
<script setup>
import { state, go, toggleWish, toast } from '../store.js';
import { productName, money, t, errorText } from '../i18n.js';
import LineIcon from './LineIcon.vue';
const props = defineProps({ product: { type: Object, required: true } });
function save() { try { toggleWish(props.product.id); } catch (e) { toast(errorText(e)); } }
</script>
