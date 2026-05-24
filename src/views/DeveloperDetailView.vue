<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, Phone, Mail, Calendar } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { formatDate, formatTier } from '@/lib/format'
import type { Developer, Project, AuditLog } from '@/types/api'
import BtBadge from '@/components/ui/BtBadge.vue'
import BtButton from '@/components/ui/BtButton.vue'
import BtDropdown from '@/components/ui/BtDropdown.vue'
import BtTable from '@/components/ui/BtTable.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const toasts = useToasts()

const id = route.params.id as string
const developer = ref<Developer | null>(null)
const projects = ref<Project[]>([])
const auditLogs = ref<AuditLog[]>([])
const loading = ref(true)

const subTier = ref('')
const subStatus = ref('')
const subLoading = ref(false)

const confirmSuspend = ref(false)
const confirmCancel = ref(false)
const actionLoading = ref(false)

interface DevResponse { data: Developer }
interface ProjectsResponse { data: { data: Project[] } }
interface AuditResponse { data: { data: AuditLog[] } }

onMounted(async () => {
  try {
    const [devRes, projRes, auditRes] = await Promise.all([
      api.get(`/v1/admin/developers/${id}`) as Promise<DevResponse>,
      api.get(`/v1/admin/projects?developer_id=${id}&limit=10`) as Promise<ProjectsResponse>,
      api.get(`/v1/admin/audit-log?developer_id=${id}&limit=10`) as Promise<AuditResponse>,
    ])
    developer.value = devRes.data
    projects.value = projRes.data?.data || []
    auditLogs.value = auditRes.data?.data || []
    subTier.value = devRes.data.subscription_tier
    subStatus.value = devRes.data.subscription_status
  } catch (e: unknown) {
    toasts.error('Failed to load developer', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
})

async function saveSubscription() {
  subLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${id}/subscription`, { tier: subTier.value, status: subStatus.value })
    toasts.success('Subscription updated')
    if (developer.value) {
      developer.value.subscription_tier = subTier.value as Developer['subscription_tier']
      developer.value.subscription_status = subStatus.value as Developer['subscription_status']
    }
  } catch (e: unknown) {
    toasts.error('Failed to update', (e as { message?: string })?.message)
  } finally {
    subLoading.value = false
  }
}

async function suspendDeveloper() {
  actionLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${id}/subscription`, { status: 'suspended' })
    toasts.success('Developer suspended')
    if (developer.value) developer.value.subscription_status = 'suspended'
    subStatus.value = 'suspended'
    confirmSuspend.value = false
  } catch (e: unknown) {
    toasts.error('Failed to suspend', (e as { message?: string })?.message)
  } finally {
    actionLoading.value = false
  }
}

