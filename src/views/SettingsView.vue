<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Save } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'
import { useAuthStore } from '@/stores/auth'
import BtButton from '@/components/ui/BtButton.vue'
import BtInput from '@/components/ui/BtInput.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const toasts = useToasts()
const authStore = useAuthStore()

// System settings
interface SystemSetting { key: string; value: string | null; description: string | null; updated_at: string }
const systemSettings = ref<SystemSetting[]>([])
const systemSettingEdits = ref<Record<string, string>>({})
const systemSettingsLoading = ref(false)
const systemSettingsSaving = ref(false)

async function loadSystemSettings() {
  systemSettingsLoading.value = true
  try {
    const res = await api.get('/v1/admin/system-settings')
    systemSettings.value = res.data?.data || []
    systemSettingEdits.value = {}
    systemSettings.value.forEach((s: SystemSetting) => {
      systemSettingEdits.value[s.key] = s.value ?? ''
    })
  } catch { /* ignore */ } finally {
    systemSettingsLoading.value = false
  }
}

async function saveSystemSetting(key: string) {
  systemSettingsSaving.value = true
  try {
    await api.put(`/v1/admin/system-settings/${key}`, { value: systemSettingEdits.value[key] || null })
    toasts.success(`Saved ${key}`)
    loadSystemSettings()
  } catch (e: unknown) {
    toasts.error('Failed to save', (e as { message?: string })?.message)
  } finally {
    systemSettingsSaving.value = false
  }
}

// IP allowlist
const ipList = ref<{ id: string; cidr: string; label: string }[]>([])
const newCidr = ref('')
const newCidrLabel = ref('')
const ipLoading = ref(false)
const deleteIp = ref<string | null>(null)
const deleteLoading = ref(false)

// Profile
const profileName = ref(authStore.user?.full_name || '')
const profileEmail = ref(authStore.user?.email || '')
const currentPassword = ref('')
const newPassword = ref('')
const profileLoading = ref(false)

interface IpListResponse { data: { data: { id: string; cidr: string; label: string }[] } }

onMounted(async () => {
  loadSystemSettings()
  try {
    const res = await api.get('/v1/admin/settings/ip-allowlist') as IpListResponse
    ipList.value = res.data?.data || []
  } catch {
    // IP allowlist endpoint may not exist yet — ignore
  }
})

async function addIp() {
  if (!newCidr.value) return
  ipLoading.value = true
  try {
    await api.post('/v1/admin/settings/ip-allowlist', { cidr: newCidr.value, label: newCidrLabel.value })
    toasts.success('IP range added')
    newCidr.value = ''
    newCidrLabel.value = ''
    const res = await api.get('/v1/admin/settings/ip-allowlist') as IpListResponse
    ipList.value = res.data?.data || []
  } catch (e: unknown) {
    toasts.error('Failed to add IP', (e as { message?: string })?.message)
  } finally {
    ipLoading.value = false
  }
}

async function removeIp() {
  if (!deleteIp.value) return
  deleteLoading.value = true
  try {
    await api.delete(`/v1/admin/settings/ip-allowlist/${deleteIp.value}`)
    ipList.value = ipList.value.filter(ip => ip.id !== deleteIp.value)
    toasts.success('IP range removed')
    deleteIp.value = null
  } catch (e: unknown) {
    toasts.error('Failed to remove IP', (e as { message?: string })?.message)
  } finally {
    deleteLoading.value = false
  }
}

async function saveProfile() {
  profileLoading.value = true
  try {
    await api.patch('/v1/admin/profile', {
      full_name: profileName.value,
      ...(currentPassword.value ? { current_password: currentPassword.value, new_password: newPassword.value } : {}),
    })
    toasts.success('Profile updated')
    currentPassword.value = ''
    newPassword.value = ''
  } catch (e: unknown) {
    toasts.error('Failed to update profile', (e as { message?: string })?.message)
  } finally {
    profileLoading.value = false
  }
}
</script>

