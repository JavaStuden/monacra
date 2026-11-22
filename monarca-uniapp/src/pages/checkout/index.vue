<template>
  <AppShell :key="state.language" :title="t('checkout')" :nav="false">
    <EmptyState v-if="!lines.length" :title="t('emptyBag')" />
    <template v-else>
      <view class="section-head"><text class="section-title">{{ t('address') }}</text><button class="text-button" :disabled="busy" @click="go('address')">{{ t('edit') }}</button></view>
      <picker v-if="state.addresses.length" :range="state.addresses" range-key="label" :value="addressIndex" :disabled="busy" @change="selectAddress">
        <view class="card"><text>{{ address?.name }}</text><text class="muted">{{ [address?.city, address?.area, address?.street].filter(Boolean).join(' · ') }}</text><text class="ltr">{{ address?.phone }}</text><text> ⌄</text></view>
      </picker>
      <button v-else class="secondary" @click="go('address')">{{ t('addAddress') }}</button>
      <view class="card"><text class="section-title">{{ t('shipping') }}</text><text v-for="group in quote?.deliveryGroups || []" :key="group.source" class="body-copy">{{ t(group.source === 'china' ? 'international' : 'local') }} · {{ group.count }}</text></view>
      <view class="row"><input v-model="coupon" :disabled="busy" :placeholder="t('coupon')" :aria-label="t('coupon')" maxlength="30" /><button class="chip" :disabled="busy || quoteLoading" @click="updateQuote">{{ t('apply') }}</button></view>
      <text v-if="quote?.appliedCoupon" class="muted">{{ quote.appliedCoupon }}</text>
      <text v-if="quoteLoading" class="muted">{{ t('loading') }}</text><text v-if="error" class="error">{{ error }}</text><OrderTotals :quote="quote" :currency="currency" />
      <text class="section-title">{{ t('currency') }}</text>
      <radio-group @change="currency = $event.detail.value">
        <label v-for="c in ['USD', 'AED']" :key="c" class="radio-option"><radio :value="c" :checked="currency === c" :disabled="busy" color="#6f5133" /><text class="ltr">{{ money(c === 'AED' ? aedAmount(quote?.total || 0) : quote?.total || 0, c) }}</text></label>
      </radio-group><text v-if="currency === 'AED'" class="muted">{{ t('rate') }}</text>
      <label class="field"><text class="field-label">{{ t('note') }}</text><textarea v-model="note" maxlength="300" :disabled="busy" /></label>
      <view class="notice">{{ t('stripeNote') }}</view>
      <checkbox-group @change="accepted = $event.detail.value.includes('yes')"><label class="checkbox-line"><checkbox value="yes" :checked="accepted" :disabled="busy" color="#6f5133" /><text>{{ t('termsAccept') }}</text></label></checkbox-group>
      <view class="row"><button class="text-button" @click="go('policy', { type: 'terms' })">{{ t('terms') }}</button><button class="text-button" @click="go('policy', { type: 'privacy' })">{{ t('privacy') }}</button></view>
      <button class="primary" :disabled="busy || quoteLoading || !quote || !address" @click="pay">{{ busy ? t('loading') : t('pay') }}</button>
    </template>
  </AppShell>
</template>
<script setup>
import { computed, ref } from 'vue'; import { onLoad, onShow } from '@dcloudio/uni-app';
import AppShell from '../../components/AppShell.vue'; import OrderTotals from '../../components/OrderTotals.vue'; import EmptyState from '../../components/EmptyState.vue';
import { state, go, persist, saveOrder, refreshProducts, toast } from '../../store.js'; import { t, money, errorText } from '../../i18n.js'; import { api } from '../../api.js';
import { aedAmount, orderPayload, validateCheckoutSession, checkoutFingerprint, addressValid, validateVariant } from '../../core/commerce.js';
const lines = ref([]), source = ref('cart'), quote = ref(null), quoteLoading = ref(false), busy = ref(false), error = ref(''), coupon = ref(''), note = ref(''), currency = ref('USD'), accepted = ref(false);
const addressIndex = computed(() => Math.max(0, state.addresses.findIndex(a => a.id === state.selectedAddressId)));
const address = computed(() => state.addresses[addressIndex.value]); let quoteSequence = 0;
onLoad(options => {
  source.value = options.source === 'buy' ? 'buy' : 'cart';
  const selected = source.value === 'buy' ? uni.getStorageSync('monarca-buy-now') : state.cart;
  lines.value = JSON.parse(JSON.stringify(Array.isArray(selected) ? selected : selected ? [selected] : []));
});
onShow(() => { if (!busy.value) updateQuote(); });
function selectAddress(event) { state.selectedAddressId = state.addresses[Number(event.detail.value)]?.id || ''; try { persist(); } catch (e) { toast(errorText(e)); } }
async function updateQuote() {
  if (!lines.value.length) return;
  const sequence = ++quoteSequence; quoteLoading.value = true; quote.value = null; error.value = ''; accepted.value = false;
  try {
    await refreshProducts();
    if (lines.value.some(line => !validateVariant(state.products.find(p => p.id === line.productId), line))) throw new Error(t('unavailable'));
    const value = await api.quote(lines.value, coupon.value.trim()); if (sequence === quoteSequence) quote.value = value;
  } catch (e) { if (sequence === quoteSequence) error.value = errorText(e); } finally { if (sequence === quoteSequence) quoteLoading.value = false; }
}
async function pay() {
  if (busy.value || !quote.value) return;
  if (!accepted.value) { toast(t('acceptFirst')); return; }
  if (!addressValid(address.value)) { toast(t('invalidAddress')); return; }
  busy.value = true; error.value = '';
  try {
    persist(); // Stop before creating a session if the device cannot retain its order reference.
    const payload = orderPayload(lines.value, address.value, quote.value, currency.value, note.value);
    const signature = checkoutFingerprint(payload);
    const previous = Object.entries(state.pending).find(([, p]) => p.signature === signature && !p.consumed);
    const raw = previous ? await api.retry(previous[0], currency.value) : await api.checkout(payload);
    // Retain the server order reference even if a subsequent session validation fails.
    if (raw?.orderId) {
      state.pending[raw.orderId] = { ...state.pending[raw.orderId], signature, quote: { ...quote.value }, cartLines: source.value === 'cart' ? lines.value : [], session: raw, consumed: false };
      saveOrder({ id: raw.orderId, status: 'payment_pending', paymentStatus: 'pending', total: quote.value.total, chargeCurrency: raw.chargeCurrency, chargeAmount: raw.chargeAmount, items: lines.value.map(line => ({ ...line })) });
    }
    const session = validateCheckoutSession(raw, currency.value, quote.value.total);
    go('payment', { id: session.orderId });
  } catch (e) {
    error.value = errorText(e);
    if (e.message === 'CHECKOUT_TOTAL_CHANGED') { await updateQuote(); error.value = t('changeTotal'); }
  } finally { busy.value = false; }
}
</script>
