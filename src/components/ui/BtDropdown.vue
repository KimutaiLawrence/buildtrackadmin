<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  modelValue?: string
  options: { label: string; value: string }[]
  placeholder?: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const wrapper = ref<HTMLElement>()
onClickOutside(wrapper, () => { open.value = false })
</script>

<template>
  <div class="bt-dropdown" ref="wrapper">
    <label v-if="label" class="bt-dropdown-label">{{ label }}</label>
    <button class="bt-dropdown-btn" type="button" @click="open = !open">
      <span>{{ options.find(o => o.value === modelValue)?.label || placeholder || 'Select...' }}</span>
      <ChevronDown :size="13" :class="{ rotated: open }" />
    </button>
    <Transition name="dropdown">
      <div class="bt-dropdown-menu" v-if="open">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="bt-dropdown-item"
          :class="{ active: modelValue === opt.value }"
          @click="emit('update:modelValue', opt.value); open = false"
        >{{ opt.label }}</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bt-dropdown { position: relative; }
.bt-dropdown-label {
  display: block;
  font-size: 11px; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.08em; color: rgba(242,237,228,0.55);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 5px;
}
.bt-dropdown-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%;
  background: #122038;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 4px;
  color: #F2EDE4;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 9px 12px;
  cursor: pointer;
  gap: 8px;
  transition: border-color 0.15s;
}
.bt-dropdown-btn:hover { border-color: rgba(201,150,60,0.4); }
.rotated { transform: rotate(180deg); transition: transform 0.2s; }
.bt-dropdown-menu {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.25);
  border-radius: 4px;
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.bt-dropdown-item {
  display: block; width: 100%;
  padding: 9px 12px;
  text-align: left;
  background: none; border: none;
  color: rgba(242,237,228,0.75);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.1s;
}
.bt-dropdown-item:hover { background: rgba(201,150,60,0.08); color: #F2EDE4; }
.bt-dropdown-item.active { color: #C9963C; background: rgba(201,150,60,0.1); }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
