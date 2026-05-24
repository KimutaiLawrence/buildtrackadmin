<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Workflow, ChevronDown, ChevronRight } from 'lucide-vue-next'
import api from '@/lib/api'

interface Stage {
  id: string
  name: string
  description: string | null
  order_index: number
  expected_duration_days: number | null
}

interface Template {
  id: string
  name: string
  description: string | null
  is_system: boolean
  is_active: boolean
  stages: Stage[]
}

interface ProjectType {
  id: string
  name: string
  description: string | null
  templates: Template[]
}

const projectTypes = ref<ProjectType[]>([])
const loading = ref(true)
const error = ref('')
const expandedTypes = ref<Set<string>>(new Set())
const expandedTemplates = ref<Set<string>>(new Set())

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/v1/project-types')
    projectTypes.value = res.data.data || []
    // Expand first type by default
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
  if (expandedTypes.value.has(id)) {
    expandedTypes.value.delete(id)
  } else {
    expandedTypes.value.add(id)
  }
}

function toggleTemplate(id: string) {
  if (expandedTemplates.value.has(id)) {
    expandedTemplates.value.delete(id)
  } else {
    expandedTemplates.value.add(id)
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
    </div>

    <div v-if="loading" class="loading-state">Loading workflows...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <div v-else class="workflows-list">
      <div
        v-for="pt in projectTypes"
        :key="pt.id"
        class="project-type-card"
      >
        <button class="type-header" @click="toggleType(pt.id)">
          <div class="type-header-left">
            <component :is="expandedTypes.has(pt.id) ? ChevronDown : ChevronRight" :size="14" class="chevron" />
            <span class="type-name">{{ pt.name }}</span>
            <span class="system-badge" v-if="pt.is_system">System</span>
          </div>
          <span class="template-count">{{ pt.templates.length }} template{{ pt.templates.length !== 1 ? 's' : '' }}</span>
        </button>

        <div v-if="expandedTypes.has(pt.id)" class="templates-list">
          <div
            v-for="tmpl in pt.templates"
            :key="tmpl.id"
            class="template-item"
          >
            <button class="template-header" @click="toggleTemplate(tmpl.id)">
              <div class="template-header-left">
                <component :is="expandedTemplates.has(tmpl.id) ? ChevronDown : ChevronRight" :size="12" class="chevron" />
                <span class="template-name">{{ tmpl.name }}</span>
                <span :class="['status-badge', tmpl.is_active ? 'status-active' : 'status-inactive']">
                  {{ tmpl.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <span class="stage-count">{{ tmpl.stages.length }} stages</span>
            </button>

            <div v-if="expandedTemplates.has(tmpl.id)" class="stages-list">
              <div
                v-for="stage in tmpl.stages"
                :key="stage.id"
                class="stage-row"
              >
                <span class="stage-order">{{ stage.order_index }}</span>
                <div class="stage-info">
                  <span class="stage-name">{{ stage.name }}</span>
                  <span v-if="stage.description" class="stage-desc">{{ stage.description }}</span>
                </div>
                <span v-if="stage.expected_duration_days" class="stage-duration">
                  {{ stage.expected_duration_days }}d
                </span>
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

.project-type-card {
  background: rgba(255,255,255,0.02);
  border: 0.5px solid rgba(201,150,60,0.15);
  border-radius: 6px;
  overflow: hidden;
}

.type-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: none; border: none; cursor: pointer;
  transition: background 0.15s;
}
.type-header:hover { background: rgba(201,150,60,0.05); }
.type-header-left { display: flex; align-items: center; gap: 8px; }
.chevron { color: rgba(201,150,60,0.6); }
.type-name { font-size: 14px; font-weight: 500; color: #F2EDE4; }
.system-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 6px; border-radius: 3px;
  background: rgba(201,150,60,0.12); color: rgba(201,150,60,0.8);
}
.template-count { font-size: 11px; color: rgba(242,237,228,0.3); }

.templates-list { border-top: 0.5px solid rgba(201,150,60,0.1); }
.template-item { border-bottom: 0.5px solid rgba(255,255,255,0.04); }
.template-item:last-child { border-bottom: none; }

.template-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px 10px 32px;
  background: none; border: none; cursor: pointer;
  transition: background 0.15s;
}
.template-header:hover { background: rgba(255,255,255,0.02); }
.template-header-left { display: flex; align-items: center; gap: 8px; }
.template-name { font-size: 13px; color: rgba(242,237,228,0.8); }
.status-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 5px; border-radius: 3px;
}
.status-active { background: rgba(34,197,94,0.12); color: rgba(34,197,94,0.8); }
.status-inactive { background: rgba(255,255,255,0.06); color: rgba(242,237,228,0.3); }
.stage-count { font-size: 11px; color: rgba(242,237,228,0.3); }

.stages-list { background: rgba(0,0,0,0.15); padding: 4px 0; }
.stage-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 8px 48px 8px 48px;
  border-bottom: 0.5px solid rgba(255,255,255,0.03);
}
.stage-row:last-child { border-bottom: none; }
.stage-order {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: rgba(201,150,60,0.6); width: 14px; flex-shrink: 0; padding-top: 1px;
}
.stage-info { flex: 1; }
.stage-name { font-size: 12px; color: rgba(242,237,228,0.75); display: block; }
.stage-desc { font-size: 11px; color: rgba(242,237,228,0.35); display: block; margin-top: 1px; }
.stage-duration {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: rgba(242,237,228,0.35); flex-shrink: 0;
}
</style>
