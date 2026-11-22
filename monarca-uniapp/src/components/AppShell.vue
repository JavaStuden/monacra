<template>
  <view class="shell" :class="{ rtl: state.language === 'ar', 'without-nav': !nav }" :dir="state.language === 'ar' ? 'rtl' : 'ltr'">
    <view class="app-header">
      <button v-if="back" class="icon-button" :aria-label="t('back')" @click="navigateBack">{{ state.language === 'ar' ? '›' : '‹' }}</button>
      <view v-else class="header-spacer" />
      <view class="brand" @click="root('home')">MONARCA</view>
      <button class="language-button" @click="changeLanguage">{{ state.language === 'ar' ? 'EN' : 'عربي' }}</button>
    </view>
    <view class="page-body"><text v-if="title" class="page-title">{{ title }}</text><slot /></view>
    <view v-if="nav" class="bottom-nav">
      <button v-for="item in navigation" :key="item.page" :class="{ active: active === item.page }" @click="root(item.page)">
        <text class="nav-symbol">{{ item.symbol }}</text><text>{{ t(item.label) }}</text>
        <text v-if="item.page === 'cart' && count" class="badge">{{ count }}</text>
      </button>
    </view>
  </view>
</template>
<script setup>
import { computed } from 'vue';
import { state, root, setLanguage, toast } from '../store.js';
import { t, errorText } from '../i18n.js';
defineProps({ title: String, active: String, back: { type: Boolean, default: true }, nav: { type: Boolean, default: true } });
const navigation = [{ page: 'home', label: 'home', symbol: '⌂' }, { page: 'catalog', label: 'catalog', symbol: '☷' }, { page: 'wishlist', label: 'wishlist', symbol: '♡' }, { page: 'cart', label: 'cart', symbol: '♧' }, { page: 'account', label: 'account', symbol: '♙' }];
const count = computed(() => state.cart.reduce((sum, line) => sum + line.qty, 0));
function navigateBack() { uni.navigateBack({ fail: () => root('home') }); }
function changeLanguage() { try { setLanguage(state.language === 'ar' ? 'en' : 'ar'); } catch (e) { toast(errorText(e)); } }
</script>
