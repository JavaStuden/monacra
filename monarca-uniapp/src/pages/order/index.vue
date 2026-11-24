<template>
  <AppShell :key="state.language" :title="t('order')">
    <text v-if="busy" class="muted">{{ t('loading') }}</text><text v-if="error" class="error">{{ error }}</text><button v-if="error" class="secondary" @click="load">{{ t('retry') }}</button>
    <template v-if="order">
      <view class="row"><text class="order-id ltr">{{ order.id }}</text><text class="status" :class="{ paid: order.paymentStatus === 'paid' }">{{ t(order.status) }}</text></view><button class="text-button" @click="copy">{{ t('copy') }}</button>
      <view v-for="(line, index) in order.items" :key="index" class="line-item"><view class="line-body"><text class="line-name">{{ state.language === 'en' && product(line).enName ? product(line).enName : line.productName || productName(product(line)) }}</text><text class="muted">{{ colorName(line.color, state.products.find(p => p.id === Number(line.productId || line.id))) }} · {{ line.size }} × {{ line.qty }}</text></view><text class="ltr">{{ money(Number(line.unitPrice ?? product(line).price ?? 0) * line.qty) }}</text></view>
      <OrderTotals :quote="order" :currency="order.chargeCurrency" />
      <view class="card"><text class="section-title">{{ t('receipt') }}</text><text class="status" :class="{ paid: order.paymentStatus === 'paid' }">{{ t(order.paymentStatus === 'paid' ? 'paid' : order.paymentStatus === 'failed' ? 'failed' : 'pending') }}</text><text v-if="order.transactionId" class="body-copy ltr">{{ order.transactionId }}</text></view>
      <text class="section-title">{{ t('tracking') }}</text><view class="timeline"><view v-for="step in steps" :key="step" class="timeline-item" :class="{ current: steps.indexOf(order.status) >= steps.indexOf(step) }">{{ t(step) }}</view></view><text class="muted">{{ t('trackingNote') }}</text><text class="body-copy">{{ order.deliverySummary }}</text>
      <button v-if="order.status === 'payment_pending' && order.paymentStatus !== 'paid'" class="primary" :disabled="busy" @click="resume">{{ t('payment') }}</button>
      <button v-if="order.status === 'delivered'" class="secondary" @click="go('returns', { id })">{{ t('requestReturn') }}</button>
      <button class="secondary" @click="go('support', { id })">{{ t('support') }}</button>
    </template>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import { onLoad, onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import OrderTotals from '../../components/OrderTotals.vue';
import { state, go, syncOrder, persist } from '../../store.js'; import { t, money, productName, errorText, colorName } from '../../i18n.js'; import { api } from '../../api.js'; import { validateCheckoutSession, validOrderId } from '../../core/commerce.js';
const id = ref(''), order = ref(null), busy = ref(false), error = ref(''), steps = ['placed', 'preparing', 'shipped', 'delivered'];
const product = line => state.products.find(p => p.id === line.productId) || {};
onLoad(options => { id.value = validOrderId(options.id) ? options.id : ''; }); onShow(load);
async function load() { if (!id.value || busy.value) return; busy.value = true; error.value = ''; try { order.value = await syncOrder(id.value); } catch (e) { error.value = errorText(e); } finally { busy.value = false; } }
function copy() { uni.setClipboardData({ data: id.value }); }
async function resume() {
  if (busy.value) return; busy.value = true; error.value = '';
  try {
    const status = await syncOrder(id.value); order.value = status;
    if (status.paymentStatus === 'paid') return;
    const currency = status.chargeCurrency === 'AED' ? 'AED' : 'USD';
    const session = validateCheckoutSession(await api.retry(id.value, currency), currency, status.total);
    state.pending[id.value] = { ...state.pending[id.value], session, quote: status }; persist(); go('payment', { id: id.value });
  } catch (e) { error.value = errorText(e); } finally { busy.value = false; }
}
</script>
