<template>
  <view class="shell" :class="{ rtl: state.language === 'ar', 'without-nav': !nav && !purchase, 'home-screen': home, 'edge-screen': edge, 'purchase-screen': purchase }" :dir="state.language === 'ar' ? 'rtl' : 'ltr'">
    <view v-if="home" class="announcement"><LineIcon name="truck" :size="14" /><text>{{ text('التوصيل لكافة محافظات العراق الـ ١٨ · الدفع الآمن بالبطاقة', 'Across all 18 Iraq governorates · Secure card payment') }}</text><LineIcon name="truck" :size="14" /></view>
    <view v-if="home" class="home-header">
      <button class="icon-button" :aria-label="t('photoSearch')" @click="go('photo')"><LineIcon name="camera" /></button>
      <button class="wordmark" aria-label="Monarca" @click="root('home')"><image src="/static/wordmark.svg" mode="aspectFit" /></button>
      <button class="language-button" @click="changeLanguage">{{ state.language === 'ar' ? 'EN' : 'عربي' }}</button>
      <button class="icon-button" :aria-label="t('menu')" @click="go('menu')"><LineIcon name="menu" /></button>
    </view>
    <view v-else class="app-header">
      <view class="page-heading"><button v-if="back" class="back-button" :aria-label="t('back')" @click="navigateBack"><LineIcon name="chevron" :mirror="state.language !== 'ar'" :size="19" /></button><text class="header-title">{{ title || t('account') }}</text></view>
      <view class="header-actions"><button class="language-button" @click="changeLanguage">{{ state.language === 'ar' ? 'EN' : 'عربي' }}</button><button class="icon-button" :aria-label="t(action)" @click="headerAction"><LineIcon :name="action === 'settings' ? 'settings' : action === 'share' ? 'upload' : 'search'" :size="20" /></button></view>
    </view>
    <DepartmentTabs v-if="home || departments" />
    <view class="page-body"><slot /></view>
    <view v-if="purchase" class="purchase-bar"><button class="primary" :disabled="purchaseDisabled" @click="$emit('add')"><LineIcon name="bag" :size="22" /><text>{{ t('addBag') }}</text></button><button class="secondary" :disabled="purchaseDisabled" @click="$emit('buy')">{{ t('buyNow') }}</button></view>
    <view v-else-if="nav" class="bottom-nav">
      <button v-for="item in navigation" :key="item.page" :class="{ active: active === item.page }" @click="root(item.page)">
        <LineIcon :name="item.icon" :size="24" /><text>{{ t(item.label) }}</text>
        <text v-if="item.page === 'cart' && count" class="badge">{{ count }}</text>
      </button>
    </view>
  </view>
</template>
<script setup>
import { computed } from 'vue';
import { state, root, go, setLanguage, toast } from '../store.js';
import { t, text, errorText } from '../i18n.js';
import LineIcon from './LineIcon.vue';
import DepartmentTabs from './DepartmentTabs.vue';
const props = defineProps({ title: String, active: String, action: { type: String, default: 'search' }, home: Boolean, departments: Boolean, edge: Boolean, purchase: Boolean, purchaseDisabled: Boolean, back: { type: Boolean, default: true }, nav: { type: Boolean, default: true } });
const emit = defineEmits(['add', 'buy', 'action']);
const navigation = [{ page: 'home', label: 'home', icon: 'home' }, { page: 'categories', label: 'categories', icon: 'grid' }, { page: 'wishlist', label: 'wishlist', icon: 'heart' }, { page: 'cart', label: 'cart', icon: 'bag' }, { page: 'account', label: 'account', icon: 'user' }];
const count = computed(() => state.cart.reduce((sum, line) => sum + line.qty, 0));
function navigateBack() { uni.navigateBack({ fail: () => root('home') }); }
function headerAction() { if (props.action === 'share') emit('action'); else go(props.action === 'settings' ? 'settings' : 'search'); }
function changeLanguage() { try { setLanguage(state.language === 'ar' ? 'en' : 'ar'); } catch (e) { toast(errorText(e)); } }
</script>
