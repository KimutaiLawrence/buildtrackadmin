<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

function getBadgeStyle(status: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    active:      { bg: 'rgba(39,184,122,0.15)',  color: '#27B87A' },
    complete:    { bg: 'rgba(39,184,122,0.15)',  color: '#27B87A' },
    delivered:   { bg: 'rgba(39,184,122,0.15)',  color: '#27B87A' },
    trial:       { bg: 'rgba(232,160,32,0.15)',  color: '#E8A020' },
    pending:     { bg: 'rgba(232,160,32,0.15)',  color: '#E8A020' },
    past_due:    { bg: 'rgba(232,160,32,0.15)',  color: '#E8A020' },
    queued:      { bg: 'rgba(232,160,32,0.15)',  color: '#E8A020' },
    in_progress: { bg: 'rgba(201,150,60,0.15)',  color: '#C9963C' },
    sent:        { bg: 'rgba(201,150,60,0.15)',  color: '#C9963C' },
    suspended:   { bg: 'rgba(224,84,84,0.15)',   color: '#E05454' },
    cancelled:   { bg: 'rgba(224,84,84,0.15)',   color: '#E05454' },
    failed:      { bg: 'rgba(224,84,84,0.15)',   color: '#E05454' },
    bounced:     { bg: 'rgba(224,84,84,0.15)',   color: '#E05454' },
    delayed:     { bg: 'rgba(224,84,84,0.15)',   color: '#E05454' },
  }
  return map[status] || { bg: 'rgba(242,237,228,0.08)', color: 'rgba(242,237,228,0.55)' }
}

const style = getBadgeStyle(props.status)
</script>

<template>
  <span
    class="badge"
    :style="{ background: style.bg, color: style.color }"
  >
    {{ status.replace(/_/g, ' ') }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
</style>
