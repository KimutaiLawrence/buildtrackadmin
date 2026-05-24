<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDate } from '@/lib/format'
import type { Buyer, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import BtBadge from '@/components/ui/BtBadge.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const toasts = useToasts()
const pagination = usePagination(20)
const buyers = ref<Buyer[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const deleteTarget = ref<Buyer | null>(null)
const deleteLoading = ref(false)

const columns = [
  { key: 'full_name', label: 'Full Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'project_name', label: 'Project' },
  { key: 'developer_name', label: 'Developer' },
  { key: 'invitation_status', label: 'Status', width: '110px' },
  { key: 'created_at', label: 'Joined', width: '110px' },
  { key: 'last_login_at', label: 'Last Login', width: '110px' },
  { key: '_actions', label: '', width: '60px' },
]

interface BuyersResponse { data: PaginatedResponse<Buyer> }

async function loadBuyers() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (search.value) params.set('search', search.value)
    if (statusFilter.value) params.set('invitation_status', statusFilter.value)
    const res = await api.get(`/v1/admin/buyers?${params}`) as BuyersResponse
    buyers.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load buyers', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadBuyers)
watch([() => pagination.page.value, search, statusFilter], loadBuyers)

async function removeBuyer() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await api.delete(`/v1/admin/buyers/${deleteTarget.value.id}`)
    toasts.success('Buyer removed')
    deleteTarget.value = null
    loadBuyers()
  } catch (e: unknown) {
    toasts.error('Failed to remove buyer', (e as { message?: string })?.message)
  } finally {
    deleteLoading.value = false
  }
}

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
]
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Buyers</h1>
    </div>

    <FilterBar
      :search="search"
      search-placeholder="Search buyers..."
      :filters="[
        { key: 'status', label: 'All Statuses', options: statusOptions, value: statusFilter },
      ]"
      @update:search="search = $event; pagination.reset()"
      @update:filter="(k, v) => { statusFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="buyers as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No buyers found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-invitation_status="{ value }">
        <BtBadge :status="String(value)" />
      </template>
      <template #cell-created_at="{ value }">{{ formatDate(String(value)) }}</template>
      <template #cell-last_login_at="{ value }">{{ formatDate(value as string | null) }}</template>
      <template #cell-_actions="{ row }">
        <button class="action-btn action-btn--danger" title="Remove" @click="deleteTarget = row as Buyer">
          <Trash2 :size="14" />
        </button>
      </template>
    </DataTable>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Remove Buyer"
      :message="`Remove ${deleteTarget?.full_name} from their project? This cannot be undone.`"
      confirm-label="Remove"
      :loading="deleteLoading"
      @confirm="removeBuyer"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.action-btn {
  width: 28px; height: 28px; border-radius: 4px; background: none; border: none;
  cursor: pointer; color: rgba(242,237,228,0.4);
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
}
.action-btn--danger:hover { background: rgba(224,84,84,0.1); color: #E05454; }
</style>
