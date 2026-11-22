<template>
  <view class="round-categories">
    <button v-for="category in categories" :key="category" @click="go('catalog', { category })">
      <view class="category-circle" :class="{ 'category-circle-icon': !image(category) }"><image v-if="image(category)" :src="image(category)" mode="aspectFill" /><LineIcon v-else :name="icons[category]" :size="28" /></view><text>{{ t(category) }}</text>
    </button>
  </view>
</template>
<script setup>
import { state, go, browseProducts } from '../store.js';
import { t } from '../i18n.js';
import LineIcon from './LineIcon.vue';
const categories = ['clothes', 'bags', 'shoes', 'accessories'];
const icons = { clothes: 'clothes', bags: 'bag', shoes: 'shoes', accessories: 'accessories' };
const image = category => state.department === 'women' ? `/static/categories/${category}.jpg` : browseProducts().find(p => p.category === category)?.images[0] || '';
</script>
