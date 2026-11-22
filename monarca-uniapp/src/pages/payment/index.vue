<template>
  <AppShell :key="state.language" :title="t('payment')" :nav="false">
    <view class="payment-result"><view class="result-icon"><LineIcon :name="paid ? 'check' : failed ? 'card' : 'shield'" :size="32" /></view><text class="section-title">{{ t(paid ? 'paid' : failed ? 'failed' : 'pending') }}</text><text class="order-id ltr">{{ id }}</text><text v-if="order" class="detail-price">{{ money(order.chargeAmount ?? order.total, order.chargeCurrency || 'USD') }}</text></view>
    <text v-if="error" class="error">{{ error }}</text>
    <template v-if="!paid">
      <view class="notice">{{ t('paymentReturn') }}</view><text class="body-copy">{{ t('noDuplicate') }}</text>
      <button v-if="session?.url" class="primary" @click="openPayment">{{ t('openStripe') }}</button>
      <button class="secondary" :disabled="checking" @click="check">{{ checking ? t('loading') : t('checkPayment') }}</button>
    </template>
    <button class="primary" @click="go('order', { id })">{{ t('order') }}</button>
    <button class="text-button" @click="go('support', { id })">{{ t('support') }}</button>
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import LineIcon from '../../components/LineIcon.vue';
import { state, go, syncOrder, openExternal } from '../../store.js'; import { validOrderId, validateCheckoutSession } from '../../core/commerce.js'; import { t, money, errorText } from '../../i18n.js';
const id = ref(''), order = ref(null), checking = ref(false), error = ref(''); const session = computed(() => state.pending[id.value]?.session);
const paid = computed(() => order.value?.paymentStatus === 'paid'); const failed = computed(() => order.value?.paymentStatus === 'failed'); let timer, visible = false, pageActive = false, checks = 0;
onLoad(options => { id.value = validOrderId(options.id) ? options.id : ''; uni.$on('monarca-app-visible', appVisibility); });
onShow(() => { pageActive = true; visible = true; checks = 0; check(); });
onHide(() => { pageActive = false; stop(); });
onUnload(() => { stop(); uni.$off('monarca-app-visible', appVisibility); });
function stop() { visible = false; clearTimeout(timer); }
function appVisibility(shown) { if (!shown) stop(); else if (pageActive) { visible = true; checks = 0; check(); } }
async function check() {
  if (!id.value || checking.value) return;
  clearTimeout(timer); checking.value = true; error.value = '';
  try { order.value = await syncOrder(id.value); } catch (e) { error.value = errorText(e); }
  finally { checking.value = false; checks++; if (visible && !paid.value && !failed.value && checks < 8) timer = setTimeout(check, 4000); }
}
function openPayment() {
  try {
    const pending = state.pending[id.value]; validateCheckoutSession(session.value, session.value.chargeCurrency, pending.quote.total);
    openExternal(session.value.url);
  } catch (e) { error.value = errorText(e); }
}
</script>
