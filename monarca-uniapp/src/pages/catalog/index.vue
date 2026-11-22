<template>
  <AppShell :key="state.language" :title="t('catalog')" active="categories" departments>
    <view class="catalog-intro"><text class="section-title">{{ source === 'iraq' ? t('localTitle') : source === 'china' ? t('internationalTitle') : offers ? t('offers') : category === 'all' ? t('catalog') : t(category) }}</text><text class="muted">{{ products.length }} {{ t('pieces') }} · {{ t('selectedProducts') }}</text></view>
    <view class="search-box"><LineIcon name="search" :size="20" /><input v-model="query" :placeholder="t('search')" :aria-label="t('search')" /></view>
    <view class="chips"><button v-for="c in categories" :key="c" class="chip" :class="{ selected: category === c }" @click="category = c; sub = ''">{{ t(c) }}</button></view>
    <picker :range="sortLabels" :value="sort" @change="sort = Number($event.detail.value)"><view class="row"><text>{{ t('sort') }}</text><text>{{ sortLabels[sort] }} ⌄</text></view></picker>
    <text v-if="state.loading && !state.products.length" class="muted">{{ t('loading') }}</text>
    <view v-else-if="state.catalogError" class="error">{{ t('network') }}<button @click="refresh">{{ t('retry') }}</button></view>
    <EmptyState v-else-if="!products.length" />
    <view class="product-grid"><ProductCard v-for="p in products" :key="p.id" :product="p" /></view>
  </AppShell>
</template>
<script setup>
import { computed, ref, watch } from 'vue'; import { onLoad, onShow } from '@dcloudio/uni-app';
import AppShell from '../../components/AppShell.vue'; import ProductCard from '../../components/ProductCard.vue'; import EmptyState from '../../components/EmptyState.vue';
import { state, refreshProducts, browseProducts, setDepartment } from '../../store.js'; import { t } from '../../i18n.js'; import LineIcon from '../../components/LineIcon.vue';
const query = ref(''), category = ref('all'), sort = ref(0), source = ref(''), sub = ref(''), offers = ref(false); const categories = ['all', 'clothes', 'shoes', 'bags', 'accessories'];
watch(() => state.department, () => { sub.value = ''; });
const sortLabels = computed(() => [t('newest'), t('priceLow'), t('priceHigh')]);
const products = computed(() => browseProducts().filter(p => (category.value === 'all' || p.category === category.value) && (!source.value || p.fulfillmentSource === source.value) && (!sub.value || p.subCategory === sub.value) && (!offers.value || p.oldPrice > p.price) && `${p.name} ${p.enName} ${p.keywords || ''} ${t(p.category)}`.toLowerCase().includes(query.value.toLowerCase().trim())).sort((a, b) => sort.value === 1 ? a.price - b.price : sort.value === 2 ? b.price - a.price : b.id - a.id));
onLoad(options => { if (['women', 'men'].includes(options.gender) && options.gender !== state.department) setDepartment(options.gender); if (categories.includes(options.category)) category.value = options.category; if (['iraq', 'china'].includes(options.source)) source.value = options.source; sub.value = options.sub || ''; offers.value = options.offers === '1'; query.value = options.q || ''; });
function refresh() { refreshProducts().catch(() => {}); } onShow(refresh);
</script>
