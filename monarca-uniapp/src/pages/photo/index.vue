<template>
  <AppShell :key="state.language" :title="t('photoSearch')"><text class="eyebrow">SEE IT. FIND IT. LOVE IT.</text><text class="section-title">{{ text('صورتك، بداية الإلهام.', 'Let your photo inspire you.') }}</text><text class="muted body-copy">{{ text('اختاري صورة للقطعة للرجوع إليها أثناء استكشاف المجموعة.', 'Keep a photo of your inspiration while exploring the collection.') }}</text>
    <view class="photo-upload"><image v-if="photo" :src="photo" mode="aspectFit" /><template v-else><LineIcon name="image" :size="52" /><text>{{ text('صورة واضحة للقطعة', 'A clear photo of your piece') }}</text></template></view>
    <button class="primary" @click="choose('camera')"><LineIcon name="camera" :size="21" />{{ text('التقاط صورة', 'Take a photo') }}</button><button class="secondary" @click="choose('album')"><LineIcon name="upload" :size="21" />{{ text('اختيار من الجهاز', 'Choose from device') }}</button>
    <view class="notice">{{ text('مطابقة الصور ليست متاحة بعد. لا تُرفع صورتك إلى الخادم. يمكنك استكشاف الأقسام أو التواصل مع المتجر.', 'Image matching is not available yet. Your photo stays on your device. Browse the collection or contact the store for help.') }}</view>
    <button class="secondary" @click="go('categories')">{{ t('categories') }}</button><button class="text-button" @click="go('support')">{{ t('contact') }}</button>
  </AppShell>
</template>
<script setup>
import { ref } from 'vue'; import AppShell from '../../components/AppShell.vue'; import LineIcon from '../../components/LineIcon.vue'; import { state, go, toast } from '../../store.js'; import { t, text } from '../../i18n.js';
const photo = ref('');
function choose(source) { uni.chooseImage({ count: 1, sourceType: [source], sizeType: ['compressed'], success: result => { photo.value = result.tempFilePaths[0]; }, fail: () => toast(text('لم يتم اختيار صورة.', 'No photo selected.')) }); }
</script>
