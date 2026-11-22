<template><view class="empty-state"><LineIcon name="bag" :size="46" /><text class="section-title">{{ title || t('empty') }}</text><text v-if="description" class="muted">{{ description }}</text><button class="primary" @click="root('catalog')">{{ t('shop') }}</button></view></template>
<script setup>
import { root } from '../store.js'; import { t } from '../i18n.js';
import LineIcon from './LineIcon.vue';
defineProps({ title: String, description: String, symbol: { type: String, default: '♡' } });
</script>
