<template><AppShell :key="state.language" :title="t('wishlist')" active="wishlist"><text v-if="state.catalogError" class="error">{{ t('network') }}</text><view class="product-grid"><ProductCard v-for="p in products" :key="p.id" :product="p" /></view><EmptyState v-if="!products.length" /></AppShell></template>
<script setup>
import { computed } from 'vue'; import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import ProductCard from '../../components/ProductCard.vue'; import EmptyState from '../../components/EmptyState.vue';
import { state, refreshProducts } from '../../store.js'; import { t } from '../../i18n.js';
const products = computed(() => state.products.filter(p => state.wish.includes(p.id))); onShow(() => refreshProducts().catch(() => {}));
</script>
