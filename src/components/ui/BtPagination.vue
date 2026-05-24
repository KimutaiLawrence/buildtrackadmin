<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  page: number
  totalPages: number
  total: number
  limit: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const startItem = computed(() => Math.min((props.page - 1) * props.limit + 1, props.total))
const endItem = computed(() => Math.min(props.page * props.limit, props.total))

const pages = computed(() => {
  const p: (number | string)[] = []
  const total = props.totalPages
  if (total <= 7) {
    for (let i = 1; i <= total; i++) p.push(i)
  } else {
    p.push(1)
    if (props.page > 3) p.push('...')
    for (let i = Math.max(2, props.page - 1); i <= Math.min(total - 1, props.page + 1); i++) {
      p.push(i)
    }
    if (props.page < total - 2) p.push('...')
    p.push(total)
  }
  return p
})
</script>

<template>
  <div class="pagination" v-if="totalPages > 1 || total > 0">
    <span class="page-info">
      {{ startItem }}–{{ endItem }} of {{ total }}
    </span>
    <div class="page-controls">
      <button class="page-btn" :disabled="page <= 1" @click="emit('update:page', page - 1)">
        <ChevronLeft :size="14" />
      </button>
      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="ellipsis">…</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: p === page }"
          @click="emit('update:page', Number(p))"
        >{{ p }}</button>
      </template>
      <button class="page-btn" :disabled="page >= totalPages" @click="emit('update:page', page + 1)">
        <ChevronRight :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 0;
  gap: 12px;
}
.page-info {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(242,237,228,0.4);
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  background: rgba(242,237,228,0.04);
  border: 0.5px solid rgba(201,150,60,0.15);
  border-radius: 3px;
  color: rgba(242,237,228,0.55);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  font-family: 'JetBrains Mono', monospace;
}
.page-btn:hover:not(:disabled) {
  background: rgba(201,150,60,0.12);
  color: #C9963C;
  border-color: rgba(201,150,60,0.3);
}
.page-btn.active {
  background: rgba(201,150,60,0.18);
  color: #C9963C;
  border-color: rgba(201,150,60,0.4);
}
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.ellipsis {
  color: rgba(242,237,228,0.3);
  font-size: 12px;
  padding: 0 4px;
}
</style>
