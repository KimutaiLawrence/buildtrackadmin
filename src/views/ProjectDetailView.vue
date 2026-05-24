<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Home, Users } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { formatDate, formatDateTime } from '@/lib/format'
import type { Project, Milestone, Upload, Buyer, AuditLog } from '@/types/api'
import BtBadge from '@/components/ui/BtBadge.vue'
import BtTable from '@/components/ui/BtTable.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const toasts = useToasts()
const id = route.params.id as string

const project = ref<Project | null>(null)
const milestones = ref<Milestone[]>([])
const uploads = ref<Upload[]>([])
const buyers = ref<Buyer[]>([])
const auditLogs = ref<AuditLog[]>([])
const loading = ref(true)

interface ProjectResponse { data: Project }
interface MilestonesResponse { data: { data: Milestone[] } }
interface UploadsResponse { data: { data: Upload[] } }
interface BuyersResponse { data: { data: Buyer[] } }
interface AuditResponse { data: { data: AuditLog[] } }

onMounted(async () => {
  try {
    const [projRes, mileRes, uplRes, buyRes, auditRes] = await Promise.all([
      api.get(`/v1/admin/projects/${id}`) as Promise<ProjectResponse>,
      api.get(`/v1/admin/projects/${id}/milestones`) as Promise<MilestonesResponse>,
      api.get(`/v1/admin/uploads?project_id=${id}&limit=10`) as Promise<UploadsResponse>,
      api.get(`/v1/admin/buyers?project_id=${id}&limit=10`) as Promise<BuyersResponse>,
      api.get(`/v1/admin/audit-log?entity_id=${id}&limit=10`) as Promise<AuditResponse>,
    ])
    project.value = projRes.data
    milestones.value = mileRes.data?.data || []
    uploads.value = uplRes.data?.data || []
    buyers.value = buyRes.data?.data || []
    auditLogs.value = auditRes.data?.data || []
  } catch (e: unknown) {
    toasts.error('Failed to load project', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
})

const uploadCols = [
  { key: 'milestone_name', label: 'Milestone' },
  { key: 'photo_count', label: 'Photos', width: '80px' },
  { key: 'gps_distance_meters', label: 'GPS Dist', width: '100px' },
  { key: 'fanout_status', label: 'Fan-out', width: '110px' },
  { key: 'is_flagged', label: 'Flagged', width: '80px' },
  { key: 'created_at', label: 'Date', width: '120px' },
]

const buyerCols = [
  { key: 'full_name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'invitation_status', label: 'Status', width: '100px' },
  { key: 'created_at', label: 'Added', width: '110px' },
]

const auditCols = [
  { key: 'actor_email', label: 'Actor' },
  { key: 'action', label: 'Action' },
  { key: 'created_at', label: 'Time', width: '140px' },
]
</script>

<template>
  <div>
    <button class="back-btn" @click="router.back()">
      <ArrowLeft :size="14" /> Back
    </button>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="project">
      <div class="project-hero">
        <div class="hero-gold" />
        <div class="hero-content">
          <div class="hero-main">
            <h1 class="hero-title">{{ project.name }}</h1>
            <BtBadge :status="project.status" />
          </div>
          <div class="hero-meta">
            <span class="meta-item">
              <MapPin :size="12" /> {{ project.location }}
            </span>
            <span class="meta-item">
              <Home :size="12" /> {{ project.total_units }} units
            </span>
            <span class="meta-item">
              <Users :size="12" /> {{ project.buyer_count }} buyers
            </span>
            <span class="meta-item dev-link" @click="router.push(`/developers/${project.developer_id}`)">
              {{ project.developer_name }}
            </span>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hstat">
            <div class="hstat-val">{{ project.completed_milestones }}/{{ project.milestone_count }}</div>
            <div class="hstat-label">Milestones</div>
          </div>
          <div class="hstat">
            <div class="hstat-val">{{ formatDate(project.created_at) }}</div>
            <div class="hstat-label">Started</div>
          </div>
        </div>
      </div>

      <!-- Milestone timeline -->
      <div class="section-card" style="margin-top: 18px;">
        <div class="section-header"><h3 class="section-title">Milestone Timeline</h3></div>
        <div class="milestone-list" v-if="milestones.length > 0">
          <div v-for="m in milestones" :key="m.id" class="milestone-item" :class="{ complete: m.is_complete }">
            <div class="m-indicator">
              <div class="m-dot" :class="{ complete: m.is_complete }" />
              <div class="m-line" v-if="m.order < milestones.length" />
            </div>
            <div class="m-content">
              <div class="m-name">{{ m.name }}</div>
              <div v-if="m.is_complete && m.completed_at" class="m-date">
                Completed {{ formatDate(m.completed_at) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-text">No milestones defined</div>
      </div>

      <!-- Uploads -->
      <div class="section-card" style="margin-top: 14px;">
        <div class="section-header"><h3 class="section-title">Recent Uploads</h3></div>
        <BtTable :columns="uploadCols" :rows="uploads as Record<string, unknown>[]" empty-message="No uploads yet">
          <template #cell-fanout_status="{ value }"><BtBadge :status="String(value)" /></template>
          <template #cell-is_flagged="{ value }">
            <span v-if="value" class="flagged-dot">Flagged</span>
            <span v-else class="ok-dot">OK</span>
          </template>
          <template #cell-gps_distance_meters="{ value }">
            {{ value != null ? `${Math.round(Number(value))}m` : '—' }}
          </template>
          <template #cell-created_at="{ value }">{{ formatDateTime(String(value)) }}</template>
        </BtTable>
      </div>

      <!-- Buyers -->
      <div class="section-card" style="margin-top: 14px;">
        <div class="section-header"><h3 class="section-title">Buyers</h3></div>
        <BtTable :columns="buyerCols" :rows="buyers as Record<string, unknown>[]" empty-message="No buyers yet">
          <template #cell-invitation_status="{ value }"><BtBadge :status="String(value)" /></template>
          <template #cell-created_at="{ value }">{{ formatDate(String(value)) }}</template>
        </BtTable>
      </div>

      <!-- Audit -->
      <div class="section-card" style="margin-top: 14px;">
        <div class="section-header"><h3 class="section-title">Activity Log</h3></div>
        <BtTable :columns="auditCols" :rows="auditLogs as Record<string, unknown>[]" empty-message="No activity">
          <template #cell-created_at="{ value }">{{ formatDateTime(String(value)) }}</template>
        </BtTable>
      </div>
    </template>
  </div>
</template>

<style scoped>
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.4); font-size: 13px; padding: 0; margin-bottom: 18px;
}
.back-btn:hover { color: rgba(242,237,228,0.8); }

.project-hero {
  background: #0D1829; border: 0.5px solid rgba(201,150,60,0.18); border-radius: 6px;
  padding: 22px 24px; display: flex; gap: 24px; align-items: flex-start; position: relative; overflow: hidden;
}
.hero-gold {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #C9963C, transparent);
}
.hero-content { flex: 1; }
.hero-main { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.hero-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: #F2EDE4; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 14px; }
.meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(242,237,228,0.45); }
.dev-link { color: #C9963C; cursor: pointer; }
.dev-link:hover { text-decoration: underline; }
.hero-stats { display: flex; gap: 24px; }
.hstat { text-align: right; }
.hstat-val { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: #F2EDE4; }
.hstat-label { font-size: 11px; color: rgba(242,237,228,0.35); margin-top: 2px; }

.section-card { background: #0D1829; border: 0.5px solid rgba(201,150,60,0.18); border-radius: 6px; overflow: hidden; }
.section-header { padding: 14px 18px 12px; border-bottom: 0.5px solid rgba(201,150,60,0.1); }
.section-title { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; color: #F2EDE4; }
.empty-text { padding: 24px; text-align: center; font-size: 13px; color: rgba(242,237,228,0.3); }

.milestone-list { padding: 14px 18px; }
.milestone-item { display: flex; gap: 12px; }
.m-indicator { display: flex; flex-direction: column; align-items: center; }
.m-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(242,237,228,0.15); border: 1.5px solid rgba(242,237,228,0.2);
  flex-shrink: 0; margin-top: 2px;
}
.m-dot.complete { background: #27B87A; border-color: #27B87A; }
.m-line { width: 1.5px; flex: 1; background: rgba(201,150,60,0.12); margin: 4px 0; min-height: 16px; }
.m-content { padding-bottom: 14px; }
.m-name { font-size: 13px; color: rgba(242,237,228,0.75); }
.milestone-item.complete .m-name { color: rgba(242,237,228,0.9); }
.m-date { font-size: 11px; color: rgba(39,184,122,0.6); margin-top: 2px; }

.flagged-dot { font-size: 11px; color: #E05454; font-family: 'JetBrains Mono', monospace; }
.ok-dot { font-size: 11px; color: rgba(242,237,228,0.25); font-family: 'JetBrains Mono', monospace; }
</style>
