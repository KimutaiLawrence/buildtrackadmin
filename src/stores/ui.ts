import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const sidebarOpen = ref(true)

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    const t: Toast = { ...toast, id, duration: toast.duration ?? 4000 }
    toasts.value.push(t)
    if (t.duration && t.duration > 0) {
      setTimeout(() => removeToast(id), t.duration)
    }
    return id
  }

  function removeToast(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx > -1) toasts.value.splice(idx, 1)
  }

  function success(title: string, message?: string) {
    return addToast({ type: 'success', title, message })
  }

  function error(title: string, message?: string) {
    return addToast({ type: 'error', title, message })
  }

  function warning(title: string, message?: string) {
    return addToast({ type: 'warning', title, message })
  }

  function info(title: string, message?: string) {
    return addToast({ type: 'info', title, message })
  }

  return { toasts, sidebarOpen, addToast, removeToast, success, error, warning, info }
})
