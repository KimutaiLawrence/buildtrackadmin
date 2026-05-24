<script setup lang="ts">
import BtModal from '@/components/ui/BtModal.vue'
import BtButton from '@/components/ui/BtButton.vue'
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <BtModal :open="open" :title="title || 'Confirm Action'" size="sm" @close="emit('cancel')">
    <div class="confirm-body">
      <div class="confirm-icon" :class="variant || 'danger'">
        <AlertTriangle :size="22" />
      </div>
      <p class="confirm-msg">{{ message || 'Are you sure? This action cannot be undone.' }}</p>
    </div>
    <template #footer>
      <BtButton variant="ghost" @click="emit('cancel')">{{ cancelLabel || 'Cancel' }}</BtButton>
      <BtButton :variant="variant === 'warning' ? 'secondary' : 'danger'" :loading="loading" @click="emit('confirm')">
        {{ confirmLabel || 'Confirm' }}
      </BtButton>
    </template>
  </BtModal>
</template>

<style scoped>
.confirm-body { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.confirm-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.confirm-icon.danger { background: rgba(224,84,84,0.12); color: #E05454; }
.confirm-icon.warning { background: rgba(232,160,32,0.12); color: #E8A020; }
.confirm-msg { font-size: 14px; color: rgba(242,237,228,0.75); line-height: 1.5; }
</style>
