<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Workflow, ChevronDown, ChevronRight, Plus, Pencil, Trash2, X, Save } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToasts } from '@/composables/useToasts'

const toasts = useToasts()

interface Stage {
  id: string
  name: string
  description: string | null
  order_index: number
  expected_duration_days: number | null
  requires_buyer_approval: boolean
}

interface Template {
  id: string
  name: string
  description: string | null
  is_system: boolean
  is_active: boolean
  project_type_id: string
  stages: Stage[]
}

interface ProjectType {
  id: string
  name: string
  description: string | null
  is_system?: boolean
  templates: Template[]
}

const projectTypes = ref<ProjectType[]>([])
const loading = ref(true)
const error = ref('')
const expandedTypes = ref<Set<string>>(new Set())
const expandedTemplates = ref<Set<string>>(new Set())

// Create project type
const showPtForm = ref(false)
const ptForm = ref({ name: '', description: '' })
const ptSaving = ref(false)

// Create template
const showTmplForm = ref<string | null>(null) // project_type_id
const tmplForm = ref({ name: '', description: '' })
const tmplSaving = ref(false)

// Edit template
const editTmpl = ref<Template | null>(null)
const editTmplForm = ref({ name: '', description: '' })
const editTmplSaving = ref(false)

// Delete
const deletingTemplate = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/v1/admin/project-types')
    projectTypes.value = (res as { data: ProjectType[] }).data || []
    if (projectTypes.value.length > 0) {
      expandedTypes.value.add(projectTypes.value[0].id)
    }
  } catch {
    error.value = 'Failed to load workflows'
  } finally {
    loading.value = false
  }
}

function toggleType(id: string) {
  expandedTypes.value.has(id) ? expandedTypes.value.delete(id) : expandedTypes.value.add(id)
}

function toggleTemplate(id: string) {
  expandedTemplates.value.has(id) ? expandedTemplates.value.delete(id) : expandedTemplates.value.add(id)
}

async function createProjectType() {
  if (!ptForm.value.name.trim()) return
  ptSaving.value = true
  try {
    await api.post('/v1/admin/project-types', { name: ptForm.value.name, description: ptForm.value.description || null })
    toasts.success('Project type created')
    ptForm.value = { name: '', description: '' }
    showPtForm.value = false
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    ptSaving.value = false
  }
}

async function deleteProjectType(id: string, name: string) {
  if (!confirm(`Delete project type "${name}"? This will remove all its templates.`)) return
  try {
    await api.delete(`/v1/admin/project-types/${id}`)
    toasts.success('Project type deleted')
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  }
}

function openCreateTemplate(ptId: string) {
  showTmplForm.value = ptId
  tmplForm.value = { name: '', description: '' }
}

async function createTemplate() {
  if (!tmplForm.value.name.trim() || !showTmplForm.value) return
  tmplSaving.value = true
  try {
    await api.post('/v1/admin/workflow-templates', {
      project_type_id: showTmplForm.value,
      name: tmplForm.value.name,
      description: tmplForm.value.description || null,
      stages: [],
      transitions: [],
    })
    toasts.success('Template created')
    tmplForm.value = { name: '', description: '' }
    showTmplForm.value = null
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    tmplSaving.value = false
  }
}

function openEditTemplate(tmpl: Template) {
  editTmpl.value = tmpl
  editTmplForm.value = { name: tmpl.name, description: tmpl.description || '' }
}

async function saveEditTemplate() {
  if (!editTmpl.value) return
  editTmplSaving.value = true
  try {
    await api.patch(`/v1/admin/workflow-templates/${editTmpl.value.id}`, {
      name: editTmplForm.value.name,
      description: editTmplForm.value.description || null,
    })
    toasts.success('Template updated')
    editTmpl.value = null
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    editTmplSaving.value = false
  }
}

