<template>
  <AppShell :key="state.language" :title="t('policies')" class="policy-document">
    <view class="chips"><button v-for="key in types" :key="key" class="chip" :class="{ selected: type === key }" @click="type = key">{{ t(key) }}</button></view>
    <text class="section-title">{{ page.title }}</text><text v-for="(paragraph, index) in page.sections" :key="index" class="body-copy">{{ paragraph }}</text>
    <view v-if="type === 'privacy'" class="notice">{{ t('guestNote') }}</view><button class="secondary" @click="go('support')">{{ t('contact') }}</button>
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onLoad } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import policies from '../../data/policies.json'; import { state, go } from '../../store.js'; import { t } from '../../i18n.js';
const types = ['terms', 'privacy', 'shipping', 'returns'], type = ref('terms'); const page = computed(() => policies[state.language][type.value]); onLoad(options => { if (types.includes(options.type)) type.value = options.type; });
</script>
