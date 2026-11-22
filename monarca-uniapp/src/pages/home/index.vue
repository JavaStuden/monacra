<template>
  <AppShell :key="state.language" home edge :back="false" active="home">
    <view class="hero"><image src="/static/hero.png" class="hero-image" mode="aspectFill" /><view class="hero-copy"><text class="hero-title">{{ t('timeless') }}</text><text class="hero-note">{{ t('timelessNote') }}</text><button class="hero-cta" @click="go('catalog')">{{ t('shopNow') }}<LineIcon name="arrow" :size="17" :mirror="state.language === 'en'" /></button></view></view>
    <view class="round-categories"><button v-for="category in categories" :key="category" @click="go('catalog', { category })"><view class="category-circle"><image :src="`/static/categories/${category}.jpg`" mode="aspectFill" /></view><text>{{ t(category) }}</text></button></view>
    <view class="source-section"><text class="section-title">{{ t('sourcing') }}</text><text class="muted">{{ t('sourcingNote') }}</text><view class="source-grid"><button v-for="source in ['iraq', 'china']" :key="source" class="source-card" @click="go('catalog', { source })"><LineIcon :name="source === 'iraq' ? 'box' : 'globe'" :size="25" /><text class="source-title">{{ t(source === 'iraq' ? 'localTitle' : 'internationalTitle') }}</text><text class="source-time">{{ t(source === 'iraq' ? 'localTime' : 'internationalTime') }}</text><text class="muted">{{ t('cardOnly') }}</text><view class="source-link">{{ t('browseProducts') }}<LineIcon name="arrow" :size="15" :mirror="state.language === 'en'" /></view></button></view></view>
    <view class="home-products"><view class="section-head"><text class="section-title">{{ t('selectedProducts') }}</text><button class="text-button" @click="go('catalog')">{{ t('viewAll') }}<LineIcon name="arrow" :size="15" :mirror="state.language === 'en'" /></button></view>
      <text v-if="state.loading && !state.products.length" class="muted inset">{{ t('loading') }}</text><view v-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
      <view class="product-grid"><ProductCard v-for="p in selected" :key="p.id" :product="p" /></view>
    </view>
    <button class="delivery-strip" @click="go('address')"><LineIcon name="pin" :size="18" /><text>{{ t('address') }} · {{ state.addresses.find(a => a.id === state.selectedAddressId)?.city || text('العراق', 'Iraq') }}</text><LineIcon name="chevron" :size="15" :mirror="state.language === 'ar'" /></button>
    <view class="benefits"><view><LineIcon name="truck" :size="21" /><text>{{ text('توصيل داخل العراق', 'Iraq delivery') }}</text></view><view><LineIcon name="card" :size="21" /><text>Visa · Mastercard</text></view><view><LineIcon name="shield" :size="21" /><text>{{ text('تسوّق بثقة', 'Shop with confidence') }}</text></view></view>
    <view class="journal"><text class="eyebrow">FIND YOUR INSPIRATION</text><text class="section-title">{{ t('curation') }}</text><text class="muted">{{ t('curationNote') }}</text><button class="text-button" @click="go('catalog')">{{ t('shop') }}<LineIcon name="arrow" :size="16" :mirror="state.language === 'en'" /></button></view>
    <text class="footer-note">MONARCA · TIMELESS ELEGANCE</text>
  </AppShell>
</template>
<script setup>
import { computed } from 'vue'; import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import ProductCard from '../../components/ProductCard.vue'; import LineIcon from '../../components/LineIcon.vue';
import { state, go, refreshProducts } from '../../store.js'; import { t, text } from '../../i18n.js';
const categories = ['clothes', 'bags', 'shoes', 'accessories'];
const selected = computed(() => { const ids = [5, 3, 6, 1]; const first = ids.map(id => state.products.find(p => p.id === id)).filter(Boolean); return first.length ? first : state.products.slice(0, 4); });
function refresh() { refreshProducts().catch(() => {}); } onShow(refresh);
</script>
