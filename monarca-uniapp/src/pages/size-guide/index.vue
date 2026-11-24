<template>
  <AppShell :key="state.language" :title="t('sizeGuide')" :nav="false">
    <template v-if="product">
      <text class="section-title">{{ productName(product) }}</text>
      <text class="muted body-copy">{{ text('الجدول خاص بهذا الموديل. اتبعي وحدة القياس المكتوبة في الجدول.', 'This chart belongs to this model. Follow the units shown in the chart.') }}</text>
      <image v-if="product.sizeChartUrl" :src="product.sizeChartUrl" mode="widthFix" class="size-chart-image" :alt="t('sizeGuide')" @click="preview" @error="failed = true" />
      <text v-if="failed" class="error">{{ text('تعذّر تحميل الجدول. تحققي من الاتصال أو تواصلي مع المتجر.', 'Could not load the chart. Check your connection or contact the store.') }}</text>
      <text v-if="product.measure" class="body-copy size-chart-notes">{{ product.measure }}</text>
      <view v-if="!product.sizeChartUrl && !product.measure" class="notice">{{ text('لا يوجد جدول منشور لهذا الموديل حالياً. تواصلي مع المتجر قبل اختيار المقاس.', 'No measurements have been published for this model. Contact the store before choosing a size.') }}</view>
      <text class="body-copy">{{ t('size') }}: {{ product.sizes.map(s => sizeName(s, state.language === 'en')).join(' · ') }}</text>
    </template>
    <text v-else class="muted body-copy">{{ state.loading ? t('loading') : t('unavailable') }}</text>
    <button class="secondary" @click="go('support')">{{ t('contact') }}</button>
  </AppShell>
</template>
<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppShell from '../../components/AppShell.vue';
import { state, go, refreshProducts } from '../../store.js';
import { t, text, productName } from '../../i18n.js';
import { sizeName } from '../../core/commerce.js';
const id = ref(0), failed = ref(false);
const product = computed(() => state.products.find(p => p.id === id.value));
onLoad(async options => { id.value = Number(options.id); try { await refreshProducts(); } catch {} });
function preview() { if (product.value?.sizeChartUrl) uni.previewImage({ urls: [product.value.sizeChartUrl], current: product.value.sizeChartUrl }); }
</script>
<style scoped>
.size-chart-image{display:block;width:100%;margin:16px 0;background:#eee7de;border-radius:8px}.size-chart-notes{white-space:pre-wrap;overflow-wrap:anywhere}
</style>
