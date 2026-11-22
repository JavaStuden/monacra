<template>
  <AppShell :key="state.language" :back="false" active="home">
    <view class="hero"><image src="/static/hero.png" class="hero-image" mode="aspectFill" /><view class="hero-copy"><text class="hero-title">{{ t('hero') }}</text><text>{{ t('heroNote') }}</text><button class="primary" @click="go('catalog')">{{ t('shop') }}</button></view></view>
    <view class="section-head"><text class="section-title">{{ t('new') }}</text><button class="text-button" @click="go('catalog')">{{ t('all') }}</button></view>
    <text v-if="state.loading && !state.products.length" class="muted">{{ t('loading') }}</text>
    <view v-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
    <view class="product-grid"><ProductCard v-for="p in state.products.slice(0, 6)" :key="p.id" :product="p" /></view>
    <view class="notice">{{ t('currencyNote') }}</view><button class="secondary" @click="go('policy', { type: 'shipping' })">{{ t('shipping') }}</button>
    <text class="footer-note">MONARCA · MADE FOR YOUR EVERYDAY</text>
  </AppShell>
</template>
<script setup>
import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import ProductCard from '../../components/ProductCard.vue';
import { state, go, refreshProducts } from '../../store.js'; import { t } from '../../i18n.js';
function refresh() { refreshProducts().catch(() => {}); } onShow(refresh);
</script>
