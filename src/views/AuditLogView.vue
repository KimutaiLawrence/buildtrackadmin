<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDateTime } from '@/lib/format'
import type { AuditLog, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'

const toasts = useToasts()
const pagination = usePagination(25)
const logs = ref<AuditLog[]>([])
const loading = ref(false)
const search = ref('')
const entityFilter = ref('')

const columns = [
  { key: 'actor_email', label: 'Actor', sortable: true },
  { key: 'actor_role', label: 'Role', width: '90px' },
  { key: 'action', label: 'Action' },
  { key: 'entity_type', label: 'Entity', width: '100px' },
  { key: 'developer_name', label: 'Developer' },
  { key: 'ip_address', label: 'IP', width: '120px' },
  { key: 'created_at', label: 'Time', sortable: true, width: '150px' },
]

interface AuditResponse { data: PaginatedResponse<AuditLog> }

async function loadLogs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (search.value) params.set('search', search.value)
    if (entityFilter.value) params.set('entity_type', entityFilter.value)
    const res = await api.get(`/v1/admin/audit-log?${params}`) as AuditResponse
    logs.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load audit log', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
watch([() => pagination.page.value, search, entityFilter], loadLogs)

const entityOptions = [
  { label: 'Developer', value: 'developer' },
  { label: 'Project', value: 'project' },
  { label: 'Upload', value: 'upload' },
  { label: 'Buyer', value: 'buyer' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Auth', value: 'auth' },
]
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Audit Log</h1>
      <span class="readonly-badge">Read Only</span>
    </div>

    <FilterBar
      :search="search"
      search-placeholder="Search by actor or action..."
      :filters="[
        { key: 'entity', label: 'All Entities', options: entityOptions, value: entityFilter },
      ]"
      @update:search="search = $event; pagination.reset()"
      @update:filter="(k, v) => { entityFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="logs as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No audit entries found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-actor_role="{ value }">
        <span class="role-tag" :class="String(value)">{{ String(value) }}</span>
      </template>
      <template #cell-entity_type="{ value }">
        <span class="entity-tag">{{ String(value) }}</span>
      </template>
      <template #cell-ip_address="{ value }">
        <span class="ip-text">{{ String(value) }}</span>
      </template>
      <template #cell-developer_name="{ value }">{{ value || '—' }}</template>
      <template #cell-created_at="{ value }">{{ formatDateTime(String(value)) }}</template>
    </DataTable>
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.readonly-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase;
  letter-spacing: 0.1em; color: rgba(242,237,228,0.3);
  border: 0.5px solid rgba(242,237,228,0.12); border-radius: 3px; padding: 2px 7px;
}
.role-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; }
.role-tag.admin { color: #C9963C; }
.role-tag.developer { color: #27B87A; }
.role-tag.buyer { color: rgba(242,237,228,0.45); }
.entity-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; color: rgba(201,150,60,0.5); }
.ip-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(242,237,228,0.35); }
</style>
