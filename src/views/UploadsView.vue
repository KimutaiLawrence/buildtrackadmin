<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDateTime } from '@/lib/format'
import type { Upload, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import BtBadge from '@/components/ui/BtBadge.vue'

const router = useRouter()
const toasts = useToasts()
const pagination = usePagination(20)

const uploads = ref<Upload[]>([])
const loading = ref(false)
const search = ref('')
const flaggedFilter = ref('')

const columns = [
  { key: 'project_name', label: 'Project' },
  { key: 'developer_name', label: 'Developer' },
  { key: 'milestone_name', label: 'Milestone' },
  { key: 'photo_count', label: 'Photos', width: '80px' },
  { key: 'gps_distance_meters', label: 'GPS Dist', width: '100px' },
  { key: 'fanout_status', label: 'Fan-out', width: '110px' },
  { key: 'is_flagged', label: 'Flagged', width: '90px' },
  { key: 'created_at', label: 'Date', width: '140px' },
]

interface UploadsResponse { data: PaginatedResponse<Upload> }

async function loadUploads() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (flaggedFilter.value) params.set('is_flagged', flaggedFilter.value)
    const res = await api.get(`/v1/admin/uploads?${params}`) as UploadsResponse
    uploads.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load uploads', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadUploads)
watch([() => pagination.page.value, flaggedFilter], loadUploads)

const flaggedOptions = [
  { label: 'Flagged Only', value: 'true' },
  { label: 'Clean Only', value: 'false' },
]
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Uploads</h1>
      <button class="flagged-link" @click="router.push('/uploads/flagged')">View Flagged →</button>
    </div>

    <FilterBar
      :filters="[
        { key: 'flagged', label: 'All Uploads', options: flaggedOptions, value: flaggedFilter },
      ]"
      @update:filter="(k, v) => { flaggedFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="uploads as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No uploads found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-fanout_status="{ value }">
        <BtBadge :status="String(value)" />
      </template>
      <template #cell-is_flagged="{ value }">
        <span v-if="value" class="flag-yes">Flagged</span>
        <span v-else class="flag-no">—</span>
      </template>
      <template #cell-gps_distance_meters="{ value }">
        {{ value != null ? `${Math.round(Number(value))}m` : '—' }}
      </template>
      <template #cell-created_at="{ value }">{{ formatDateTime(String(value)) }}</template>
    </DataTable>
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.flagged-link { background: none; border: none; cursor: pointer; color: rgba(224,84,84,0.7); font-size: 13px; }
.flagged-link:hover { color: #E05454; }
.flag-yes { font-size: 11px; color: #E05454; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
.flag-no { color: rgba(242,237,228,0.2); }
</style>
