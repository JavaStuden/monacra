<template>
  <AppShell :key="state.language" :title="t('returns')">
    <view class="notice">{{ t('returnNote') }}</view><text v-if="error" class="error">{{ error }}</text>
    <template v-if="order && order.status === 'delivered' && !submitted">
      <text class="order-id ltr">{{ order.id }}</text>
      <picker :range="order.items" range-key="productName" :value="index" @change="index = Number($event.detail.value); qty = 1"><view class="card">{{ order.items[index]?.productName }} ⌄</view></picker>
      <view class="row"><text>{{ t('quantity') }}</text><view class="stepper"><button @click="qty = Math.max(1, qty - 1)">−</button><text>{{ qty }}</text><button @click="qty = Math.min(order.items[index]?.qty || 1, qty + 1)">+</button></view></view>
      <label class="field"><text class="field-label">{{ t('reason') }} *</text><textarea v-model="reason" maxlength="100" /></label><label class="field"><text class="field-label">{{ t('note') }}</text><textarea v-model="note" maxlength="500" /></label>
      <button class="primary" :disabled="busy || !reason.trim()" @click="submit">{{ busy ? t('loading') : t('sendRequest') }}</button>
    </template>
    <view v-if="submitted" class="card"><text class="section-title">{{ t('requested') }}</text><text class="order-id ltr">{{ submitted.id }}</text></view>
    <view v-for="item in state.returns" :key="item.id" class="card"><text class="order-id ltr">{{ item.id }}</text><text class="body-copy">{{ item.productName }}</text><text class="muted">{{ item.reason }}</text><text class="small">{{ t('requested') }}</text></view>
    <button class="secondary" @click="go('orders')">{{ t('orders') }}</button><button class="secondary" @click="go('support', order ? { id: order.id } : {})">{{ t('support') }}</button>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import { onLoad } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import { state, go, syncOrder, persist } from '../../store.js'; import { t, errorText } from '../../i18n.js'; import { validOrderId } from '../../core/commerce.js'; import { api } from '../../api.js';
const order = ref(null), index = ref(0), qty = ref(1), reason = ref(''), note = ref(''), error = ref(''), busy = ref(false), submitted = ref(null);
onLoad(async options => { if (!validOrderId(options.id)) return; try { order.value = await syncOrder(options.id); } catch (e) { error.value = errorText(e); } });
async function submit() {
  if (busy.value || !reason.value.trim() || !order.value || submitted.value) return; busy.value = true; error.value = '';
  try {
    const fresh = await syncOrder(order.value.id); if (fresh.status !== 'delivered') throw new Error(t('returnNote'));
    const item = order.value.items[index.value];
    const result = await api.returnRequest({ orderId: order.value.id, productId: item.productId, color: item.color, size: item.size, qty: qty.value, reason: reason.value.trim(), note: note.value });
    submitted.value = result; if (!state.returns.some(x => x.id === result.id)) state.returns.unshift(result); persist();
  } catch (e) { error.value = errorText(e); } finally { busy.value = false; }
}
</script>
