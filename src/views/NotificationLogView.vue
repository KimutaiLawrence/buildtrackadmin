<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { usePagination } from '@/composables/usePagination'
import { formatDateTime } from '@/lib/format'
import type { NotificationLog, PaginatedResponse } from '@/types/api'
import DataTable from '@/components/shared/DataTable.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import BtBadge from '@/components/ui/BtBadge.vue'

const toasts = useToasts()
const pagination = usePagination(20)
const logs = ref<NotificationLog[]>([])
const loading = ref(false)
const statusFilter = ref('')
const channelFilter = ref('')

const columns = [
  { key: 'recipient_email', label: 'Recipient' },
  { key: 'channel', label: 'Channel', width: '80px' },
  { key: 'template', label: 'Template' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'provider', label: 'Provider', width: '100px' },
  { key: 'sent_at', label: 'Sent At', width: '140px' },
  { key: 'delivered_at', label: 'Delivered At', width: '140px' },
]

interface NotifResponse { data: PaginatedResponse<NotificationLog> }

async function loadLogs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(pagination.page.value),
      limit: String(pagination.limit.value),
    })
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (channelFilter.value) params.set('channel', channelFilter.value)
    const res = await api.get(`/v1/admin/notifications?${params}`) as NotifResponse
    logs.value = res.data.data
    pagination.total.value = res.data.total
  } catch (e: unknown) {
    toasts.error('Failed to load notifications', (e as { message?: string })?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
watch([() => pagination.page.value, statusFilter, channelFilter], loadLogs)

const statusOptions = [
  { label: 'Queued', value: 'queued' },
  { label: 'Sent', value: 'sent' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Bounced', value: 'bounced' },
  { label: 'Failed', value: 'failed' },
]
const channelOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push', value: 'push' },
]
</script>

<template>
  <div>
    <div class="view-header">
      <h1 class="view-title">Notification Log</h1>
    </div>

    <FilterBar
      :filters="[
        { key: 'status', label: 'All Statuses', options: statusOptions, value: statusFilter },
        { key: 'channel', label: 'All Channels', options: channelOptions, value: channelFilter },
      ]"
      @update:filter="(k, v) => { if (k === 'status') statusFilter = v; else channelFilter = v; pagination.reset() }"
    />

    <DataTable
      :columns="columns"
      :rows="logs as Record<string, unknown>[]"
      :loading="loading"
      :page="pagination.page.value"
      :total-pages="pagination.totalPages.value"
      :total="pagination.total.value"
      :limit="pagination.limit.value"
      empty-message="No notifications found"
      @update:page="pagination.setPage($event)"
    >
      <template #cell-status="{ value }">
        <BtBadge :status="String(value)" />
      </template>
      <template #cell-channel="{ value }">
        <span class="channel-tag">{{ String(value).toUpperCase() }}</span>
      </template>
      <template #cell-sent_at="{ value }">{{ formatDateTime(value as string | null) }}</template>
      <template #cell-delivered_at="{ value }">{{ formatDateTime(value as string | null) }}</template>
    </DataTable>
  </div>
</template>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; }
.channel-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.08em;
  color: rgba(242,237,228,0.4);
}
</style>
