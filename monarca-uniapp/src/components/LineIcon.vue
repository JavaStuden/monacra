<template><image class="line-icon" :class="{ 'mirror-icon': mirror }" :src="'/static/icons/' + name + '.svg'" mode="aspectFit" :style="{ width: size + 'px', height: size + 'px' }" /></template>
<script setup>
defineProps({ name: { type: String, default: 'box' }, size: { type: Number, default: 22 }, mirror: Boolean });
</script>
