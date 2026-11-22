<template>
  <AppShell :key="state.language" :title="t('search')"><text class="eyebrow">THE SEARCH EDIT</text><text class="section-title">{{ t('categoryIntro') }}</text><view class="search-box"><LineIcon name="search" :size="21" /><input v-model="query" :placeholder="t('search')" :aria-label="t('search')" confirm-type="search" @confirm="search" /><button :aria-label="t('search')" @click="search"><LineIcon name="arrow" :mirror="state.language === 'en'" /></button></view><view class="round-categories search-categories"><button v-for="c in categories" :key="c" @click="go('catalog', { category: c })"><image :src="`/static/categories/${c}.jpg`" mode="aspectFill" /><text>{{ t(c) }}</text></button></view><button v-for="term in terms" :key="term" class="menu-row" @click="go('catalog', { q: term })"><LineIcon name="clock" :size="19" /><text>{{ term }}</text><LineIcon name="arrow" :size="16" :mirror="state.language === 'en'" /></button></AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import AppShell from '../../components/AppShell.vue'; import LineIcon from '../../components/LineIcon.vue'; import { state, go } from '../../store.js'; import { t } from '../../i18n.js';
const query = ref(''), categories = ['clothes', 'bags', 'shoes', 'accessories']; const terms = computed(() => categories.map(t));
function search() { go('catalog', { q: query.value.trim() }); }
</script>
