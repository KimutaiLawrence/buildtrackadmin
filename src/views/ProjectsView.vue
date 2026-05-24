<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDate } from '@/lib/format'
import type { Project, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import BtBadge from '@/components/ui/BtBadge.vue'

const router = useRouter()
const toasts = useToasts()
const pagination = usePagination(20)

const projects = ref<Project[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')

const columns = [
  { key: 'name', label: 'Project Name', sortable: true },
  { key: 'developer_name', label: 'Developer' },
  { key: 'location', label: 'Location' },
  { key: 'total_units', label: 'Units', width: '70px' },
  { key: '_milestone', label: 'Milestones', width: '120px' },
  { key: 'buyer_count', label: 'Buyers', width: '70px' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'created_at', label: 'Created', width: '110px' },
]

interface ProjectsResponse { data: PaginatedResponse<Project> }

async function loadProjects() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (search.value) params.set('search', search.value)
    if (statusFilter.value) params.set('status', statusFilter.value)
    const res = await api.get(`/v1/admin/projects?${params}`) as ProjectsResponse
    projects.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load projects', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)
watch([() => pagination.page.value, search, statusFilter], loadProjects)

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Complete', value: 'complete' },
  { label: 'Delayed', value: 'delayed' },
]
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Projects</h1>
    </div>

    <FilterBar
      :search="search"
      search-placeholder="Search projects..."
      :filters="[
        { key: 'status', label: 'All Statuses', options: statusOptions, value: statusFilter },
      ]"
      @update:search="search = $event; pagination.reset()"
      @update:filter="(k, v) => { statusFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="projects as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No projects found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-name="{ row, value }">
        <button class="link-btn" @click="router.push(`/projects/${(row as Project).id}`)">
          {{ String(value) }}
        </button>
      </template>
      <template #cell-_milestone="{ row }">
        <div class="milestone-bar">
          <div
            class="milestone-fill"
            :style="{ width: `${(row as Project).milestone_count > 0 ? ((row as Project).completed_milestones / (row as Project).milestone_count) * 100 : 0}%` }"
          />
        </div>
        <span class="milestone-text">
          {{ (row as Project).completed_milestones }}/{{ (row as Project).milestone_count }}
        </span>
      </template>
      <template #cell-status="{ value }">
        <BtBadge :status="String(value)" />
      </template>
      <template #cell-created_at="{ value }">{{ formatDate(String(value)) }}</template>
    </DataTable>
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.link-btn {
  background: none; border: none; cursor: pointer;
  color: #C9963C; font-size: 13px;
  text-align: left; padding: 0;
}
.link-btn:hover { text-decoration: underline; }
.milestone-bar {
  width: 80px; height: 4px;
  background: rgba(242,237,228,0.08);
  border-radius: 2px; overflow: hidden;
  display: inline-block; vertical-align: middle; margin-right: 6px;
}
.milestone-fill {
  height: 100%; background: #C9963C;
  border-radius: 2px; transition: width 0.3s;
}
.milestone-text { font-size: 11px; color: rgba(242,237,228,0.45); font-family: 'JetBrains Mono', monospace; }
</style>
