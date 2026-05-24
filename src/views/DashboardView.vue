<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Users, FolderKanban, UserCheck, Upload, Flag, ArrowRight } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { formatRelative } from '@/lib/format'
import type { AdminStats, AuditLog } from '@/types/api'

const router = useRouter()
const toasts = useToasts()

const stats = ref<AdminStats | null>(null)
const recentActivity = ref<AuditLog[]>([])
const loading = ref(true)

interface StatsResponse { data: AdminStats }
interface AuditResponse { data: { data: AuditLog[] } }

onMounted(async () => {
  try {
    const [statsRes, auditRes] = await Promise.all([
      api.get('/v1/admin/stats') as Promise<StatsResponse>,
      api.get('/v1/admin/audit-log?limit=10') as Promise<AuditResponse>,
    ])
    stats.value = statsRes.data
    recentActivity.value = auditRes.data?.data || []
  } catch (e: unknown) {
    toasts.error('Failed to load dashboard data', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
})

const statCards = [
  { key: 'total_developers', label: 'Developers', icon: Users, color: '#C9963C', path: '/developers' },
  { key: 'total_projects', label: 'Projects', icon: FolderKanban, color: '#27B87A', path: '/projects' },
  { key: 'total_buyers', label: 'Buyers', icon: UserCheck, color: '#C9963C', path: '/buyers' },
  { key: 'uploads_this_week', label: 'Uploads This Week', icon: Upload, color: '#27B87A', path: '/uploads' },
]
</script>

<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        @click="router.push(card.path)"
      >
        <div class="stat-card-top" />
        <div class="stat-icon" :style="{ background: `${card.color}20`, color: card.color }">
          <component :is="card.icon" :size="20" />
        </div>
        <div class="stat-value">
          <template v-if="loading">
            <div class="skeleton-val" />
          </template>
          <template v-else>
            {{ stats?.[card.key as keyof AdminStats] ?? '—' }}
          </template>
        </div>
        <div class="stat-label">{{ card.label }}</div>
      </div>

      <!-- Flagged card special -->
      <div
        class="stat-card stat-card--flagged"
        :class="{ 'has-flags': (stats?.flagged_uploads || 0) > 0 }"
        @click="router.push('/uploads/flagged')"
      >
        <div class="stat-card-top" />
        <div class="stat-icon" :style="{ background: 'rgba(224,84,84,0.12)', color: '#E05454' }">
          <Flag :size="20" />
        </div>
        <div class="stat-value">
          <template v-if="loading"><div class="skeleton-val" /></template>
          <template v-else>{{ stats?.flagged_uploads ?? '—' }}</template>
        </div>
        <div class="stat-label">
          Flagged Uploads
          <span v-if="(stats?.flagged_uploads || 0) > 0" class="flag-badge">Needs Review</span>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="section-row">
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
        </div>
        <div class="quick-actions">
          <button class="qa-btn" @click="router.push('/developers')">
            <Users :size="16" />
            Manage Developers
            <ArrowRight :size="13" class="qa-arrow" />
          </button>
          <button class="qa-btn qa-btn--danger" @click="router.push('/uploads/flagged')">
            <Flag :size="16" />
            Review Flagged Uploads
            <ArrowRight :size="13" class="qa-arrow" />
          </button>
          <button class="qa-btn" @click="router.push('/subscriptions')">
            <FolderKanban :size="16" />
            Subscriptions
            <ArrowRight :size="13" class="qa-arrow" />
          </button>
          <button class="qa-btn" @click="router.push('/audit-log')">
            <Upload :size="16" />
            View Audit Log
            <ArrowRight :size="13" class="qa-arrow" />
          </button>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="section section--wide">
        <div class="section-header">
          <h2 class="section-title">Recent Activity</h2>
          <button class="view-all" @click="router.push('/audit-log')">View all →</button>
        </div>
        <div class="activity-list" v-if="!loading">
          <div v-if="recentActivity.length === 0" class="empty-activity">No recent activity</div>
          <div v-for="log in recentActivity" :key="log.id" class="activity-item">
            <div class="activity-actor">
              <div class="actor-dot" :class="log.actor_role" />
              <span class="actor-email">{{ log.actor_email }}</span>
              <span class="actor-role">{{ log.actor_role }}</span>
            </div>
            <div class="activity-action">
              <span class="action-name">{{ log.action }}</span>
              <span class="action-entity">{{ log.entity_type }}</span>
            </div>
            <div class="activity-time">{{ formatRelative(log.created_at) }}</div>
          </div>
        </div>
        <div v-else class="activity-loading">
          <div v-for="i in 5" :key="i" class="skeleton-activity" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.stat-card {
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
  padding: 20px 18px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
}
.stat-card:hover { border-color: rgba(201,150,60,0.35); background: #122038; }
.stat-card-top {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(201,150,60,0.4), transparent);
}
.stat-card--flagged.has-flags .stat-card-top {
  background: linear-gradient(90deg, transparent, rgba(224,84,84,0.6), transparent);
}

.stat-icon {
  width: 38px; height: 38px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px; font-weight: 600;
  color: #F2EDE4; line-height: 1;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 12px; color: rgba(242,237,228,0.45);
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.flag-badge {
  background: rgba(224,84,84,0.15); color: #E05454;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 6px; border-radius: 2px;
}
.skeleton-val {
  width: 60px; height: 28px;
  background: rgba(242,237,228,0.06); border-radius: 4px;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

.section-row { display: grid; grid-template-columns: 280px 1fr; gap: 18px; }
.section {
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
  overflow: hidden;
}
.section--wide {}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 0.5px solid rgba(201,150,60,0.1);
}
.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px; font-weight: 600; color: #F2EDE4;
}
.view-all {
  font-size: 12px; color: rgba(201,150,60,0.6);
  background: none; border: none; cursor: pointer;
}
.view-all:hover { color: #C9963C; }

.quick-actions { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.qa-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: rgba(242,237,228,0.03);
  border: 0.5px solid rgba(201,150,60,0.12);
  border-radius: 4px;
  color: rgba(242,237,228,0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.qa-btn:hover { background: rgba(201,150,60,0.08); color: #C9963C; border-color: rgba(201,150,60,0.25); }
.qa-btn--danger:hover { background: rgba(224,84,84,0.08); color: #E05454; border-color: rgba(224,84,84,0.25); }
.qa-arrow { margin-left: auto; opacity: 0.5; }

.activity-list { padding: 8px 0; }
.activity-item {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 18px;
  border-bottom: 0.5px solid rgba(201,150,60,0.06);
  transition: background 0.1s;
}
.activity-item:last-child { border-bottom: none; }
.activity-item:hover { background: rgba(201,150,60,0.03); }

.activity-actor { display: flex; align-items: center; gap: 7px; min-width: 0; width: 220px; }
.actor-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.actor-dot.admin { background: #C9963C; }
.actor-dot.developer { background: #27B87A; }
.actor-dot.buyer { background: rgba(242,237,228,0.4); }
.actor-email { font-size: 12px; color: rgba(242,237,228,0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actor-role {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase;
  color: rgba(242,237,228,0.25); flex-shrink: 0;
}
.activity-action { flex: 1; display: flex; gap: 8px; align-items: center; }
.action-name { font-size: 12px; color: rgba(242,237,228,0.75); }
.action-entity {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  color: rgba(201,150,60,0.5); text-transform: uppercase;
}
.activity-time { font-size: 11px; color: rgba(242,237,228,0.25); white-space: nowrap; flex-shrink: 0; }

.empty-activity { padding: 24px; text-align: center; font-size: 13px; color: rgba(242,237,228,0.3); }
.activity-loading { padding: 12px 18px; display: flex; flex-direction: column; gap: 10px; }
.skeleton-activity {
  height: 28px; background: rgba(242,237,228,0.05); border-radius: 4px;
  animation: pulse 1.2s ease-in-out infinite;
}

@media (max-width: 900px) {
  .section-row { grid-template-columns: 1fr; }
}
</style>
