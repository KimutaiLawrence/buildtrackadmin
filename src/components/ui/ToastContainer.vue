<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const ui = useUiStore()

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <component :is="icons[toast.type]" :size="16" class="toast-icon" />
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div v-if="toast.message" class="toast-msg">{{ toast.message }}</div>
          </div>
          <button class="toast-close" @click="ui.removeToast(toast.id)">
            <X :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed; bottom: 20px; right: 20px;
  z-index: 9999;
  display: flex; flex-direction: column; gap: 8px;
  max-width: 360px;
  pointer-events: none;
}
.toast {
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.2);
  border-radius: 6px;
  padding: 12px 14px;
  display: flex; align-items: flex-start; gap: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  pointer-events: auto;
  min-width: 280px;
}
.toast--success { border-left: 3px solid #27B87A; }
.toast--error { border-left: 3px solid #E05454; }
.toast--warning { border-left: 3px solid #E8A020; }
.toast--info { border-left: 3px solid #C9963C; }

.toast-icon { flex-shrink: 0; margin-top: 1px; }
.toast--success .toast-icon { color: #27B87A; }
.toast--error .toast-icon { color: #E05454; }
.toast--warning .toast-icon { color: #E8A020; }
.toast--info .toast-icon { color: #C9963C; }

.toast-content { flex: 1; min-width: 0; }
.toast-title { font-size: 13px; font-weight: 500; color: #F2EDE4; }
.toast-msg { font-size: 12px; color: rgba(242,237,228,0.55); margin-top: 2px; }
.toast-close {
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.3);
  padding: 2px; border-radius: 3px;
  display: flex; flex-shrink: 0;
}
.toast-close:hover { color: #F2EDE4; }

.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
