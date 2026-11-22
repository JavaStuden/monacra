<template>
  <AppShell :key="state.language" :title="t('catalog')" active="catalog">
    <input v-model="query" :placeholder="t('search')" :aria-label="t('search')" />
    <view class="chips"><button v-for="c in categories" :key="c" class="chip" :class="{ selected: category === c }" @click="category = c">{{ t(c) }}</button></view>
    <picker :range="sortLabels" :value="sort" @change="sort = Number($event.detail.value)"><view class="row"><text>{{ t('sort') }}</text><text>{{ sortLabels[sort] }} ⌄</text></view></picker>
    <text v-if="state.loading && !state.products.length" class="muted">{{ t('loading') }}</text>
    <view v-else-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
    <EmptyState v-else-if="!products.length" />
    <view class="product-grid"><ProductCard v-for="p in products" :key="p.id" :product="p" /></view>
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onLoad, onShow } from '@dcloudio/uni-app';
import AppShell from '../../components/AppShell.vue'; import ProductCard from '../../components/ProductCard.vue'; import EmptyState from '../../components/EmptyState.vue';
import { state, refreshProducts } from '../../store.js'; import { t } from '../../i18n.js';
const query = ref(''), category = ref('all'), sort = ref(0); const categories = ['all', 'clothes', 'shoes', 'bags', 'accessories'];
const sortLabels = computed(() => [t('newest'), t('priceLow'), t('priceHigh')]);
const products = computed(() => state.products.filter(p => (category.value === 'all' || p.category === category.value) && `${p.name} ${p.enName} ${p.keywords || ''}`.toLowerCase().includes(query.value.toLowerCase().trim())).sort((a, b) => sort.value === 1 ? a.price - b.price : sort.value === 2 ? b.price - a.price : b.id - a.id));
onLoad(options => { if (categories.includes(options.category)) category.value = options.category; });
function refresh() { refreshProducts().catch(() => {}); } onShow(refresh);
</script>
