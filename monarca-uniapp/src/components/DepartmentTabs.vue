<template>
  <view class="department-tabs" role="group" :aria-label="t('chooseDepartment')">
    <button v-for="department in ['women', 'men']" :key="department" :class="{ selected: state.department === department }" :aria-pressed="state.department === department" @click="select(department)">
      <text>{{ t(department) }}</text><text v-if="state.language === 'ar'" class="department-english">{{ department.toUpperCase() }}</text>
    </button>
  </view>
</template>
<script setup>
import { state, setDepartment, toast } from '../store.js';
import { t, errorText } from '../i18n.js';
function select(department) { try { setDepartment(department); } catch (error) { toast(errorText(error)); } }
</script>
