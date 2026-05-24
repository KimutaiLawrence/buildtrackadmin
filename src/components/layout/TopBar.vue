<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/developers': 'Developers',
    '/projects': 'Projects',
    '/buyers': 'Buyers',
    '/uploads': 'Uploads',
    '/uploads/flagged': 'Flagged Uploads',
    '/notifications': 'Notification Log',
    '/audit-log': 'Audit Log',
    '/subscriptions': 'Subscriptions',
    '/settings': 'Settings',
  }
  const path = route.path
  // Check for detail routes
  if (path.startsWith('/developers/')) return 'Developer Detail'
  if (path.startsWith('/projects/')) return 'Project Detail'
  return map[path] || 'BuildTrack Admin'
})

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const crumbs = [{ label: 'Home', path: '/dashboard' }]
  let acc = ''
  for (const part of parts) {
    acc += `/${part}`
    const map: Record<string, string> = {
      dashboard: 'Dashboard', developers: 'Developers', projects: 'Projects',
      buyers: 'Buyers', uploads: 'Uploads', flagged: 'Flagged',
      notifications: 'Notifications', 'audit-log': 'Audit Log',
      subscriptions: 'Subscriptions', settings: 'Settings',
    }
    crumbs.push({ label: map[part] || part, path: acc })
  }
  return crumbs
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <nav class="breadcrumbs" aria-label="breadcrumb">
        <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
          <span v-if="i > 0" class="breadcrumb-sep">›</span>
          <router-link
            v-if="i < breadcrumbs.length - 1"
            :to="crumb.path"
            class="breadcrumb-link"
          >{{ crumb.label }}</router-link>
          <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
        </template>
      </nav>
    </div>
    <div class="topbar-right">
      <button class="icon-btn" title="Notifications">
        <Bell :size="16" />
      </button>
      <div class="user-chip">
        <div class="chip-avatar">{{ authStore.user?.full_name?.charAt(0) || 'A' }}</div>
        <span class="chip-name">{{ authStore.user?.email }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  border-bottom: 0.5px solid rgba(201,150,60,0.12);
  background: rgba(13,24,41,0.6);
  backdrop-filter: blur(8px);
  position: sticky; top: 0; z-index: 10;
}
.topbar-left { display: flex; flex-direction: column; gap: 3px; }
.page-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; font-weight: 600;
  color: #F2EDE4; line-height: 1;
}
.breadcrumbs { display: flex; align-items: center; gap: 6px; }
.breadcrumb-sep { color: rgba(242,237,228,0.2); font-size: 11px; }
.breadcrumb-link { font-size: 11px; color: rgba(201,150,60,0.6); text-decoration: none; }
.breadcrumb-link:hover { color: #C9963C; }
.breadcrumb-current { font-size: 11px; color: rgba(242,237,228,0.35); }

.topbar-right { display: flex; align-items: center; gap: 12px; }
.icon-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.4);
  padding: 7px; border-radius: 4px;
  display: flex;
  transition: all 0.15s;
}
.icon-btn:hover { color: #F2EDE4; background: rgba(242,237,228,0.06); }
.user-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(201,150,60,0.06);
  border: 0.5px solid rgba(201,150,60,0.2);
  border-radius: 20px;
  padding: 5px 12px 5px 5px;
}
.chip-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(201,150,60,0.2); color: #C9963C;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
}
.chip-name { font-size: 12px; color: rgba(242,237,228,0.65); }
</style>
