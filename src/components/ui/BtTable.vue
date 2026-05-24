<script setup lang="ts">
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

const props = defineProps<{
  columns: Column[]
  rows: Record<string, unknown>[]
  loading?: boolean
  emptyMessage?: string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  sort: [key: string]
}>()

function handleSort(col: Column) {
  if (col.sortable) emit('sort', col.key)
}
</script>

<template>
  <div class="bt-table-wrapper">
    <table class="bt-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : {}"
            :class="{ sortable: col.sortable }"
            @click="handleSort(col)"
          >
            <span class="th-content">
              {{ col.label }}
              <span v-if="col.sortable" class="sort-icons">
                <ChevronUp :size="11" :class="{ active: sortKey === col.key && sortDir === 'asc' }" />
                <ChevronDown :size="11" :class="{ active: sortKey === col.key && sortDir === 'desc' }" />
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading skeleton -->
        <template v-if="loading">
          <tr v-for="i in 5" :key="`sk-${i}`" class="skeleton-row">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton-cell" />
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="empty-cell">
            {{ emptyMessage || 'No data found' }}
          </td>
        </tr>

        <!-- Data rows -->
        <template v-else>
          <tr v-for="(row, idx) in rows" :key="idx" class="data-row">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.bt-table-wrapper {
  overflow-x: auto;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
}
.bt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
thead tr {
  background: #0D1829;
  border-bottom: 0.5px solid rgba(201,150,60,0.18);
}
th {
  padding: 11px 14px;
  text-align: left;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(242,237,228,0.45);
  user-select: none;
  white-space: nowrap;
}
th.sortable { cursor: pointer; }
th.sortable:hover { color: rgba(242,237,228,0.7); }
.th-content { display: inline-flex; align-items: center; gap: 4px; }
.sort-icons { display: inline-flex; flex-direction: column; gap: 0; color: rgba(242,237,228,0.2); }
.sort-icons .active { color: #C9963C; }

tbody tr { border-bottom: 0.5px solid rgba(201,150,60,0.08); }
tbody tr:last-child { border-bottom: none; }

td {
  padding: 11px 14px;
  color: rgba(242,237,228,0.85);
  vertical-align: middle;
}

.data-row { background: transparent; transition: background 0.1s; }
.data-row:hover { background: rgba(201,150,60,0.04); }

.skeleton-row td { padding: 13px 14px; }
.skeleton-cell {
  height: 14px;
  background: rgba(242,237,228,0.06);
  border-radius: 3px;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

.empty-cell {
  text-align: center;
  padding: 40px 20px;
  color: rgba(242,237,228,0.3);
  font-size: 13px;
}
</style>
