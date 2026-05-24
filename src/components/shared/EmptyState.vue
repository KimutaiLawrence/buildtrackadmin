<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  message?: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <Inbox :size="32" class="icon" />
    <p class="message">{{ message || 'No data found' }}</p>
    <p v-if="description" class="desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px;
  gap: 10px;
}
.icon { color: rgba(201,150,60,0.3); }
.message { font-size: 14px; color: rgba(242,237,228,0.45); }
.desc { font-size: 12px; color: rgba(242,237,228,0.25); text-align: center; }
</style>
