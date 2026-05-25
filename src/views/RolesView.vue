<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Shield, ChevronDown, ChevronRight, Key, Plus, Pencil, Trash2, X, Save } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'

const toasts = useToasts()

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
const allPermissions = ref<Permission[]>([])
const loading = ref(true)
const error = ref('')
const expandedRoles = ref<Set<string>>(new Set())

// Create role
const showCreateForm = ref(false)
const createForm = ref({ name: '', description: '' })
const creating = ref(false)

// Edit role
const editRole = ref<Role | null>(null)
const editForm = ref({ name: '', description: '' })
const editSaving = ref(false)

// Manage permissions
const permRole = ref<Role | null>(null)
const selectedPermIds = ref<Set<string>>(new Set())
const permSaving = ref(false)

// Delete
const deleting = ref<string | null>(null)

const permissionsByResource = computed(() => {
  const groups: Record<string, Permission[]> = {}
  for (const p of allPermissions.value) {
    if (!groups[p.resource]) groups[p.resource] = []
    groups[p.resource].push(p)
  }
  return groups
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [rolesRes, permsRes] = await Promise.all([
      api.get('/v1/roles'),
      api.get('/v1/roles/permissions'),
    ])
    roles.value = (rolesRes as { data: Role[] }).data || []
    allPermissions.value = (permsRes as { data: Permission[] }).data || []
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
  expandedRoles.value.has(id) ? expandedRoles.value.delete(id) : expandedRoles.value.add(id)
}

function groupPermissions(perms: Permission[]) {
  const groups: Record<string, Permission[]> = {}
  for (const p of perms) {
    if (!groups[p.resource]) groups[p.resource] = []
    groups[p.resource].push(p)
  }
  return groups
}

async function createRole() {
  if (!createForm.value.name.trim()) return
  creating.value = true
  try {
    await api.post('/v1/roles', {
      name: createForm.value.name,
      description: createForm.value.description || null,
      permission_ids: [],
    })
    toasts.success('Role created')
    createForm.value = { name: '', description: '' }
    showCreateForm.value = false
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    creating.value = false
  }
}

function openEdit(role: Role) {
  editRole.value = role
  editForm.value = { name: role.name, description: role.description || '' }
}

async function saveEdit() {
  if (!editRole.value) return
  editSaving.value = true
  try {
    await api.patch(`/v1/roles/${editRole.value.id}`, {
      name: editForm.value.name,
      description: editForm.value.description || null,
    })
    toasts.success('Role updated')
    editRole.value = null
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    editSaving.value = false
  }
}

async function deleteRole(role: Role) {
  if (!confirm(`Delete role "${role.name}"?`)) return
  deleting.value = role.id
  try {
    await api.delete(`/v1/roles/${role.id}`)
    toasts.success('Role deleted')
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    deleting.value = null
  }
}

function openPermissions(role: Role) {
  permRole.value = role
  selectedPermIds.value = new Set(role.permissions.map((p) => p.id))
}

function togglePerm(id: string) {
  if (selectedPermIds.value.has(id)) {
    selectedPermIds.value.delete(id)
  } else {
    selectedPermIds.value.add(id)
  }
}

async function savePermissions() {
  if (!permRole.value) return
  permSaving.value = true
  try {
    await api.put(`/v1/roles/${permRole.value.id}/permissions`, {
      permissions: Array.from(selectedPermIds.value),
    })
    toasts.success('Permissions updated')
    permRole.value = null
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    permSaving.value = false
  }
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
      <button class="add-btn" @click="showCreateForm = !showCreateForm">
        <Plus :size="13" /> New Role
      </button>
    </div>

    <!-- Create role form -->
    <div v-if="showCreateForm" class="inline-form mb-4">
      <h3 class="form-title">New Role</h3>
      <div class="form-row">
        <input v-model="createForm.name" class="form-input" placeholder="Role name" />
        <input v-model="createForm.description" class="form-input" placeholder="Description (optional)" />
        <button class="save-btn" :disabled="creating" @click="createRole">
          <Save :size="12" /> {{ creating ? 'Saving...' : 'Create' }}
        </button>
        <button class="cancel-btn" @click="showCreateForm = false"><X :size="12" /></button>
      </div>
    </div>

    <!-- Edit role modal -->
    <div v-if="editRole" class="modal-overlay" @click.self="editRole = null">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Edit Role</h3>
          <button class="modal-close" @click="editRole = null"><X :size="14" /></button>
        </div>
        <div class="modal-body">
          <label class="field-label">Name</label>
          <input v-model="editForm.name" class="form-input" />
          <label class="field-label mt-3">Description</label>
          <input v-model="editForm.description" class="form-input" placeholder="Optional" />
        </div>
        <div class="modal-footer">
          <button class="cancel-btn-text" @click="editRole = null">Cancel</button>
          <button class="save-btn" :disabled="editSaving" @click="saveEdit">
            <Save :size="12" /> {{ editSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Manage permissions modal -->
    <div v-if="permRole" class="modal-overlay" @click.self="permRole = null">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Permissions — {{ permRole.name }}</h3>
            <p class="modal-sub">{{ selectedPermIds.size }} selected</p>
          </div>
          <button class="modal-close" @click="permRole = null"><X :size="14" /></button>
        </div>
        <div class="modal-body perm-body">
          <div v-for="(perms, resource) in permissionsByResource" :key="resource" class="resource-group">
            <div class="resource-label">{{ resource }}</div>
            <div class="perms-grid">
              <label
                v-for="perm in perms"
                :key="perm.id"
                :class="['perm-chip', { selected: selectedPermIds.has(perm.id) }]"
              >
                <input type="checkbox" :checked="selectedPermIds.has(perm.id)" @change="togglePerm(perm.id)" class="perm-check" />
                <Key :size="9" class="perm-icon" />
                {{ perm.action }}
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn-text" @click="permRole = null">Cancel</button>
          <button class="save-btn" :disabled="permSaving" @click="savePermissions">
            <Save :size="12" /> {{ permSaving ? 'Saving...' : 'Save Permissions' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Loading roles...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <div v-else class="roles-list">
      <div v-for="role in roles" :key="role.id" class="role-card">
        <div class="role-header">
          <button class="role-toggle" @click="toggleRole(role.id)">
            <component :is="expandedRoles.has(role.id) ? ChevronDown : ChevronRight" :size="14" class="chevron" />
            <span class="role-name">{{ role.name }}</span>
            <span class="system-badge" v-if="role.is_system">System</span>
          </button>
          <div class="role-actions">
            <span class="perm-count">{{ role.permissions.length }} permissions</span>
            <button class="action-icon" title="Edit permissions" @click="openPermissions(role)">
              <Key :size="11" />
            </button>
            <button class="action-icon" title="Edit role" @click="openEdit(role)">
              <Pencil :size="11" />
            </button>
            <button
              v-if="!role.is_system"
              class="action-icon danger"
              title="Delete role"
              :disabled="deleting === role.id"
              @click="deleteRole(role)"
            >
              <Trash2 :size="11" />
            </button>
          </div>
        </div>

        <div v-if="role.description" class="role-desc">{{ role.description }}</div>

        <div v-if="expandedRoles.has(role.id)" class="permissions-section">
          <div v-if="role.permissions.length === 0" class="empty-perms">
            No permissions assigned — click <Key :size="10" class="inline-icon" /> to manage
          </div>
          <div
            v-for="(perms, resource) in groupPermissions(role.permissions)"
            :key="resource"
            class="resource-group"
          >
            <div class="resource-label">{{ resource }}</div>
            <div class="perms-grid">
              <div v-for="perm in perms" :key="perm.id" class="perm-chip">
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

.add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  background: rgba(201,150,60,0.12); border: 0.5px solid rgba(201,150,60,0.4);
  border-radius: 4px; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.08em; color: #C9963C;
  transition: all 0.15s;
}
.add-btn:hover { background: rgba(201,150,60,0.2); }

.inline-form {
  background: rgba(201,150,60,0.04);
  border: 0.5px solid rgba(201,150,60,0.2);
  border-radius: 6px; padding: 14px 16px;
}
.form-title { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(201,150,60,0.7); margin-bottom: 10px; }
.form-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.form-input {
  flex: 1; min-width: 120px; padding: 6px 10px;
  background: rgba(255,255,255,0.03); border: 0.5px solid rgba(201,150,60,0.25);
  border-radius: 3px; font-size: 12px; color: #F2EDE4; outline: none;
}
.form-input:focus { border-color: rgba(201,150,60,0.6); }
.field-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(201,150,60,0.6); margin-bottom: 4px; }
.mt-3 { margin-top: 12px; }

.save-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  background: rgba(201,150,60,0.15); border: 0.5px solid rgba(201,150,60,0.4);
  border-radius: 3px; cursor: pointer; color: #C9963C;
  font-size: 11px; transition: all 0.15s; flex-shrink: 0;
}
.save-btn:hover { background: rgba(201,150,60,0.25); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cancel-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: none; border: 0.5px solid rgba(255,255,255,0.1);
  border-radius: 3px; cursor: pointer; color: rgba(242,237,228,0.4);
  transition: all 0.15s; flex-shrink: 0;
}
.cancel-btn:hover { color: #F2EDE4; border-color: rgba(255,255,255,0.2); }
.cancel-btn-text {
  background: none; border: none; cursor: pointer;
  font-size: 12px; color: rgba(242,237,228,0.4); padding: 6px 10px;
}
.cancel-btn-text:hover { color: #F2EDE4; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  width: 420px; background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.25);
  border-radius: 8px; overflow: hidden;
}
.modal-wide { width: 560px; max-width: 90vw; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 0.5px solid rgba(201,150,60,0.12); }
.modal-title { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: #F2EDE4; }
.modal-sub { font-size: 11px; color: rgba(201,150,60,0.6); margin-top: 2px; }
.modal-close { background: none; border: none; cursor: pointer; color: rgba(242,237,228,0.4); display: flex; }
.modal-body { padding: 18px; display: flex; flex-direction: column; gap: 4px; }
.perm-body { gap: 14px; max-height: 420px; overflow-y: auto; }
.modal-footer { display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 14px 18px; border-top: 0.5px solid rgba(255,255,255,0.05); }

/* Role cards */
.role-card {
  background: rgba(255,255,255,0.02);
  border: 0.5px solid rgba(201,150,60,0.15);
  border-radius: 6px; overflow: hidden;
}

.role-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
}
.role-toggle {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer; flex: 1; text-align: left;
}
.role-actions { display: flex; align-items: center; gap: 6px; }
.chevron { color: rgba(201,150,60,0.6); }
.role-name { font-size: 14px; font-weight: 500; color: #F2EDE4; font-family: 'JetBrains Mono', monospace; }
.system-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 6px; border-radius: 3px;
  background: rgba(201,150,60,0.12); color: rgba(201,150,60,0.8);
}
.perm-count { font-size: 11px; color: rgba(242,237,228,0.3); margin-right: 4px; }

.action-icon {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 3px;
  background: none; border: 0.5px solid rgba(255,255,255,0.08);
  cursor: pointer; color: rgba(242,237,228,0.4); transition: all 0.15s;
}
.action-icon:hover { color: #C9963C; border-color: rgba(201,150,60,0.4); background: rgba(201,150,60,0.08); }
.action-icon.danger:hover { color: #E05454; border-color: rgba(224,84,84,0.4); background: rgba(224,84,84,0.08); }
.action-icon:disabled { opacity: 0.4; cursor: not-allowed; }
.inline-icon { display: inline; vertical-align: middle; }

.role-desc {
  padding: 0 16px 12px 38px;
  font-size: 12px; color: rgba(242,237,228,0.4);
}

.permissions-section {
  border-top: 0.5px solid rgba(255,255,255,0.06);
  padding: 12px 16px 16px 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.empty-perms { font-size: 11px; color: rgba(242,237,228,0.25); display: flex; align-items: center; gap: 4px; }

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
  cursor: default;
}
label.perm-chip {
  cursor: pointer; transition: all 0.12s; user-select: none;
}
label.perm-chip:hover { border-color: rgba(201,150,60,0.4); color: #F2EDE4; }
label.perm-chip.selected { background: rgba(201,150,60,0.12); border-color: rgba(201,150,60,0.4); color: #C9963C; }
.perm-icon { color: rgba(201,150,60,0.5); }
.perm-check { display: none; }
</style>
