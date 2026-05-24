<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Shield, ChevronDown, ChevronRight, Key } from 'lucide-vue-next'
import api from '@/lib/api'

interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
}

interface Role {
  id: string
  name: string
  description: string | null
  is_system: boolean
  permissions: Permission[]
}

const roles = ref<Role[]>([])
const loading = ref(true)
const error = ref('')
const expandedRoles = ref<Set<string>>(new Set())

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/v1/roles')
    roles.value = res.data.data || []
    if (roles.value.length > 0) {
      expandedRoles.value.add(roles.value[0].id)
    }
  } catch {
    error.value = 'Failed to load roles'
  } finally {
    loading.value = false
  }
}

function toggleRole(id: string) {
  if (expandedRoles.value.has(id)) {
    expandedRoles.value.delete(id)
  } else {
    expandedRoles.value.add(id)
  }
}

function groupPermissions(perms: Permission[]) {
  const groups: Record<string, Permission[]> = {}
  for (const p of perms) {
    if (!groups[p.resource]) groups[p.resource] = []
    groups[p.resource].push(p)
  }
  return groups
}

onMounted(load)
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-header-left">
        <Shield :size="18" class="header-icon" />
        <div>
          <h1 class="page-title">Roles and Permissions</h1>
          <p class="page-subtitle">System roles and their permission sets</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Loading roles...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <div v-else class="roles-list">
      <div
        v-for="role in roles"
        :key="role.id"
        class="role-card"
      >
        <button class="role-header" @click="toggleRole(role.id)">
          <div class="role-header-left">
            <component :is="expandedRoles.has(role.id) ? ChevronDown : ChevronRight" :size="14" class="chevron" />
            <span class="role-name">{{ role.name }}</span>
            <span class="system-badge" v-if="role.is_system">System</span>
          </div>
          <span class="perm-count">{{ role.permissions.length }} permissions</span>
        </button>

        <div v-if="role.description" class="role-desc">{{ role.description }}</div>

        <div v-if="expandedRoles.has(role.id)" class="permissions-section">
          <div
            v-for="(perms, resource) in groupPermissions(role.permissions)"
            :key="resource"
            class="resource-group"
          >
            <div class="resource-label">{{ resource }}</div>
            <div class="perms-grid">
              <div
                v-for="perm in perms"
                :key="perm.id"
                class="perm-chip"
              >
                <Key :size="10" class="perm-icon" />
                {{ perm.action }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper { padding: 28px 32px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.header-icon { color: #C9963C; }
.page-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #F2EDE4; }
.page-subtitle { font-size: 12px; color: rgba(242,237,228,0.4); margin-top: 2px; }
.loading-state, .error-state { text-align: center; padding: 40px; font-size: 13px; color: rgba(242,237,228,0.4); }
.roles-list { display: flex; flex-direction: column; gap: 10px; }

.role-card {
  background: rgba(255,255,255,0.02);
  border: 0.5px solid rgba(201,150,60,0.15);
  border-radius: 6px;
  overflow: hidden;
}

.role-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: none; border: none; cursor: pointer;
  transition: background 0.15s;
}
.role-header:hover { background: rgba(201,150,60,0.05); }
.role-header-left { display: flex; align-items: center; gap: 8px; }
.chevron { color: rgba(201,150,60,0.6); }
.role-name { font-size: 14px; font-weight: 500; color: #F2EDE4; font-family: 'JetBrains Mono', monospace; }
.system-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 6px; border-radius: 3px;
  background: rgba(201,150,60,0.12); color: rgba(201,150,60,0.8);
}
.perm-count { font-size: 11px; color: rgba(242,237,228,0.3); }

.role-desc {
  padding: 0 16px 12px 38px;
  font-size: 12px; color: rgba(242,237,228,0.4);
}

.permissions-section {
  border-top: 0.5px solid rgba(255,255,255,0.06);
  padding: 12px 16px 16px 16px;
  display: flex; flex-direction: column; gap: 10px;
}

.resource-group {}
.resource-label {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: rgba(201,150,60,0.6); margin-bottom: 6px;
}
.perms-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.perm-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 3px;
  background: rgba(255,255,255,0.04);
  border: 0.5px solid rgba(255,255,255,0.08);
  font-size: 11px; color: rgba(242,237,228,0.65);
}
.perm-icon { color: rgba(201,150,60,0.5); }
</style>
