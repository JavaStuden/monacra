<template>
  <AppShell :key="state.language" :title="t('support')">
    <view class="care-heading"><text class="eyebrow">THE MONARCA CARE</text><text class="section-title">{{ t('contact') }}</text><text class="muted">{{ text('اختاري الموضوع أو تواصلي معنا لمتابعة التفاصيل.', 'Choose a topic or contact us for help with the details.') }}</text></view>
    <view class="care-grid"><button @click="go('orders')"><LineIcon name="box" :size="25" />{{ t('tracking') }}</button><button @click="go('policy', { type: 'terms' })"><LineIcon name="card" :size="25" />{{ t('payment') }}</button><button @click="go('returns')"><LineIcon name="return" :size="25" />{{ t('returns') }}</button><button @click="go('catalog')"><LineIcon name="bag" :size="25" />{{ t('catalog') }}</button></view>
    <view class="contact-card"><view class="contact-heading"><LineIcon name="whatsapp" :size="30" /><view><text class="section-title">Monarca · WhatsApp</text><text class="muted">{{ t('contact') }}</text></view></view><text class="body-copy">{{ text('للاستفسار عن المنتجات والطلبات، تواصلي مع متجر Monarca.', 'Contact the Monarca team for help with products and orders.') }}</text><view class="contact-number"><text>{{ t('phone') }}</text><text class="ltr">+964 750 222 3313</text></view>
      <button class="primary" @click="contact"><LineIcon name="whatsapp" :size="20" />{{ t('whatsapp') }}</button><button class="secondary" @click="email">{{ t('email') }}</button>
    </view>
    <view class="card"><text class="line-name">FORT ME GENERAL TRADING L.L.C</text><text class="muted">Al Muraqqabat, Alliance Insurance Building, Deira, Office C1-20, Dubai, UAE</text><text class="body-copy ltr">+971 52 894 5131</text><text class="body-copy ltr">Operations@fort-gate.ae</text></view>
    <text v-if="orderId" class="order-id ltr">{{ orderId }}</text>
    <button v-for="type in ['shipping', 'returns', 'terms', 'privacy']" :key="type" class="menu-row" @click="go('policy', { type })"><text>{{ t(type) }}</text><text>›</text></button>
    <view class="notice">{{ t('currencyNote') }}</view>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import { onLoad } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import LineIcon from '../../components/LineIcon.vue'; import { state, go, openExternal } from '../../store.js'; import { t, text } from '../../i18n.js'; import { validOrderId } from '../../core/commerce.js';
const orderId = ref(''); onLoad(options => { if (validOrderId(options.id)) orderId.value = options.id; });
function contact() { openExternal('https://wa.me/9647502223313?text=' + encodeURIComponent('Monarca' + (orderId.value ? ` · Order ${orderId.value}` : ''))); }
function email() { openExternal('mailto:Operations@fort-gate.ae?subject=' + encodeURIComponent('Monarca ' + orderId.value)); }
</script>
