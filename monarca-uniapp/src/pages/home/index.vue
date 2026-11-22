<template>
  <AppShell :key="state.language" home edge :back="false" active="home">
    <view v-if="state.department === 'women'" class="hero"><image src="/static/hero.png" class="hero-image" mode="aspectFill" /><view class="hero-copy"><text class="hero-title">{{ t('timeless') }}</text><text class="hero-note">{{ t('timelessNote') }}</text><button class="hero-cta" @click="go('catalog')">{{ t('shopNow') }}<LineIcon name="arrow" :size="17" :mirror="state.language === 'en'" /></button></view></view>
    <view v-else class="hero hero-men"><image v-if="menCover" class="hero-men-photo" :src="menCover" mode="aspectFit" /><view class="hero-copy"><text class="hero-title">{{ t('menHero') }}</text><text class="hero-note">{{ t('menHeroNote') }}</text><button class="hero-cta" @click="go('catalog')">{{ t('shopNow') }}<LineIcon name="arrow" :size="17" :mirror="state.language === 'en'" /></button></view></view>
    <RoundCategories />
    <view class="home-products"><view class="section-head"><text class="section-title">{{ t(state.department === 'men' ? 'menEdit' : 'womenEdit') }}</text><button class="text-button" @click="go('catalog')">{{ t('viewAll') }}<LineIcon name="arrow" :size="15" :mirror="state.language === 'en'" /></button></view>
      <text v-if="state.loading && !state.products.length" class="muted inset">{{ t('loading') }}</text><view v-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
      <view v-else-if="!state.loading && !selected.length" class="department-empty"><text class="section-title">{{ t('departmentEmpty') }}</text><text>{{ t('departmentEmptyNote') }}</text></view>
      <view class="product-grid"><ProductCard v-for="p in selected" :key="p.id" :product="p" /></view>
    </view>
    <view class="source-section"><text class="section-title">{{ t('sourcing') }}</text><text class="muted">{{ t('sourcingNote') }}</text><view class="source-grid"><button v-for="source in ['iraq', 'china']" :key="source" class="source-card" @click="go('catalog', { source })"><LineIcon :name="source === 'iraq' ? 'box' : 'globe'" :size="25" /><text class="source-title">{{ t(source === 'iraq' ? 'localTitle' : 'internationalTitle') }}</text><text class="source-time">{{ t(source === 'iraq' ? 'localTime' : 'internationalTime') }}</text><text class="muted">{{ t('cardOnly') }}</text><view class="source-link">{{ t('browseProducts') }}<LineIcon name="arrow" :size="15" :mirror="state.language === 'en'" /></view></button></view></view>
    <button class="delivery-strip" @click="go('address')"><LineIcon name="pin" :size="18" /><text>{{ t('address') }} · {{ state.addresses.find(a => a.id === state.selectedAddressId)?.city || text('العراق', 'Iraq') }}</text><LineIcon name="chevron" :size="15" :mirror="state.language === 'ar'" /></button>
    <view class="benefits"><view><LineIcon name="truck" :size="21" /><text>{{ text('توصيل داخل العراق', 'Iraq delivery') }}</text></view><view><LineIcon name="card" :size="21" /><text>Visa · Mastercard</text></view><view><LineIcon name="shield" :size="21" /><text>{{ text('تسوّق بثقة', 'Shop with confidence') }}</text></view></view>
    <view class="journal"><text class="eyebrow">FIND YOUR INSPIRATION</text><text class="section-title">{{ t('curation') }}</text><text class="muted">{{ t('curationNote') }}</text><button class="text-button" @click="go('catalog')">{{ t('shop') }}<LineIcon name="arrow" :size="16" :mirror="state.language === 'en'" /></button></view>
    <text class="footer-note">MONARCA · TIMELESS ELEGANCE</text>
  </AppShell>
</template>
<script setup>
import { computed } from 'vue'; import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import ProductCard from '../../components/ProductCard.vue'; import LineIcon from '../../components/LineIcon.vue';
import RoundCategories from '../../components/RoundCategories.vue';
import { state, go, refreshProducts, browseProducts } from '../../store.js'; import { t, text } from '../../i18n.js';
const menCover = computed(() => browseProducts().find(p => p.gender === 'men')?.images[0] || browseProducts()[0]?.images[0] || '');
const selected = computed(() => { const eligible = browseProducts(); if (state.department === 'men') return eligible.slice(-4).reverse(); const ids = [5, 3, 6, 1]; const first = ids.map(id => eligible.find(p => p.id === id)).filter(Boolean); return [...first, ...eligible.filter(p => !first.includes(p))].slice(0, 4); });
function refresh() { refreshProducts().catch(() => {}); } onShow(refresh);
</script>
