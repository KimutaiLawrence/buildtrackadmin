<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="modal-overlay" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="modal-backdrop" />
      </TransitionChild>

      <div class="modal-container">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
          leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="modal-panel"
            :class="`modal-panel--${size || 'md'}`"
          >
            <div class="modal-gold-top" />
            <div class="modal-header" v-if="title">
              <DialogTitle class="modal-title">{{ title }}</DialogTitle>
              <button class="modal-close" @click="emit('close')">
                <X :size="16" />
              </button>
            </div>
            <div class="modal-body">
              <slot />
            </div>
            <div class="modal-footer" v-if="$slots.footer">
              <slot name="footer" />
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 50;
}
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(8,15,30,0.85);
  backdrop-filter: blur(4px);
}
.modal-container {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.modal-panel {
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.modal-panel--sm { max-width: 400px; }
.modal-panel--md { max-width: 540px; }
.modal-panel--lg { max-width: 720px; }
.modal-panel--xl { max-width: 960px; }

.modal-gold-top {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #C9963C, transparent);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 0.5px solid rgba(201,150,60,0.12);
}
.modal-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  color: #F2EDE4;
}
.modal-close {
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.4);
  padding: 4px;
  border-radius: 3px;
  display: flex;
  transition: color 0.15s;
}
.modal-close:hover { color: #F2EDE4; }
.modal-body { padding: 20px; }
.modal-footer {
  padding: 14px 20px;
  border-top: 0.5px solid rgba(201,150,60,0.12);
  display: flex; gap: 10px; justify-content: flex-end;
}
</style>
