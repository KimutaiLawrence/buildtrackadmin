<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import BtDropdown from '@/components/ui/BtDropdown.vue'

defineProps<{
  search?: string
  searchPlaceholder?: string
  filters?: {
    key: string
    label: string
    options: { label: string; value: string }[]
    value?: string
  }[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:filter': [key: string, value: string]
}>()
</script>

<template>
  <div class="filter-bar">
    <div v-if="searchPlaceholder !== undefined || search !== undefined" class="search-wrap">
      <Search :size="14" class="search-icon" />
      <input
        class="search-input"
        :value="search"
        :placeholder="searchPlaceholder || 'Search...'"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="filters-wrap" v-if="filters && filters.length > 0">
      <BtDropdown
        v-for="f in filters"
        :key="f.key"
        :model-value="f.value"
        :options="[{ label: f.label, value: '' }, ...f.options]"
        :placeholder="f.label"
        @update:model-value="emit('update:filter', f.key, $event)"
        style="min-width: 140px;"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 340px;
}
.search-icon {
  position: absolute;
  left: 10px; top: 50%;
  transform: translateY(-50%);
  color: rgba(242,237,228,0.3);
  pointer-events: none;
}
.search-input {
  width: 100%;
  background: #122038;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 4px;
  color: #F2EDE4;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 8px 12px 8px 32px;
  outline: none;
  transition: border-color 0.15s;
}
.search-input::placeholder { color: rgba(242,237,228,0.3); }
.search-input:focus { border-color: rgba(201,150,60,0.4); }
.filters-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
