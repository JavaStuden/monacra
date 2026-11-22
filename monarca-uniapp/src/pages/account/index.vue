<template>
  <AppShell :key="state.language" :title="t('account')" active="account" :back="false">
    <view class="card"><text class="eyebrow">YOUR MONARCA</text><text class="section-title">{{ t('guest') }}</text><text class="muted">{{ t('guestNote') }}</text></view>
    <button v-for="item in menu" :key="item.page" class="menu-row" @click="go(item.page)"><text>{{ t(item.label) }}</text><text class="menu-symbol">{{ item.count?.() ?? '›' }}</text></button>
    <text class="footer-note">MONARCA · 4.7.0</text>
  </AppShell>
</template>
<script setup>
import AppShell from '../../components/AppShell.vue'; import { state, go } from '../../store.js'; import { t } from '../../i18n.js';
const menu = [{ page: 'orders', label: 'orders', count: () => state.orders.length }, { page: 'wishlist', label: 'wishlist', count: () => state.wish.length }, { page: 'address', label: 'addresses' }, { page: 'returns', label: 'returns' }, { page: 'support', label: 'support' }, { page: 'policy', label: 'policies' }, { page: 'settings', label: 'settings' }];
</script>