<template>
  <div class="settings">
    <h1 class="view-title">Settings</h1>

    <!-- System Settings -->
    <div class="card system-settings-card">
      <div class="card-gold" />
      <div class="card-header"><h2 class="card-title">Platform System Settings</h2></div>
      <div class="card-body">
        <div v-if="systemSettingsLoading" class="loading-text">Loading...</div>
        <div v-else class="system-settings-list">
          <div v-for="setting in systemSettings" :key="setting.key" class="system-setting-row">
            <div class="setting-meta">
              <div class="setting-key">{{ setting.key }}</div>
              <div v-if="setting.description" class="setting-desc">{{ setting.description }}</div>
            </div>
            <div class="setting-edit">
              <input
                v-model="systemSettingEdits[setting.key]"
                class="setting-input"
                :placeholder="setting.value || 'null'"
              />
              <button class="save-btn" @click="saveSystemSetting(setting.key)" :disabled="systemSettingsSaving">
                <Save :size="12" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Profile section -->
      <div class="card">
        <div class="card-gold" />
        <div class="card-header"><h2 class="card-title">Admin Profile</h2></div>
        <div class="card-body">
          <BtInput label="Full Name" v-model="profileName" />
          <BtInput label="Email" type="email" v-model="profileEmail" :disabled="true" />
          <div class="divider" />
          <BtInput label="Current Password" type="password" v-model="currentPassword" placeholder="Enter to change password" />
          <BtInput label="New Password" type="password" v-model="newPassword" placeholder="Min 8 characters" />
          <BtButton :loading="profileLoading" @click="saveProfile">
            <Save :size="14" /> Save Profile
          </BtButton>
        </div>
      </div>

      <!-- IP Allowlist -->
      <div class="card">
        <div class="card-gold" />
        <div class="card-header"><h2 class="card-title">IP Allowlist</h2></div>
        <div class="card-body">
          <div class="ip-note">
            Restrict admin portal access to these IP ranges. Leave empty to allow all IPs.
          </div>
          <div class="ip-list" v-if="ipList.length > 0">
            <div v-for="ip in ipList" :key="ip.id" class="ip-item">
              <div class="ip-cidr">{{ ip.cidr }}</div>
              <div class="ip-label">{{ ip.label }}</div>
              <button class="ip-remove" @click="deleteIp = ip.id">
                <Trash2 :size="12" />
              </button>
            </div>
          </div>
          <div v-else class="ip-empty">No IP restrictions — all IPs allowed</div>
          <div class="divider" />
          <div class="add-ip-form">
            <BtInput label="CIDR Range" v-model="newCidr" placeholder="e.g. 192.168.1.0/24" />
            <BtInput label="Label (optional)" v-model="newCidrLabel" placeholder="e.g. Office" />
            <BtButton :loading="ipLoading" @click="addIp">
              <Plus :size="14" /> Add Range
            </BtButton>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="!!deleteIp" title="Remove IP Range"
      message="Remove this IP range from the allowlist?"
      confirm-label="Remove" :loading="deleteLoading"
      @confirm="removeIp" @cancel="deleteIp = null"
    />
  </div>
</template>

<style scoped>
.settings { display: flex; flex-direction: column; gap: 24px; }
.view-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #F2EDE4; margin-bottom: 4px; }
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }

.card { background: #0D1829; border: 0.5px solid rgba(201,150,60,0.18); border-radius: 6px; overflow: hidden; position: relative; }
.card-gold { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #C9963C, transparent); }
.card-header { padding: 16px 18px 12px; border-bottom: 0.5px solid rgba(201,150,60,0.1); }
.card-title { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; color: #F2EDE4; }
.card-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.divider { height: 0.5px; background: rgba(201,150,60,0.12); margin: 2px 0; }

.ip-note { font-size: 12px; color: rgba(242,237,228,0.4); }
.ip-list { display: flex; flex-direction: column; gap: 6px; }
.ip-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: rgba(242,237,228,0.03); border: 0.5px solid rgba(201,150,60,0.12); border-radius: 4px; }
.ip-cidr { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #C9963C; flex-shrink: 0; }
.ip-label { flex: 1; font-size: 12px; color: rgba(242,237,228,0.45); }
.ip-remove { background: none; border: none; cursor: pointer; color: rgba(224,84,84,0.4); display: flex; padding: 3px; border-radius: 3px; }
.ip-remove:hover { color: #E05454; background: rgba(224,84,84,0.1); }
.ip-empty { font-size: 12px; color: rgba(242,237,228,0.25); font-style: italic; }
.add-ip-form { display: flex; flex-direction: column; gap: 12px; }

.system-settings-card { margin: 0; }
.system-settings-list { display: flex; flex-direction: column; gap: 0; }
.system-setting-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 10px 0;
  border-bottom: 0.5px solid rgba(255,255,255,0.04);
}
.system-setting-row:last-child { border-bottom: none; }
.setting-meta { flex: 1; min-width: 0; }
.setting-key { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #C9963C; }
.setting-desc { font-size: 11px; color: rgba(242,237,228,0.35); margin-top: 2px; }
.setting-edit { display: flex; align-items: center; gap: 8px; }
.setting-input {
  width: 120px; padding: 5px 8px;
  background: rgba(255,255,255,0.03);
  border: 0.5px solid rgba(201,150,60,0.2);
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: #F2EDE4;
  outline: none;
}
.setting-input:focus { border-color: rgba(201,150,60,0.5); }
.save-btn {
  background: rgba(201,150,60,0.12); border: 0.5px solid rgba(201,150,60,0.3);
  border-radius: 3px; cursor: pointer; color: #C9963C;
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; transition: all 0.15s; flex-shrink: 0;
}
.save-btn:hover { background: rgba(201,150,60,0.22); }
.save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.loading-text { font-size: 12px; color: rgba(242,237,228,0.4); }
</style>
