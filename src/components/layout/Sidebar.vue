<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard, Users, FolderKanban, UserCheck, Upload,
  ClipboardCheck, Bell, ScrollText, CreditCard, Settings, LogOut,
  Workflow, Shield
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/developers', label: 'Developers', icon: Users },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/buyers', label: 'Buyers', icon: UserCheck },
  { path: '/uploads', label: 'All Uploads', icon: Upload },
  { path: '/uploads/flagged', label: 'Review Queue', icon: ClipboardCheck },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/audit-log', label: 'Audit Log', icon: ScrollText },
  { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/workflows', label: 'Workflows', icon: Workflow },
  { path: '/roles', label: 'Roles', icon: Shield },
  { path: '/settings', label: 'Settings', icon: Settings },
]

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="logo">BUILD<span class="logo-gold">TRACK</span></div>
      <div class="admin-badge">Admin Portal</div>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="nav-item--active"
      >
        <component :is="item.icon" :size="15" class="nav-icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ authStore.user?.full_name?.charAt(0) || 'A' }}</div>
        <div class="user-details">
          <div class="user-name">{{ authStore.user?.full_name || 'Admin' }}</div>
          <div class="user-role">Administrator</div>
        </div>
      </div>
      <button class="logout-btn" @click="logout" title="Logout">
        <LogOut :size="15" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 220px;
  background: #0D1829;
  border-right: 0.5px solid rgba(201,150,60,0.18);
  display: flex;
  flex-direction: column;
  z-index: 20;
  overflow: hidden;
}

.sidebar-top {
  padding: 22px 18px 16px;
  border-bottom: 0.5px solid rgba(201,150,60,0.1);
}

.logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #F2EDE4;
  line-height: 1;
}
.logo-gold { color: #C9963C; }

.admin-badge {
  margin-top: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(201,150,60,0.6);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 4px;
  color: rgba(242,237,228,0.5);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.15s;
  margin-bottom: 2px;
  position: relative;
}
.nav-item:hover {
  background: rgba(201,150,60,0.06);
  color: rgba(242,237,228,0.85);
}
.nav-item--active {
  background: rgba(201,150,60,0.1);
  color: #C9963C !important;
}
.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0; top: 4px; bottom: 4px;
  width: 2px;
  background: #C9963C;
  border-radius: 0 2px 2px 0;
}
.nav-icon { flex-shrink: 0; }

.sidebar-footer {
  padding: 12px 12px 14px;
  border-top: 0.5px solid rgba(201,150,60,0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-info { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
.user-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(201,150,60,0.2);
  color: #C9963C;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  flex-shrink: 0;
}
.user-details { min-width: 0; }
.user-name {
  font-size: 12px; font-weight: 500;
  color: rgba(242,237,228,0.8);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-role {
  font-size: 10px;
  color: rgba(242,237,228,0.3);
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.logout-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(242,237,228,0.3);
  padding: 6px;
  border-radius: 4px;
  display: flex;
  transition: all 0.15s;
  flex-shrink: 0;
}
.logout-btn:hover { color: #E05454; background: rgba(224,84,84,0.1); }
</style>
