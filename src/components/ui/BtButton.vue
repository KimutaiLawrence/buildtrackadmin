<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled || loading"
    class="bt-btn"
    :class="[
      `bt-btn--${variant || 'primary'}`,
      `bt-btn--${size || 'md'}`,
      { 'bt-btn--loading': loading }
    ]"
  >
    <span v-if="loading" class="spinner" />
    <slot />
  </button>
</template>

<style scoped>
.bt-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 4px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  white-space: nowrap;
}
.bt-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Sizes */
.bt-btn--sm { padding: 5px 12px; font-size: 12px; }
.bt-btn--md { padding: 8px 16px; font-size: 13px; }
.bt-btn--lg { padding: 11px 22px; font-size: 14px; }

/* Variants */
.bt-btn--primary {
  background: #C9963C;
  color: #080F1E;
}
.bt-btn--primary:hover:not(:disabled) { background: #d9a84c; }

.bt-btn--secondary {
  background: rgba(201,150,60,0.12);
  color: #C9963C;
  border: 0.5px solid rgba(201,150,60,0.3);
}
.bt-btn--secondary:hover:not(:disabled) { background: rgba(201,150,60,0.2); }

.bt-btn--ghost {
  background: transparent;
  color: rgba(242,237,228,0.7);
  border: 0.5px solid rgba(242,237,228,0.15);
}
.bt-btn--ghost:hover:not(:disabled) {
  background: rgba(242,237,228,0.06);
  color: #F2EDE4;
}

.bt-btn--danger {
  background: rgba(224,84,84,0.12);
  color: #E05454;
  border: 0.5px solid rgba(224,84,84,0.3);
}
.bt-btn--danger:hover:not(:disabled) { background: rgba(224,84,84,0.22); }

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
