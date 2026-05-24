<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="bt-input-wrapper">
    <label v-if="label" class="bt-input-label">{{ label }}</label>
    <input
      v-bind="$attrs"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="bt-input"
      :class="{ 'bt-input--error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="bt-input-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.bt-input-wrapper { display: flex; flex-direction: column; gap: 5px; }
.bt-input-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(242,237,228,0.55);
  font-family: 'JetBrains Mono', monospace;
}
.bt-input {
  background: #122038;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 4px;
  color: #F2EDE4;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.bt-input::placeholder { color: rgba(242,237,228,0.3); }
.bt-input:focus { border-color: rgba(201,150,60,0.5); }
.bt-input:disabled { opacity: 0.5; cursor: not-allowed; }
.bt-input--error { border-color: rgba(224,84,84,0.5); }
.bt-input-error { font-size: 11px; color: #E05454; }
</style>
