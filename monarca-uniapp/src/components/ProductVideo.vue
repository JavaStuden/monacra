<template>
  <view v-if="src && !suspended" class="product-video-widget">
    <button v-if="closed" class="product-video-reopen" @click.stop="closed = false">▶ {{ text('فيديو', 'Video') }}</button>
    <view v-else class="product-video-frame">
      <video :id="videoId" :src="src" :poster="poster" :autoplay="autoplay" :muted="true" :loop="true" :controls="fullscreen"
        :show-center-play-btn="false" :show-play-btn="fullscreen" :show-fullscreen-btn="fullscreen" :enable-progress-gesture="fullscreen"
        :enable-play-gesture="false" :vslide-gesture="false" :vslide-gesture-in-fullscreen="false" :playsinline="true"
        object-fit="cover" @fullscreenchange="fullscreen = !!$event.detail.fullScreen" @error="failed = true">
        <cover-view v-if="!fullscreen" class="product-video-open" @click.stop="open">{{ failed ? text('تعذّر تشغيل الفيديو', 'Video unavailable') : text('▶ مشاهدة', '▶ Watch') }}</cover-view>
        <cover-view v-if="!fullscreen" class="product-video-close" @click.stop="close">×</cover-view>
      </video>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, onBeforeUnmount, getCurrentInstance, watch } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';
import { text } from '../i18n.js';
const props = defineProps({ src: String, poster: String, productId: [Number, String], suspended: Boolean });
const closed = ref(false), fullscreen = ref(false), failed = ref(false), autoplay = ref(true);
const instance = getCurrentInstance();
const videoId = computed(() => 'monarca-video-' + props.productId);
const context = () => uni.createVideoContext(videoId.value, instance.proxy);
function close() { context().pause(); closed.value = true; }
function open() { const player = context(); player.play(); player.requestFullScreen({ direction: 0 }); }
function pause() { if (props.src && !closed.value) context().pause(); }
onHide(pause); onBeforeUnmount(pause);
onShow(() => { if (props.src && !closed.value && !props.suspended && autoplay.value) context().play(); });
watch(() => props.suspended, value => { if (value) pause(); });
watch(() => props.src, () => { closed.value = false; failed.value = false; fullscreen.value = false; });
// #ifdef H5
autoplay.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData;
// #endif
</script>
<style scoped>
.product-video-widget{position:absolute;right:12px;bottom:20px;width:102px;z-index:5;direction:ltr}.product-video-frame{width:102px;height:152px;border-radius:10px;overflow:hidden;box-shadow:0 3px 14px #35261d33;background:#e8dfd2}.product-video-frame video{width:102px;height:152px}.product-video-open{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;box-sizing:border-box;background:transparent;color:#fff;font-size:11px;text-shadow:0 1px 3px #35261d}.product-video-close{position:absolute;right:2px;top:2px;width:30px;height:30px;line-height:28px;border-radius:15px;background:#35261dcc;color:#fff;text-align:center;font-size:25px}.product-video-reopen{margin:0;width:100%;min-height:36px;padding:7px 10px;background:#fcfaf6eb;color:#503d2d;border:1px solid #d6c5ae;border-radius:18px;font-size:11px;line-height:1.5}
</style>
