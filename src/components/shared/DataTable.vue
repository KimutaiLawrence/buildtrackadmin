<script setup lang="ts">
import BtTable, { type Column } from '@/components/ui/BtTable.vue'
import BtPagination from '@/components/ui/BtPagination.vue'

defineProps<{
  columns: Column[]
  rows: Record<string, unknown>[]
  loading?: boolean
  emptyMessage?: string
  page: number
  totalPages: number
  total: number
  limit: number
  sortKey?: string
  sortDir?: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  sort: [key: string]
}>()
</script>

<template>
  <div>
    <BtTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :empty-message="emptyMessage"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      @sort="emit('sort', $event)"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
    </BtTable>
    <BtPagination
      :page="page"
      :total-pages="totalPages"
      :total="total"
      :limit="limit"
      @update:page="emit('update:page', $event)"
    />
  </div>
</template>
