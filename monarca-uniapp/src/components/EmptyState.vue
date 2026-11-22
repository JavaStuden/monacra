<template><view class="empty-state"><text class="empty-symbol">{{ symbol }}</text><text class="section-title">{{ title || t('empty') }}</text><text v-if="description" class="muted">{{ description }}</text><button class="primary" @click="root('catalog')">{{ t('shop') }}</button></view></template>
<script setup>
import { root } from '../store.js'; import { t } from '../i18n.js';
defineProps({ title: String, description: String, symbol: { type: String, default: '♡' } });
</script>
