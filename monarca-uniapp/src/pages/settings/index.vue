<template>
  <AppShell :key="state.language" :title="t('settings')">
    <text class="section-title">{{ t('language') }}</text><view class="pair"><button class="secondary" @click="change('ar')">العربية</button><button class="secondary" @click="change('en')">English</button></view>
    <view class="notice">{{ t('currencyNote') }}</view><button class="menu-row" @click="go('policy', { type: 'privacy' })">{{ t('privacy') }}</button>
    <view class="card"><text class="body-copy">{{ t('clearNote') }}</text><button class="secondary" @click="clear">{{ t('clearLocal') }}</button></view><text class="muted">Monarca · uni-app · 4.7.0</text>
  </AppShell>
</template>
<script setup>
import AppShell from '../../components/AppShell.vue'; import { state, persist, go, setLanguage, toast } from '../../store.js'; import { t, errorText } from '../../i18n.js';
function change(value) { try { setLanguage(value); } catch (e) { toast(errorText(e)); } }
function clear() { uni.showModal({ title: t('clearLocal'), content: t('clearNote'), confirmText: t('confirm'), cancelText: t('cancel'), success: result => { if (!result.confirm) return; try { state.addresses = []; state.selectedAddressId = ''; state.wish = []; persist(); } catch (e) { toast(errorText(e)); } } }); }
</script>
