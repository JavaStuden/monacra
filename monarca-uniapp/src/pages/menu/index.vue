<template><AppShell :key="state.language" :title="t('menu')"><image class="menu-wordmark" src="/static/wordmark.svg" mode="aspectFit" /><view class="navigation-list"><button v-for="item in items" :key="item[0]" class="menu-row" @click="go(item[0])"><LineIcon :name="item[1]" :size="23" /><text>{{ t(item[2]) }}</text><LineIcon name="arrow" :size="17" :mirror="state.language === 'en'" /></button></view><text class="footer-note">MONARCA · TIMELESS ELEGANCE</text></AppShell></template>
<script setup>
import AppShell from '../../components/AppShell.vue'; import LineIcon from '../../components/LineIcon.vue'; import { state, go } from '../../store.js'; import { t } from '../../i18n.js';
const items = [['home', 'home', 'home'], ['categories', 'grid', 'categories'], ['wishlist', 'heart', 'wishlist'], ['orders', 'box', 'orders'], ['support', 'chat', 'support'], ['policy', 'shield', 'policies'], ['settings', 'globe', 'settings']];
</script>
