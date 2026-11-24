<template>
  <AppShell :key="state.language" :title="t('bagTitle')" active="cart" class="cart-screen">
    <EmptyState v-if="!state.cart.length" :title="t('emptyBag')" />
    <template v-else>
      <view class="basket-intro"><text>{{ t('bagIntro') }}</text><text class="muted">{{ state.cart.reduce((n, l) => n + l.qty, 0) }} {{ t('pieces') }}</text></view><view class="select-all"><checkbox-group @change="selectAll($event.detail.value.length > 0)"><label><checkbox value="all" :checked="allSelected" color="#6a4c38" /><text>{{ t('selectAll') }}</text></label></checkbox-group><text class="muted">{{ selectedCount }} {{ t('pieces') }}</text></view>
      <view v-for="line in state.cart" :key="lineKey(line)" class="line-item">
        <checkbox-group class="line-select" @change="selectLine(line, $event.detail.value.length > 0)"><checkbox :value="lineKey(line)" :checked="line.selected !== false" color="#6a4c38" /></checkbox-group><image class="line-image" :src="product(line)?.images[0] || '/static/product-placeholder.png'" mode="aspectFill" @click="go('product', { id: line.productId })" />
        <view class="line-body"><text class="line-name">{{ product(line) ? productName(product(line)) : '#' + line.productId }}</text><text class="muted">{{ colorName(line.color, product(line)) }} · {{ sizeName(line.size, state.language === 'en') }}</text><button class="text-button small" @click="go('product', { id: line.productId })">{{ t('edit') }}<LineIcon name="edit" :size="13" /></button><text class="line-price">{{ money((product(line)?.price || 0) * line.qty) }}</text><text class="fulfillment-tag" :class="{ international: product(line)?.fulfillmentSource === 'china' }">{{ t(product(line)?.fulfillmentSource === 'china' ? 'international' : 'local') }}</text></view><view class="line-controls"><view class="stepper ltr"><button @click="change(line, -1)">−</button><text>{{ line.qty }}</text><button @click="change(line, 1)">+</button></view><view class="line-secondary-actions"><button class="text-button" @click="saveForLater(line)">{{ t('saveForLater') }}</button><button class="line-remove" :aria-label="t('remove')" @click="remove(line)"><LineIcon name="trash" :size="18" /></button></view></view>
      </view>
      <text v-if="loading" class="muted">{{ t('loading') }}</text><text v-if="error" class="error">{{ error }}</text>
      <OrderTotals :quote="quote" /><view class="cart-checkout-bar"><button class="primary" :disabled="!quote || loading || !!error || !selectedCount" @click="go('checkout')">{{ t('checkout') }} · {{ money(quote?.total || 0) }}<LineIcon name="arrow" :size="17" :mirror="state.language === 'en'" /></button></view><view class="assurances"><LineIcon name="shield" :size="18" /><text>{{ t('stripeNote') }}</text></view>
    </template>
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onShow } from '@dcloudio/uni-app'; import AppShell from '../../components/AppShell.vue'; import EmptyState from '../../components/EmptyState.vue'; import OrderTotals from '../../components/OrderTotals.vue';
import { state, go, persist, refreshProducts, toast } from '../../store.js'; import { t, money, productName, errorText, colorName } from '../../i18n.js'; import { lineKey, validateVariant, sizeName } from '../../core/commerce.js'; import { api } from '../../api.js'; import LineIcon from '../../components/LineIcon.vue';
const quote = ref(null), error = ref(''), loading = ref(false); let sequence = 0;
const product = line => state.products.find(p => p.id === line.productId);
const selectedCount = computed(() => state.cart.filter(l => l.selected !== false).reduce((n, l) => n + l.qty, 0));
const allSelected = computed(() => state.cart.every(l => l.selected !== false));
function selectLine(line, selected) { line.selected = selected; try { persist(); update(); } catch (e) { toast(errorText(e)); } }
function selectAll(selected) { state.cart.forEach(line => { line.selected = selected; }); try { persist(); update(); } catch (e) { toast(errorText(e)); } }
function saveForLater(line) { if (!state.wish.includes(line.productId)) state.wish.push(line.productId); remove(line); }
async function update() {
  const token = ++sequence; quote.value = null; error.value = ''; loading.value = true;
  try { const selected = state.cart.filter(l => l.selected !== false); if (selected.length) { const result = await api.quote(selected, ''); if (token === sequence) quote.value = result; } }
  catch (e) { if (token === sequence) error.value = errorText(e); } finally { if (token === sequence) loading.value = false; }
}
function change(line, delta) { const next = { ...line, qty: line.qty + delta }; if (!validateVariant(product(line), next)) return; line.qty = next.qty; try { persist(); update(); } catch (e) { toast(errorText(e)); } }
function remove(line) { state.cart = state.cart.filter(x => lineKey(x) !== lineKey(line)); try { persist(); update(); } catch (e) { toast(errorText(e)); } }
onShow(async () => { try { await refreshProducts(); } catch {} update(); });
</script>
