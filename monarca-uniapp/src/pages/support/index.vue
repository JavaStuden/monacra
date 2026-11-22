<template>
  <AppShell :key="state.language" :title="t('support')">
    <text class="eyebrow">THE MONARCA CARE</text><text class="section-title">{{ t('contact') }}</text>
    <view class="card"><text class="body-copy">FORT ME GENERAL TRADING L.L.C</text><text class="muted">Al Muraqqabat, Alliance Insurance Building, Deira, Office C1-20, Dubai, UAE</text><text class="body-copy ltr">+971 52 894 5131</text><text class="body-copy ltr">+964 750 222 3313</text><text class="body-copy ltr">Operations@fort-gate.ae</text>
      <button class="primary" @click="contact">{{ t('whatsapp') }}</button><button class="secondary" @click="email">{{ t('email') }}</button>
    </view>
    <text v-if="orderId" class="order-id ltr">{{ orderId }}</text>
    <button v-for="type in ['shipping', 'returns', 'terms', 'privacy']" :key="type" class="menu-row" @click="go('policy', { type })"><text>{{ t(type) }}</text><text>›</text></button>
    <view class="notice">{{ t('currencyNote') }}</view>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import { onLoad } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import { state, go, openExternal } from '../../store.js'; import { t } from '../../i18n.js'; import { validOrderId } from '../../core/commerce.js';
const orderId = ref(''); onLoad(options => { if (validOrderId(options.id)) orderId.value = options.id; });
function contact() { openExternal('https://wa.me/9647502223313?text=' + encodeURIComponent('Monarca' + (orderId.value ? ` · Order ${orderId.value}` : ''))); }
function email() { openExternal('mailto:Operations@fort-gate.ae?subject=' + encodeURIComponent('Monarca ' + orderId.value)); }
</script>
