<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { CheckCircle, XCircle } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDateTime } from '@/lib/format'
import type { Upload, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import BtModal from '@/components/ui/BtModal.vue'
import BtButton from '@/components/ui/BtButton.vue'
import BtInput from '@/components/ui/BtInput.vue'

const toasts = useToasts()
const pagination = usePagination(20)
const uploads = ref<Upload[]>([])
const loading = ref(false)

const reviewModal = ref(false)
const reviewUpload = ref<Upload | null>(null)
const reviewReason = ref('')
const reviewLoading = ref(false)

const columns = [
  { key: 'project_name', label: 'Project' },
  { key: 'developer_name', label: 'Developer' },
  { key: 'milestone_name', label: 'Milestone' },
  { key: 'photo_count', label: 'Photos', width: '80px' },
  { key: 'gps_validated', label: 'GPS', width: '80px' },
  { key: 'flag_reason', label: 'Flag Reason' },
  { key: 'created_at', label: 'Submitted', width: '140px' },
  { key: '_actions', label: '', width: '100px' },
]

interface UploadsResponse { data: PaginatedResponse<Upload> }

async function loadUploads() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    const res = await api.get(`/v1/admin/uploads/pending?${params}`) as UploadsResponse
    uploads.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load pending uploads', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadUploads)
watch(() => pagination.page.value, loadUploads)

function openReview(upload: Upload) {
  reviewUpload.value = upload
  reviewReason.value = ''
  reviewModal.value = true
}

async function approveUpload() {
  if (!reviewUpload.value) return
  reviewLoading.value = true
  try {
    await api.post(`/v1/admin/uploads/${reviewUpload.value.id}/review`, {
      action: 'approve',
    })
    toasts.success('Upload approved', 'Now visible to buyers')
    reviewModal.value = false
    loadUploads()
  } catch (e: unknown) {
    toasts.error('Failed to approve', (e as { message?: string })?.message)
  } finally {
    reviewLoading.value = false
  }
}

async function rejectUpload() {
  if (!reviewUpload.value) return
  reviewLoading.value = true
  try {
    await api.post(`/v1/admin/uploads/${reviewUpload.value.id}/review`, {
      action: 'reject',
      reason: reviewReason.value,
    })
    toasts.success('Upload rejected')
    reviewModal.value = false
    loadUploads()
  } catch (e: unknown) {
    toasts.error('Failed to reject', (e as { message?: string })?.message)
  } finally {
    reviewLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Upload Review Queue</h1>
      <div class="count-badge" v-if="pagination.total.value > 0">
        {{ pagination.total.value }} awaiting review
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="uploads as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="Review queue empty — all uploads actioned"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-gps_validated="{ value }">
        <span v-if="value" class="reviewed">✓ GPS OK</span>
        <span v-else class="pending">⚠ Flagged</span>
      </template>
      <template #cell-flag_reason="{ value }">
        <span class="reason-text">{{ value || '—' }}</span>
      </template>
      <template #cell-created_at="{ value }">{{ formatDateTime(String(value)) }}</template>
      <template #cell-_actions="{ row }">
        <button class="review-btn" @click="openReview(row as Upload)">Review</button>
      </template>
    </DataTable>

    <!-- Review Modal -->
    <BtModal :open="reviewModal" title="Review Upload" size="md" @close="reviewModal = false">
      <div v-if="reviewUpload" class="review-content">
        <div class="review-info">
          <div class="review-row">
            <span class="rl">Project</span>
            <span class="rv">{{ reviewUpload.project_name }}</span>
          </div>
          <div class="review-row">
            <span class="rl">Milestone</span>
            <span class="rv">{{ reviewUpload.milestone_name }}</span>
          </div>
          <div class="review-row">
            <span class="rl">Flag Reason</span>
            <span class="rv flag">{{ reviewUpload.flag_reason || 'No reason provided' }}</span>
          </div>
          <div class="review-row" v-if="reviewUpload.gps_distance_meters != null">
            <span class="rl">GPS Distance</span>
            <span class="rv">{{ Math.round(reviewUpload.gps_distance_meters) }}m from project site</span>
          </div>
        </div>
        <BtInput
          label="Rejection Reason (optional)"
          v-model="reviewReason"
          placeholder="Reason for rejection..."
        />
      </div>
      <template #footer>
        <BtButton variant="ghost" @click="reviewModal = false">Cancel</BtButton>
        <BtButton variant="danger" :loading="reviewLoading" @click="rejectUpload">
          <XCircle :size="14" /> Reject
        </BtButton>
        <BtButton variant="secondary" :loading="reviewLoading" @click="approveUpload">
          <CheckCircle :size="14" /> Approve
        </BtButton>
      </template>
    </BtModal>
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.count-badge {
  background: rgba(224,84,84,0.12); color: #E05454;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 3px 8px; border-radius: 3px;
}
.reason-text { font-size: 12px; color: rgba(224,84,84,0.7); }
.reviewed { font-size: 11px; color: #27B87A; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
.pending { font-size: 11px; color: #E8A020; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
.review-btn {
  padding: 4px 10px; background: rgba(201,150,60,0.1);
  border: 0.5px solid rgba(201,150,60,0.3); border-radius: 3px;
  color: #C9963C; font-size: 12px; cursor: pointer;
}
.review-btn:hover { background: rgba(201,150,60,0.2); }

.review-content { display: flex; flex-direction: column; gap: 14px; }
.review-info { display: flex; flex-direction: column; gap: 10px; }
.review-row { display: flex; gap: 12px; align-items: flex-start; }
.rl { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(242,237,228,0.35); width: 120px; flex-shrink: 0; margin-top: 2px; }
.rv { font-size: 13px; color: rgba(242,237,228,0.75); }
.rv.flag { color: #E05454; }
</style>