async function cancelDeveloper() {
  actionLoading.value = true
  try {
    await api.patch(`/v1/admin/developers/${id}/subscription`, { status: 'cancelled' })
    toasts.success('Subscription cancelled')
    if (developer.value) developer.value.subscription_status = 'cancelled'
    subStatus.value = 'cancelled'
    confirmCancel.value = false
  } catch (e: unknown) {
    toasts.error('Failed to cancel', (e as { message?: string })?.message)
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

const projectColumns = [
  { key: 'name', label: 'Project' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
  { key: 'buyer_count', label: 'Buyers', width: '80px' },
  { key: 'created_at', label: 'Created', width: '110px' },
]
const auditColumns = [
  { key: 'actor_email', label: 'Actor' },
  { key: 'action', label: 'Action' },
  { key: 'entity_type', label: 'Entity' },
  { key: 'created_at', label: 'Time' },
]
</script>

<template>
  <div>
    <button class="back-btn" @click="router.back()">
      <ArrowLeft :size="14" /> Back
    </button>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="developer">
      <div class="detail-grid">
        <!-- Info card -->
        <div class="card">
          <div class="card-gold" />
          <div class="card-header">
            <h2 class="card-title">Developer Info</h2>
            <BtBadge :status="developer.subscription_status" />
          </div>
          <div class="info-items">
            <div class="info-item">
              <Building2 :size="14" class="info-icon" />
              <div>
                <div class="info-label">Company</div>
                <div class="info-val">{{ developer.company_name }}</div>
              </div>
            </div>
            <div class="info-item">
              <Phone :size="14" class="info-icon" />
              <div>
                <div class="info-label">Contact</div>
                <div class="info-val">{{ developer.contact_person_name }}</div>
                <div class="info-sub">{{ developer.contact_phone }}</div>
              </div>
            </div>
            <div class="info-item">
              <Mail :size="14" class="info-icon" />
              <div>
                <div class="info-label">Email</div>
                <div class="info-val">{{ developer.email }}</div>
              </div>
            </div>
            <div class="info-item">
              <Calendar :size="14" class="info-icon" />
              <div>
                <div class="info-label">Joined</div>
                <div class="info-val">{{ formatDate(developer.created_at) }}</div>
              </div>
            </div>
            <div class="info-stat">
              <span class="info-stat-val">{{ developer.project_count }}</span>
              <span class="info-stat-label">Projects</span>
            </div>
          </div>
        </div>

        <!-- Subscription panel -->
        <div class="card">
          <div class="card-gold" />
          <div class="card-header">
            <h2 class="card-title">Subscription</h2>
          </div>
          <div class="sub-panel">
            <div class="sub-current">
              <span class="sub-tier">{{ formatTier(developer.subscription_tier) }}</span>
              <BtBadge :status="developer.subscription_status" />
            </div>
            <div class="sub-form">
              <BtDropdown label="Change Tier" v-model="subTier" :options="tierOptions" />
              <BtDropdown label="Change Status" v-model="subStatus" :options="statusOptions" />
              <BtButton :loading="subLoading" @click="saveSubscription" size="sm">Save Changes</BtButton>
            </div>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="card card--danger">
          <div class="card-header">
            <h2 class="card-title danger-title">Danger Zone</h2>
          </div>
          <div class="danger-actions">
            <div class="danger-row">
              <div>
                <div class="danger-label">Suspend Account</div>
                <div class="danger-desc">Prevent login and API access immediately</div>
              </div>
              <BtButton variant="danger" size="sm" @click="confirmSuspend = true">Suspend</BtButton>
            </div>
            <div class="danger-row">
              <div>
                <div class="danger-label">Cancel Subscription</div>
                <div class="danger-desc">End the subscription at period end</div>
              </div>
              <BtButton variant="danger" size="sm" @click="confirmCancel = true">Cancel</BtButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects table -->
      <div class="section-card" style="margin-top: 18px;">
        <div class="section-header">
          <h3 class="section-title">Projects</h3>
        </div>
        <BtTable
          :columns="projectColumns"
          :rows="projects as Record<string, unknown>[]"
          :loading="false"
          empty-message="No projects yet"
        >
          <template #cell-status="{ value }">
            <BtBadge :status="String(value)" />
          </template>
          <template #cell-created_at="{ value }">{{ formatDate(String(value)) }}</template>
        </BtTable>
      </div>

      <!-- Audit log -->
      <div class="section-card" style="margin-top: 14px;">
        <div class="section-header">
          <h3 class="section-title">Recent Activity</h3>
        </div>
        <BtTable
          :columns="auditColumns"
          :rows="auditLogs as Record<string, unknown>[]"
          empty-message="No activity"
        >
          <template #cell-created_at="{ value }">{{ formatDate(String(value)) }}</template>
        </BtTable>
      </div>
    </template>

    <ConfirmDialog
      :open="confirmSuspend" title="Suspend Developer"
      :message="`Suspend ${developer?.company_name}? They will lose all access immediately.`"
      confirm-label="Suspend" :loading="actionLoading"
      @confirm="suspendDeveloper" @cancel="confirmSuspend = false"
    />
    <ConfirmDialog
      :open="confirmCancel" title="Cancel Subscription"
      :message="`Cancel subscription for ${developer?.company_name}?`"
      confirm-label="Cancel Subscription" :loading="actionLoading"
      @confirm="cancelDeveloper" @cancel="confirmCancel = false"
    />
  </div>
</template>

<style scoped>
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.4); font-size: 13px;
  padding: 0; margin-bottom: 18px;
  transition: color 0.15s;
}
.back-btn:hover { color: rgba(242,237,228,0.8); }

.detail-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;
}
.card {
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.card-gold {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #C9963C, transparent);
}
.card--danger { border-color: rgba(224,84,84,0.2); }
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 0.5px solid rgba(201,150,60,0.1);
}
.card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px; font-weight: 600; color: #F2EDE4;
}
.danger-title { color: #E05454; }

.info-items { padding: 14px 18px; display: flex; flex-direction: column; gap: 14px; }
.info-item { display: flex; gap: 12px; align-items: flex-start; }
.info-icon { color: rgba(201,150,60,0.5); margin-top: 2px; flex-shrink: 0; }
.info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'JetBrains Mono', monospace; color: rgba(242,237,228,0.35); }
.info-val { font-size: 13px; color: rgba(242,237,228,0.8); margin-top: 2px; }
.info-sub { font-size: 12px; color: rgba(242,237,228,0.4); }
.info-stat { display: flex; align-items: baseline; gap: 6px; padding-top: 6px; border-top: 0.5px solid rgba(201,150,60,0.08); }
.info-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: #C9963C; }
.info-stat-label { font-size: 12px; color: rgba(242,237,228,0.4); }

.sub-panel { padding: 16px 18px; }
.sub-current { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.sub-tier { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: #F2EDE4; }
.sub-form { display: flex; flex-direction: column; gap: 12px; }

.danger-actions { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; }
.danger-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.danger-label { font-size: 13px; color: rgba(242,237,228,0.7); margin-bottom: 3px; }
.danger-desc { font-size: 11px; color: rgba(242,237,228,0.3); }

.section-card {
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
  overflow: hidden;
}
.section-header { padding: 14px 18px 12px; border-bottom: 0.5px solid rgba(201,150,60,0.1); }
.section-title { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; color: #F2EDE4; }
</style>
