<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDate, formatBytes, formatTier } from '@/lib/format'
import type { Subscription, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import BtBadge from '@/components/ui/BtBadge.vue'
import BtModal from '@/components/ui/BtModal.vue'
import BtButton from '@/components/ui/BtButton.vue'
import BtDropdown from '@/components/ui/BtDropdown.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const toasts = useToasts()
const pagination = usePagination(20)
const subs = ref<Subscription[]>([])
const loading = ref(false)
const statusFilter = ref('')
const tierFilter = ref('')

const editModal = ref(false)
const editSub = ref<Subscription | null>(null)
const editTier = ref('')
const editStatus = ref('')
const editLoading = ref(false)
const confirmSuspend = ref(false)
const confirmReactivate = ref(false)
const actionSub = ref<Subscription | null>(null)
const actionLoading = ref(false)

const columns = [
  { key: 'developer_name', label: 'Developer', sortable: true },
  { key: 'tier', label: 'Tier', width: '110px' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'trial_ends_at', label: 'Trial End', width: '110px' },
  { key: 'current_period_end', label: 'Period End', width: '110px' },
  { key: 'emails_used', label: 'Emails', width: '80px' },
  { key: 'storage_used_mb', label: 'Storage', width: '90px' },
  { key: '_actions', label: '', width: '120px' },
]

interface SubsResponse { data: PaginatedResponse<Subscription> }

async function loadSubs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (tierFilter.value) params.set('tier', tierFilter.value)
    const res = await api.get(`/v1/admin/subscriptions?${params}`) as SubsResponse
    subs.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load subscriptions', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadSubs)
watch([() => pagination.page.value, statusFilter, tierFilter], loadSubs)

function openEdit(sub: Subscription) {
  editSub.value = sub
  editTier.value = sub.tier
  editStatus.value = sub.status
  editModal.value = true
}

async function saveEdit() {
  if (!editSub.value) return
  editLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${editSub.value.developer_id}/subscription`, {
      tier: editTier.value, status: editStatus.value
    })
    toasts.success('Subscription updated')
    editModal.value = false
    loadSubs()
  } catch (e: unknown) {
    toasts.error('Failed to update', (e as { message?: string })?.message)
  } finally {
    editLoading.value = false
  }
}

async function suspend() {
  if (!actionSub.value) return
  actionLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${actionSub.value.developer_id}/subscription`, { status: 'suspended' })
    toasts.success('Subscription suspended')
    confirmSuspend.value = false
    loadSubs()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    actionLoading.value = false
  }
}

async function reactivate() {
  if (!actionSub.value) return
  actionLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${actionSub.value.developer_id}/subscription`, { status: 'active' })
    toasts.success('Subscription reactivated')
    confirmReactivate.value = false
    loadSubs()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    actionLoading.value = false
  }
}

const tierOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
]
const statusOptions = [
  { label: 'Trial', value: 'trial' },
  { label: 'Active', value: 'active' },
  { label: 'Past Due', value: 'past_due' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Cancelled', value: 'cancelled' },
]
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Subscriptions</h1>
    </div>

    <FilterBar
      :filters="[
        { key: 'tier', label: 'All Tiers', options: tierOptions, value: tierFilter },
        { key: 'status', label: 'All Statuses', options: statusOptions, value: statusFilter },
      ]"
      @update:filter="(k, v) => { if (k === 'tier') tierFilter = v; else statusFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="subs as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No subscriptions found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-tier="{ value }">
        <span class="tier-text">{{ formatTier(String(value)) }}</span>
      </template>
      <template #cell-status="{ value }">
        <BtBadge :status="String(value)" />
      </template>
      <template #cell-trial_ends_at="{ value }">{{ formatDate(value as string | null) }}</template>
      <template #cell-current_period_end="{ value }">{{ formatDate(value as string | null) }}</template>
      <template #cell-storage_used_mb="{ value }">{{ formatBytes(Number(value)) }}</template>
      <template #cell-_actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" title="Edit" @click="openEdit(row as Subscription)">Edit</button>
          <button
            v-if="(row as Subscription).status !== 'suspended'"
            class="action-btn action-btn--danger"
            title="Suspend"
            @click="actionSub = row as Subscription; confirmSuspend = true"
          >Suspend</button>
          <button
            v-else
            class="action-btn action-btn--ok"
            title="Reactivate"
            @click="actionSub = row as Subscription; confirmReactivate = true"
          >Activate</button>
        </div>
      </template>
    </DataTable>

    <!-- Edit Modal -->
    <BtModal :open="editModal" title="Edit Subscription" size="sm" @close="editModal = false">
      <div class="modal-form" v-if="editSub">
        <div class="modal-dev">{{ editSub.developer_name }}</div>
        <BtDropdown label="Tier" v-model="editTier" :options="tierOptions" />
        <BtDropdown label="Status" v-model="editStatus" :options="statusOptions" />
      </div>
      <template #footer>
        <BtButton variant="ghost" @click="editModal = false">Cancel</BtButton>
        <BtButton :loading="editLoading" @click="saveEdit">Save</BtButton>
      </template>
    </BtModal>

    <ConfirmDialog
      :open="confirmSuspend" title="Suspend Subscription"
      :message="`Suspend subscription for ${actionSub?.developer_name}?`"
      confirm-label="Suspend" :loading="actionLoading"
      @confirm="suspend" @cancel="confirmSuspend = false"
    />
    <ConfirmDialog
      :open="confirmReactivate" title="Reactivate Subscription" variant="warning"
      :message="`Reactivate subscription for ${actionSub?.developer_name}?`"
      confirm-label="Reactivate" :loading="actionLoading"
      @confirm="reactivate" @cancel="confirmReactivate = false"
    />
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.tier-text { font-size: 12px; color: rgba(242,237,228,0.65); }
.row-actions { display: flex; gap: 4px; }
.action-btn {
  padding: 4px 8px; background: rgba(201,150,60,0.08);
  border: 0.5px solid rgba(201,150,60,0.2); border-radius: 3px;
  color: #C9963C; font-size: 11px; cursor: pointer;
}
.action-btn:hover { background: rgba(201,150,60,0.18); }
.action-btn--danger { background: rgba(224,84,84,0.08); border-color: rgba(224,84,84,0.2); color: #E05454; }
.action-btn--danger:hover { background: rgba(224,84,84,0.18); }
.action-btn--ok { background: rgba(39,184,122,0.08); border-color: rgba(39,184,122,0.2); color: #27B87A; }
.action-btn--ok:hover { background: rgba(39,184,122,0.18); }
.modal-form { display: flex; flex-direction: column; gap: 14px; }
.modal-dev { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: #F2EDE4; padding-bottom: 10px; border-bottom: 0.5px solid rgba(201,150,60,0.1); }
</style>
