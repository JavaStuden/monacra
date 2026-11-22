<template>
  <view v-if="quote" class="totals">
    <view class="row"><text>{{ t('subtotal') }}</text><text class="ltr">{{ money(quote.subtotal) }}</text></view>
    <view v-if="Number(quote.discount)" class="row"><text>{{ t('discount') }}</text><text class="ltr">− {{ money(quote.discount) }}</text></view>
    <view class="row"><text>{{ t('shipping') }}</text><text class="ltr">{{ money(quote.shippingFee) }}</text></view>
    <view class="row total"><text>{{ t('total') }}</text><text class="ltr">{{ money(quote.total) }}</text></view>
    <view v-if="currency === 'AED'" class="row"><text>{{ t('due') }}</text><text class="ltr">{{ money(quote.chargeAmount ?? aedAmount(quote.total), 'AED') }}</text></view>
  </view>
</template>
<script setup>
import { t, money } from '../i18n.js';
import { aedAmount } from '../core/commerce.js';
defineProps({ quote: Object, currency: { type: String, default: 'USD' } });
</script>
