<template>
  <view v-if="open" ref="root" class="product-gallery-mask" @click="close" @touchmove.stop.prevent>
    <view class="product-gallery-panel" :class="{ rtl: state.language === 'ar' }" :dir="state.language === 'ar' ? 'rtl' : 'ltr'" role="dialog" aria-modal="true" :aria-label="text('صور المنتج', 'Product photos')" @click.stop>
      <view class="product-gallery-header">
        <text>{{ text('صور المنتج', 'Product photos') }}</text>
        <button class="product-gallery-close" tabindex="0" :aria-label="text('إغلاق', 'Close')" @click="close"><LineIcon name="close" :size="22" /></button>
      </view>
      <scroll-view class="product-gallery-scroll" scroll-y :scroll-top="0" @touchmove.stop>
        <view class="product-gallery-content">
          <text class="product-gallery-instruction">{{ text('مرّري للأسفل لمشاهدة جميع صور المنتج.', 'Scroll down to see all product photos.') }}</text>
          <view v-for="(url, index) in photos" :key="url" class="product-gallery-item">
            <image v-if="!failed[url]" :src="url" mode="widthFix" :alt="`${name} · ${text('الصورة', 'Photo')} ${index + 1}`" @error="failed[url] = true" />
            <view v-else class="product-gallery-error">{{ text('تعذّر تحميل الصورة. تحققي من الاتصال وأعيدي فتح المعرض.', 'Could not load this photo. Check your connection and reopen the gallery.') }}</view>
            <text class="product-gallery-caption">{{ text('الصورة', 'Photo') }} {{ index + 1 }} / {{ photos.length }}{{ imageColors[url] ? ' · ' + t(imageColors[url]) : '' }}</text>
          </view>
          <button class="product-gallery-return" tabindex="0" @click="close">{{ text('العودة إلى القطعة', 'Back to product') }}</button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import LineIcon from './LineIcon.vue';
import { state } from '../store.js';
import { t, text } from '../i18n.js';
const props = defineProps({ open: Boolean, images: { type: Array, default: () => [] }, imageColors: { type: Object, default: () => ({}) }, name: String });
const emit = defineEmits(['close']);
const photos = computed(() => [...new Set(props.images)]);
const root = ref(null), failed = ref({});
const close = () => emit('close');
watch(() => props.open, open => { if (open) failed.value = {}; });
// #ifdef H5
let previousFocus, previousOverflow, locked = false;
function release() {
  if (!locked) return;
  document.body.style.overflow = previousOverflow;
  locked = false;
  if (previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
}
watch(() => props.open, async open => {
  if (!open) { release(); return; }
  previousFocus = document.activeElement;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  locked = true;
  await nextTick();
  const element = root.value?.$el || root.value;
  element?.querySelector('.product-gallery-close')?.focus?.();
});
function keyboard(event) {
  if (!props.open) return;
  if (event.key === 'Escape') { event.preventDefault(); close(); }
  if (event.key !== 'Tab') return;
  const element = root.value?.$el || root.value;
  const controls = [...(element?.querySelectorAll('[tabindex="0"]') || [])];
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
onMounted(() => document.addEventListener('keydown', keyboard));
onUnmounted(() => { document.removeEventListener('keydown', keyboard); release(); });
// #endif
</script>
<style scoped>
.product-gallery-mask{position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-end;justify-content:center;background:#30261e80}
.product-gallery-panel{width:100%;max-width:760px;height:90vh;max-height:calc(100vh - env(safe-area-inset-top));display:flex;flex-direction:column;overflow:hidden;border-radius:20px 20px 0 0;background:#fffefa;color:#302923;direction:ltr;text-align:left;box-shadow:0 -8px 30px #30201018}
.product-gallery-panel.rtl{direction:rtl;text-align:right}
.product-gallery-header{display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:12px;padding:14px 16px;border-bottom:1px solid #e7e1d9;font-size:20px;font-weight:700}
.shell .product-gallery-close{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex-shrink:0}
.product-gallery-scroll{height:0;min-height:0;flex:1;overscroll-behavior-y:contain}
.product-gallery-content{padding:16px 16px calc(24px + env(safe-area-inset-bottom))}
.product-gallery-instruction{display:block;font-size:14px;color:#74685c;line-height:1.8;margin-bottom:16px}
.product-gallery-item{margin-bottom:22px}
.product-gallery-item>image{display:block;width:100%;border-radius:12px;background:#eee7de}
.product-gallery-caption{display:block;font-size:13px;line-height:1.8;color:#74685c;margin-top:8px}
.product-gallery-error{min-height:150px;display:flex;align-items:center;background:#eee7de;border-radius:12px;padding:20px;font-size:14px;line-height:1.8}
.shell .product-gallery-return{display:block;width:100%;min-height:52px;padding:12px;border:1px solid #d4c5b3;border-radius:24px;text-align:center;font-weight:700}
</style>