async function deleteTemplate(tmplId: string, name: string) {
  if (!confirm(`Delete template "${name}"?`)) return
  deletingTemplate.value = tmplId
  try {
    await api.delete(`/v1/admin/workflow-templates/${tmplId}`)
    toasts.success('Template deleted')
    await load()
  } catch (e: unknown) {
    toasts.error('Failed', (e as { message?: string })?.message)
  } finally {
    deletingTemplate.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-header-left">
        <Workflow :size="18" class="header-icon" />
        <div>
          <h1 class="page-title">Workflow Templates</h1>
          <p class="page-subtitle">System project types and milestone workflows</p>
        </div>
      </div>
      <button class="add-btn" @click="showPtForm = !showPtForm">
        <Plus :size="13" /> New Project Type
      </button>
    </div>

    <!-- Create project type form -->
    <div v-if="showPtForm" class="inline-form mb-4">
      <h3 class="form-title">New Project Type</h3>
      <div class="form-row">
        <input v-model="ptForm.name" class="form-input" placeholder="Name (e.g. Residential)" />
        <input v-model="ptForm.description" class="form-input" placeholder="Description (optional)" />
        <button class="save-btn" :disabled="ptSaving" @click="createProjectType">
          <Save :size="12" /> {{ ptSaving ? 'Saving...' : 'Save' }}
        </button>
        <button class="cancel-btn" @click="showPtForm = false"><X :size="12" /></button>
      </div>
    </div>

    <!-- Edit template modal -->
    <div v-if="editTmpl" class="modal-overlay" @click.self="editTmpl = null">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Edit Template</h3>
          <button class="modal-close" @click="editTmpl = null"><X :size="14" /></button>
        </div>
        <div class="modal-body">
          <label class="field-label">Name</label>
          <input v-model="editTmplForm.name" class="form-input" />
          <label class="field-label mt-3">Description</label>
          <input v-model="editTmplForm.description" class="form-input" placeholder="Optional" />
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="editTmpl = null">Cancel</button>
          <button class="save-btn" :disabled="editTmplSaving" @click="saveEditTemplate">
            <Save :size="12" /> {{ editTmplSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Loading workflows...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <div v-else class="workflows-list">
      <div v-for="pt in projectTypes" :key="pt.id" class="project-type-card">
        <div class="type-header">
          <button class="type-toggle" @click="toggleType(pt.id)">
            <component :is="expandedTypes.has(pt.id) ? ChevronDown : ChevronRight" :size="14" class="chevron" />
            <span class="type-name">{{ pt.name }}</span>
            <span class="system-badge" v-if="pt.is_system">System</span>
          </button>
          <div class="type-actions">
            <span class="template-count">{{ pt.templates?.length || 0 }} template{{ (pt.templates?.length || 0) !== 1 ? 's' : '' }}</span>
            <button class="action-icon" title="Add template" @click="openCreateTemplate(pt.id)">
              <Plus :size="12" />
            </button>
            <button v-if="!pt.is_system" class="action-icon danger" title="Delete project type" @click="deleteProjectType(pt.id, pt.name)">
              <Trash2 :size="12" />
            </button>
          </div>
        </div>

        <!-- Inline create template form -->
        <div v-if="showTmplForm === pt.id" class="inline-form indent">
          <div class="form-row">
            <input v-model="tmplForm.name" class="form-input" placeholder="Template name" />
            <input v-model="tmplForm.description" class="form-input" placeholder="Description (optional)" />
            <button class="save-btn" :disabled="tmplSaving" @click="createTemplate">
              <Save :size="12" /> {{ tmplSaving ? '...' : 'Create' }}
            </button>
            <button class="cancel-btn" @click="showTmplForm = null"><X :size="12" /></button>
          </div>
        </div>

        <div v-if="expandedTypes.has(pt.id)" class="templates-list">
          <div v-if="!pt.templates || pt.templates.length === 0" class="empty-templates">
            No templates yet — click <Plus :size="10" class="inline-icon" /> to add one
          </div>
          <div v-for="tmpl in pt.templates" :key="tmpl.id" class="template-item">
            <div class="template-header">
              <button class="template-toggle" @click="toggleTemplate(tmpl.id)">
                <component :is="expandedTemplates.has(tmpl.id) ? ChevronDown : ChevronRight" :size="12" class="chevron" />
                <span class="template-name">{{ tmpl.name }}</span>
                <span :class="['status-badge', tmpl.is_active ? 'status-active' : 'status-inactive']">
                  {{ tmpl.is_active ? 'Active' : 'Inactive' }}
                </span>
              </button>
              <div class="template-actions">
                <span class="stage-count">{{ tmpl.stages?.length || 0 }} stages</span>
                <button class="action-icon" title="Edit template" @click="openEditTemplate(tmpl)">
                  <Pencil :size="11" />
                </button>
                <button
                  class="action-icon danger"
                  title="Delete template"
                  :disabled="deletingTemplate === tmpl.id"
                  @click="deleteTemplate(tmpl.id, tmpl.name)"
                >
                  <Trash2 :size="11" />
                </button>
              </div>
            </div>

            <div v-if="expandedTemplates.has(tmpl.id)" class="stages-list">
              <div v-if="!tmpl.stages || tmpl.stages.length === 0" class="empty-stages">No stages defined</div>
              <div v-for="stage in tmpl.stages" :key="stage.id" class="stage-row">
                <span class="stage-order">{{ stage.order_index }}</span>
                <div class="stage-info">
                  <span class="stage-name">{{ stage.name }}</span>
                  <span v-if="stage.description" class="stage-desc">{{ stage.description }}</span>
                </div>
                <span v-if="stage.requires_buyer_approval" class="approval-tag">approval</span>
                <span v-if="stage.expected_duration_days" class="stage-duration">{{ stage.expected_duration_days }}d</span>
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
.workflows-list { display: flex; flex-direction: column; gap: 10px; }

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
.inline-form.indent { margin: 0; border-top: 0.5px solid rgba(201,150,60,0.1); border-radius: 0; padding: 10px 16px 10px 32px; }
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
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 0.5px solid rgba(201,150,60,0.12); }
.modal-title { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: #F2EDE4; }
.modal-close { background: none; border: none; cursor: pointer; color: rgba(242,237,228,0.4); display: flex; }
.modal-body { padding: 18px; display: flex; flex-direction: column; gap: 4px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 18px; border-top: 0.5px solid rgba(255,255,255,0.05); }

/* Cards */
.project-type-card {
  background: rgba(255,255,255,0.02);
  border: 0.5px solid rgba(201,150,60,0.15);
  border-radius: 6px; overflow: hidden;
}

.type-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
}
.type-toggle {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer; flex: 1; text-align: left;
}
.type-actions { display: flex; align-items: center; gap: 6px; }
.chevron { color: rgba(201,150,60,0.6); flex-shrink: 0; }
.type-name { font-size: 14px; font-weight: 500; color: #F2EDE4; }
.system-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 6px; border-radius: 3px;
  background: rgba(201,150,60,0.12); color: rgba(201,150,60,0.8);
}
.template-count { font-size: 11px; color: rgba(242,237,228,0.3); margin-right: 4px; }

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

.templates-list { border-top: 0.5px solid rgba(201,150,60,0.1); }
.template-item { border-bottom: 0.5px solid rgba(255,255,255,0.04); }
.template-item:last-child { border-bottom: none; }
.empty-templates { padding: 10px 16px 10px 32px; font-size: 11px; color: rgba(242,237,228,0.25); display: flex; align-items: center; gap: 4px; }

.template-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 16px 9px 32px;
}
.template-toggle {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer; flex: 1; text-align: left;
}
.template-actions { display: flex; align-items: center; gap: 5px; }
.template-name { font-size: 13px; color: rgba(242,237,228,0.8); }
.status-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 5px; border-radius: 3px;
}
.status-active { background: rgba(34,197,94,0.12); color: rgba(34,197,94,0.8); }
.status-inactive { background: rgba(255,255,255,0.06); color: rgba(242,237,228,0.3); }
.stage-count { font-size: 11px; color: rgba(242,237,228,0.3); margin-right: 4px; }

.stages-list { background: rgba(0,0,0,0.15); padding: 4px 0; }
.empty-stages { padding: 8px 48px; font-size: 11px; color: rgba(242,237,228,0.25); }
.stage-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 7px 48px; border-bottom: 0.5px solid rgba(255,255,255,0.03);
}
.stage-row:last-child { border-bottom: none; }
.stage-order {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: rgba(201,150,60,0.6); width: 14px; flex-shrink: 0; padding-top: 1px;
}
.stage-info { flex: 1; }
.stage-name { font-size: 12px; color: rgba(242,237,228,0.75); display: block; }
.stage-desc { font-size: 11px; color: rgba(242,237,228,0.35); display: block; margin-top: 1px; }
.approval-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase;
  padding: 1px 5px; border-radius: 2px;
  border: 0.5px solid rgba(201,150,60,0.3); color: rgba(201,150,60,0.6); flex-shrink: 0;
}
.stage-duration {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: rgba(242,237,228,0.35); flex-shrink: 0;
}
</style>
