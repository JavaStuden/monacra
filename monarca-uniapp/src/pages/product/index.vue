<template>
  <AppShell :key="state.language" :title="t('details')" action="share" edge purchase :purchase-disabled="!product || product.stock === 0" @action="shareProduct" @add="add(false)" @buy="add(true)">
    <view v-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
    <text v-if="state.loading && !product" class="muted">{{ t('loading') }}</text>
    <template v-else-if="product">
      <view class="product-stage"><swiper class="detail-gallery" :current="galleryIndex" @change="galleryIndex = $event.detail.current"><swiper-item v-for="(photo, index) in gallery" :key="index"><image class="detail-image" :class="{ 'zoomed-detail': photo.crop }" :src="photo.url" mode="aspectFit" :alt="productName(product)" @click="uniPreview" /></swiper-item></swiper><button class="wish-button" :class="{ saved: state.wish.includes(product.id) }" :aria-label="t('wishlist')" @click="saveWish"><LineIcon name="heart" :size="23" /></button><text class="photo-count ltr">{{ galleryIndex + 1 }} / {{ gallery.length }}</text><button class="zoom-hint" @click="uniPreview"><LineIcon name="eye" :size="15" />{{ t('zoom') }}</button></view>
      <view class="product-thumbnails"><button v-for="(photo, index) in gallery" :key="index" :class="{ selected: galleryIndex === index }" @click="galleryIndex = index"><view class="thumbnail-image"><image :src="photo.url" :class="{ 'zoomed-detail': photo.crop }" mode="aspectFill" /></view><text>{{ photo.crop ? t('detailPhoto') : t('fullPhoto') }}</text></button><text class="muted">{{ colorImages.length === 1 ? t('photoNote') : text('صور القطعة', 'Product gallery') }}</text></view>
      <view class="product-content"><view class="product-kicker"><text class="eyebrow">{{ product.enName }}</text><text class="mini-tag">{{ t('new') }}</text></view><text class="detail-title">{{ productName(product) }}</text>
        <text class="fulfillment-tag" :class="{ international: product.fulfillmentSource === 'china' }">{{ t(product.fulfillmentSource === 'china' ? 'international' : 'local') }}</text><text class="product-description">{{ product.material }}</text>
        <view class="product-price-row"><text class="detail-price">{{ money(product.price) }}</text><text v-if="product.oldPrice > product.price" class="old-price">{{ money(product.oldPrice) }}</text></view>
        <view class="product-rule" /><view class="option-title"><text>{{ t('color') }}: {{ t(color) }}</text><text class="muted">{{ product.colors.length }}</text></view>
        <view class="product-colors"><button v-for="c in product.colors" :key="c" :class="{ selected: color === c }" @click="color = c"><view class="color-swatch" :style="{ backgroundColor: colorHex[c] || '#ddd2be' }" /><text>{{ t(c) }}</text></button></view>
        <text v-if="colorPhotoMissing" class="muted body-copy">{{ text('لا توجد صور مخصصة لهذا اللون؛ الصور المعروضة مرجعية.', 'No photos are assigned to this colour; showing reference images.') }}</text>
        <view class="option-title"><text>{{ t('size') }}: {{ sizeName(size, state.language === 'en') || t('chooseSize') }}</text><button class="text-button" @click="showSizeGuide">{{ t('sizeGuide') }}</button></view>
        <view class="product-sizes"><button v-for="s in product.sizes" :key="s" :class="{ selected: size === s }" :disabled="s === product.unavailableSize" @click="size = s">{{ sizeName(s, state.language === 'en') }}</button></view>
        <view class="quantity-row"><view><text>{{ t('quantity') }}</text><text class="muted">{{ t('stock') }}: {{ product.stock ?? '—' }}</text></view><view class="stepper ltr"><button :disabled="qty <= 1" @click="qty = Math.max(1, qty - 1)">−</button><text>{{ qty }}</text><button :disabled="qty >= maxQty" @click="qty = Math.min(maxQty, qty + 1)">+</button></view></view>
        <view class="product-delivery"><button @click="go('address')"><LineIcon name="pin" :size="20" /><view><text>{{ t('address') }}</text><text class="muted">{{ state.addresses.find(a => a.id === state.selectedAddressId)?.city || text('العراق', 'Iraq') }}</text></view><LineIcon name="chevron" :size="17" :mirror="state.language === 'ar'" /></button><view><LineIcon name="truck" :size="18" /><text>{{ t(product.fulfillmentSource === 'china' ? 'international' : 'local') }}</text></view><view><LineIcon name="return" :size="18" /><text>{{ t('deliveryReturns') }}</text></view><view><LineIcon name="card" :size="18" /><text>{{ t('cardOnly') }}</text></view></view>
        <view v-for="section in ['aboutPiece', 'material', 'deliveryReturns']" :key="section" class="product-accordion"><button @click="expanded[section] = !expanded[section]"><text>{{ t(section) }}</text><LineIcon :name="expanded[section] ? 'minus' : 'plus'" :size="16" /></button><view v-if="expanded[section]"><text v-if="section === 'aboutPiece'" class="body-copy">{{ product.measure || product.material }}</text><template v-else-if="section === 'material'"><text class="body-copy">{{ product.fabric || product.material }}</text><text class="body-copy">{{ product.care }}</text></template><template v-else><text class="body-copy">{{ t(product.fulfillmentSource === 'china' ? 'international' : 'local') }}</text><button class="text-button" @click="go('policy', { type: 'shipping' })">{{ t('policies') }}</button></template></view></view>
      </view>
      <view class="related-products"><view class="section-head"><text class="section-title">{{ t('completeLook') }}</text><button class="text-button" @click="go('catalog')">{{ t('viewAll') }}</button></view><view class="product-grid"><ProductCard v-for="p in related" :key="p.id" :product="p" /></view></view>
    </template>
    <EmptyState v-else-if="!state.loading" :title="t('unavailable')" />
    <ProductGallery :open="galleryOpen" :images="product?.images || []" :image-colors="product?.imageColors || {}" :name="product ? productName(product) : ''" @close="galleryOpen = false" />
  </AppShell>
