<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { refreshProducts } from './store.js';
onLaunch(() => { refreshProducts().catch(() => {}); });
onShow(() => uni.$emit('monarca-app-visible', true));
onHide(() => uni.$emit('monarca-app-visible', false));
</script>
<style>
@import './styles.css';
</style>
