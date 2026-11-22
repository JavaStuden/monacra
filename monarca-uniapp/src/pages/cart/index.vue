<template>
  <AppShell :key="state.language" :title="t('cart')" active="cart">
    <EmptyState v-if="!state.cart.length" :title="t('emptyBag')" />
    <template v-else>
      <view v-for="line in state.cart" :key="lineKey(line)" class="line-item">
        <image class="line-image" :src="product(line)?.images[0] || '/static/product-placeholder.png'" mode="aspectFill" @click="go('product', { id: line.productId })" />
        <view class="line-body"><text class="line-name">{{ product(line) ? productName(product(line)) : '#' + line.productId }}</text><text class="muted">{{ t(line.color) }} · {{ line.size }}</text><text class="ltr">{{ money((product(line)?.price || 0) * line.qty) }}</text><view class="row"><view class="stepper"><button @click="change(line, -1)">−</button><text>{{ line.qty }}</text><button @click="change(line, 1)">+</button></view><button class="text-button" @click="remove(line)">{{ t('remove') }}</button></view></view>
      </view>
      <text v-if="loading" class="muted">{{ t('loading') }}</text><text v-if="error" class="error">{{ error }}</text>
      <OrderTotals :quote="quote" /><button class="primary" :disabled="!quote || loading || !!error" @click="go('checkout')">{{ t('checkout') }}</button>
    </template>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import EmptyState from '../../components/EmptyState.vue'; import OrderTotals from '../../components/OrderTotals.vue';
import { state, go, persist, refreshProducts, toast } from '../../store.js'; import { t, money, productName, errorText } from '../../i18n.js'; import { lineKey, validateVariant } from '../../core/commerce.js'; import { api } from '../../api.js';
const quote = ref(null), error = ref(''), loading = ref(false); let sequence = 0;
const product = line => state.products.find(p => p.id === line.productId);
async function update() {
  const token = ++sequence; quote.value = null; error.value = ''; loading.value = true;
  try { if (state.cart.length) { const result = await api.quote(state.cart, ''); if (token === sequence) quote.value = result; } }
  catch (e) { if (token === sequence) error.value = errorText(e); } finally { if (token === sequence) loading.value = false; }
}
function change(line, delta) { const next = { ...line, qty: line.qty + delta }; if (!validateVariant(product(line), next)) return; line.qty = next.qty; try { persist(); update(); } catch (e) { toast(errorText(e)); } }
function remove(line) { state.cart = state.cart.filter(x => lineKey(x) !== lineKey(line)); try { persist(); update(); } catch (e) { toast(errorText(e)); } }
onShow(async () => { try { await refreshProducts(); } catch {} update(); });
</script>
