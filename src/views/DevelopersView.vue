<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Eye, CreditCard, Ban, Trash2 } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDate, formatTier } from '@/lib/format'
import type { Developer, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import BtBadge from '@/components/ui/BtBadge.vue'
import BtButton from '@/components/ui/BtButton.vue'
import BtModal from '@/components/ui/BtModal.vue'
import BtInput from '@/components/ui/BtInput.vue'
import BtDropdown from '@/components/ui/BtDropdown.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const router = useRouter()
const toasts = useToasts()
const pagination = usePagination(20)

const developers = ref<Developer[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const tierFilter = ref('')

const showAddModal = ref(false)
const showSubModal = ref(false)
const showDeleteConfirm = ref(false)
const actionDev = ref<Developer | null>(null)
const actionLoading = ref(false)

// Add developer form
const newDev = ref({
  company_name: '', contact_person_name: '', contact_phone: '',
  email: '', password: '', subscription_tier: 'starter'
})

// Subscription edit
const subEdit = ref({ tier: '', status: '' })

const columns = [
  { key: 'company_name', label: 'Company', sortable: true },
  { key: 'contact_person_name', label: 'Contact' },
  { key: 'email', label: 'Email' },
  { key: 'subscription_tier', label: 'Tier' },
  { key: 'subscription_status', label: 'Status' },
  { key: 'project_count', label: 'Projects', width: '80px' },
  { key: 'created_at', label: 'Created', width: '110px' },
  { key: '_actions', label: '', width: '120px' },
]

interface DevsResponse { data: PaginatedResponse<Developer> }

async function loadDevelopers() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (search.value) params.set('search', search.value)
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (tierFilter.value) params.set('tier', tierFilter.value)
    const res = await api.get(`/v1/admin/developers?${params}`) as DevsResponse
    developers.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load developers', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadDevelopers)
watch([() => pagination.page.value, search, statusFilter, tierFilter], loadDevelopers)

async function addDeveloper() {
  actionLoading.value = true
  try {
    await api.post('/v1/admin/developers', newDev.value)
    toasts.success('Developer created')
    showAddModal.value = false
    newDev.value = { company_name: '', contact_person_name: '', contact_phone: '', email: '', password: '', subscription_tier: 'starter' }
    loadDevelopers()
  } catch (e: unknown) {
    toasts.error('Failed to create developer', (e as { message?: string })?.message)
  } finally {
    actionLoading.value = false
  }
}

function openSubEdit(dev: Developer) {
  actionDev.value = dev
  subEdit.value = { tier: dev.subscription_tier, status: dev.subscription_status }
  showSubModal.value = true
}

async function saveSubscription() {
  if (!actionDev.value) return
  actionLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${actionDev.value.id}/subscription`, subEdit.value)
    toasts.success('Subscription updated')
    showSubModal.value = false
    loadDevelopers()
  } catch (e: unknown) {
    toasts.error('Failed to update subscription', (e as { message?: string })?.message)
  } finally {
    actionLoading.value = false
  }
}

function openDelete(dev: Developer) {
  actionDev.value = dev
  showDeleteConfirm.value = true
}

async function deleteDeveloper() {
  if (!actionDev.value) return
  actionLoading.value = true
  try {
    await api.delete(`/v1/admin/developers/${actionDev.value.id}`)
    toasts.success('Developer deleted')
    showDeleteConfirm.value = false
    loadDevelopers()
  } catch (e: unknown) {
    toasts.error('Failed to delete developer', (e as { message?: string })?.message)
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
      <h1 class="view-title">Developers</h1>
      <BtButton @click="showAddModal = true">
        <Plus :size="14" /> Add Developer
      </BtButton>
    </div>

    <FilterBar
      :search="search"
      search-placeholder="Search by name or email..."
      :filters="[
        { key: 'tier', label: 'All Tiers', options: tierOptions, value: tierFilter },
        { key: 'status', label: 'All Statuses', options: statusOptions, value: statusFilter },
      ]"
      @update:search="search = $event; pagination.reset()"
      @update:filter="(k, v) => { if (k === 'tier') tierFilter = v; else statusFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="developers as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No developers found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-subscription_tier="{ value }">
        <span class="tier-label">{{ formatTier(String(value)) }}</span>
      </template>
      <template #cell-subscription_status="{ value }">
        <BtBadge :status="String(value)" />
      </template>
      <template #cell-created_at="{ value }">
        {{ formatDate(String(value)) }}
      </template>
      <template #cell-_actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" title="View" @click="router.push(`/developers/${(row as Developer).id}`)">
            <Eye :size="14" />
          </button>
          <button class="action-btn" title="Edit Subscription" @click="openSubEdit(row as Developer)">
            <CreditCard :size="14" />
          </button>
          <button class="action-btn action-btn--danger" title="Delete" @click="openDelete(row as Developer)">
            <Trash2 :size="14" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Add Developer Modal -->
    <BtModal :open="showAddModal" title="Add Developer" size="md" @close="showAddModal = false">
      <form @submit.prevent="addDeveloper" class="modal-form">
        <BtInput label="Company Name" v-model="newDev.company_name" placeholder="Acme Developers Ltd" />
        <BtInput label="Contact Person" v-model="newDev.contact_person_name" placeholder="John Doe" />
        <BtInput label="Phone" v-model="newDev.contact_phone" placeholder="+254700000000" />
        <BtInput label="Email" type="email" v-model="newDev.email" placeholder="dev@company.co.ke" />
        <BtInput label="Password" type="password" v-model="newDev.password" placeholder="Min 8 characters" />
        <BtDropdown label="Subscription Tier" v-model="newDev.subscription_tier" :options="tierOptions" />
      </form>
      <template #footer>
        <BtButton variant="ghost" @click="showAddModal = false">Cancel</BtButton>
        <BtButton :loading="actionLoading" @click="addDeveloper">Create Developer</BtButton>
      </template>
    </BtModal>

    <!-- Edit Subscription Modal -->
    <BtModal :open="showSubModal" title="Edit Subscription" size="sm" @close="showSubModal = false">
      <div class="modal-form" v-if="actionDev">
        <div class="modal-dev-name">{{ actionDev.company_name }}</div>
        <BtDropdown label="Tier" v-model="subEdit.tier" :options="tierOptions" />
        <BtDropdown label="Status" v-model="subEdit.status" :options="statusOptions" />
      </div>
      <template #footer>
        <BtButton variant="ghost" @click="showSubModal = false">Cancel</BtButton>
        <BtButton :loading="actionLoading" @click="saveSubscription">Save Changes</BtButton>
      </template>
    </BtModal>

    <!-- Delete Confirm -->
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Delete Developer"
      :message="`Delete ${actionDev?.company_name}? This action cannot be undone.`"
      confirm-label="Delete"
      :loading="actionLoading"
      @confirm="deleteDeveloper"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px; font-weight: 600; color: #F2EDE4;
}
.tier-label { font-size: 12px; color: rgba(242,237,228,0.65); }
.row-actions { display: flex; gap: 4px; }
.action-btn {
  width: 28px; height: 28px; border-radius: 4px;
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.4);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
}
.action-btn:hover { background: rgba(201,150,60,0.1); color: #C9963C; }
.action-btn--danger:hover { background: rgba(224,84,84,0.1); color: #E05454; }

.modal-form { display: flex; flex-direction: column; gap: 14px; }
.modal-dev-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px; color: #F2EDE4;
  padding-bottom: 10px;
  border-bottom: 0.5px solid rgba(201,150,60,0.1);
}
</style>