</template>
<script setup>
import { computed, ref, watch } from 'vue'; import { onLoad, onBackPress, onHide } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import EmptyState from '../../components/EmptyState.vue';
import ProductGallery from '../../components/ProductGallery.vue';
import { state, addCart, toggleWish, go, toast, refreshProducts } from '../../store.js'; import { t, text, productName, money, errorText } from '../../i18n.js'; import { validateVariant, lineKey, sizeName, imagesForColor, matchesDepartment } from '../../core/commerce.js'; import LineIcon from '../../components/LineIcon.vue'; import ProductCard from '../../components/ProductCard.vue';
const id = ref(0), color = ref(''), size = ref(''), qty = ref(1); const product = computed(() => state.products.find(p => p.id === id.value)); const maxQty = computed(() => Math.min(99, product.value?.stock ?? 99));
const galleryIndex = ref(0), expanded = ref({}), colorHex = { brown: '#9b6b43', cream: '#e7ddc9', black: '#2f2c2a', gold: '#c3a365', olive: '#666a4f', taupe: '#9b8e7b' };
const galleryOpen = ref(false);
onBackPress(() => { if (galleryOpen.value) { galleryOpen.value = false; return true; } });
onHide(() => { galleryOpen.value = false; });
const colorImages = computed(() => imagesForColor(product.value, color.value));
const hasColorImages = computed(() => colorImages.value.some(url => product.value?.imageColors?.[url] === color.value));
const colorPhotoMissing = computed(() => product.value?.colors.length > 1 && !hasColorImages.value);
const gallery = computed(() => { const photos = colorImages.value.map(url => ({ url })); return photos.length === 1 ? [...photos, { url: photos[0].url, crop: true }] : photos; });
watch([color, colorImages], () => { galleryIndex.value = 0; });
const related = computed(() => state.products.filter(p => p.id !== id.value && p.category !== product.value?.category && matchesDepartment(p, product.value?.gender === 'men' ? 'men' : product.value?.gender === 'women' ? 'women' : state.department)).slice(0, 2));
function showSizeGuide() { uni.showModal({ title: t('sizeGuide'), content: product.value?.measure || text('تواصلي مع المتجر لمعلومات المقاس.', 'Contact the store for measurements.'), showCancel: false, confirmText: t('confirm') }); }
async function refresh() { try { await refreshProducts(); if (!color.value) color.value = product.value?.colors[0] || ''; } catch {} }
onLoad(options => { id.value = Number(options.id); refresh(); });
function saveWish() { try { toggleWish(id.value); } catch (e) { toast(errorText(e)); } }
function uniPreview() { if (product.value?.images.length) galleryOpen.value = true; }
function shareProduct() { uni.setClipboardData({ data: `https://itsmonarca.com/#product/${id.value}` }); }
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
