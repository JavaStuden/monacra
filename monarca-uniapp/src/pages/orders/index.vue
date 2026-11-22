<template>
  <AppShell :key="state.language" :title="t('orders')">
    <text class="muted">{{ t('deviceOrders') }}</text><view class="card"><text>{{ t('recover') }}</text><input v-model="lookup" :placeholder="t('orderNumber')" class="ltr" maxlength="76" /><button class="secondary" :disabled="busy" @click="recover">{{ t('findOrder') }}</button></view>
    <text v-if="error" class="error">{{ error }}</text>
    <view class="chips"><button v-for="f in filters" :key="f" class="chip" :class="{ selected: filter === f }" @click="filter = f">{{ t(f) }}</button></view>
    <view v-for="order in orders" :key="order.id" class="card" @click="go('order', { id: order.id })"><view class="row"><text class="order-id ltr">{{ order.id }}</text><text class="status" :class="{ paid: order.paymentStatus === 'paid' }">{{ t(order.status) }}</text></view><text class="ltr">{{ money(order.total) }}</text><text v-if="order.deliverySummary" class="muted">{{ order.deliverySummary }}</text></view>
    <EmptyState v-if="!orders.length" />
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import EmptyState from '../../components/EmptyState.vue';
import { state, go, syncOrder } from '../../store.js'; import { t, money, errorText } from '../../i18n.js'; import { validOrderId } from '../../core/commerce.js';
const lookup = ref(''), filter = ref('all'), error = ref(''), busy = ref(false), filters = ['all', 'payment_pending', 'preparing', 'shipped', 'delivered'];
const orders = computed(() => state.orders.filter(o => filter.value === 'all' || (filter.value === 'preparing' ? ['placed', 'preparing'].includes(o.status) : o.status === filter.value)));
async function recover() { if (busy.value) return; const id = lookup.value.trim().toUpperCase(); if (!validOrderId(id)) { error.value = t('orderNumber'); return; } busy.value = true; error.value = ''; try { await syncOrder(id); go('order', { id }); } catch (e) { error.value = errorText(e); } finally { busy.value = false; } }
onShow(async () => { const results = await Promise.allSettled(state.orders.slice(0, 12).map(o => syncOrder(o.id))); if (results.some(x => x.status === 'rejected')) error.value = t('network'); });
</script>
