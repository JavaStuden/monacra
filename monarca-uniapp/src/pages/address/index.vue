<template>
  <AppShell :key="state.language" :title="t('addresses')">
    <view v-for="a in state.addresses" :key="a.id" class="card" :class="{ 'selected-card': state.selectedAddressId === a.id }"><view @click="select(a)"><text>{{ a.name }}</text><text class="muted">{{ [a.city, a.area, a.street].join(' · ') }}</text><text class="ltr">{{ a.phone }}</text></view><button class="text-button" @click="draft = { ...a }">{{ t('edit') }}</button></view>
    <text class="eyebrow">YOUR ADDRESS</text><text class="section-title">{{ draft.id ? t('edit') : t('addAddress') }}</text><text class="muted body-copy">{{ t('myAddress') }}</text>
    <view class="address-form"><label v-for="key in fields" :key="key" class="field" :class="'field-' + key"><text class="field-label">{{ t(key) }}{{ required.includes(key) ? ' *' : '' }}</text><input v-model="draft[key]" :aria-label="t(key)" :type="key === 'phone' ? 'tel' : 'text'" :maxlength="key === 'phone' ? 30 : 100" :placeholder="key === 'phone' ? '+964 7xx xxx xxxx' : ''" /></label></view>
    <text v-if="error" class="error">{{ error }}</text><button class="primary" @click="save">{{ t('save') }}</button>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import AppShell from '../../components/AppShell.vue'; import { state, persist, toast } from '../../store.js'; import { t, errorText } from '../../i18n.js'; import { addressValid } from '../../core/commerce.js';
const fields = ['name', 'phone', 'city', 'locality', 'area', 'street', 'landmark', 'building', 'apartment'], required = ['name', 'phone', 'city', 'area', 'street'];
const draft = ref(Object.fromEntries(fields.map(key => [key, '']))), error = ref('');
function select(a) { state.selectedAddressId = a.id; try { persist(); toast(t('save')); } catch (e) { error.value = errorText(e); } }
function save() {
  if (!addressValid(draft.value)) { error.value = t('invalidAddress'); return; }
  try {
    const a = { ...draft.value, id: draft.value.id || `address-${Date.now()}`, label: `${draft.value.name} · ${draft.value.city} · ${draft.value.area}` };
    const index = state.addresses.findIndex(x => x.id === a.id); if (index >= 0) state.addresses[index] = a; else state.addresses.push(a);
    state.selectedAddressId = a.id; persist(); uni.navigateBack({ fail: () => toast(t('save')) });
  } catch (e) { error.value = errorText(e); }
}
</script>
