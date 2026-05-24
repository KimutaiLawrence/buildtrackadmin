<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>

<template>
  <div class="spinner-wrap">
    <div class="spinner" :style="{ width: `${size || 32}px`, height: `${size || 32}px` }" />
  </div>
</template>

<style scoped>
.spinner-wrap { display: flex; align-items: center; justify-content: center; padding: 2rem; }
.spinner {
  border: 2px solid rgba(201,150,60,0.15);
  border-top-color: #C9963C;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
