import { useUiStore } from '@/stores/ui'

export function useToasts() {
  const ui = useUiStore()
  return {
    success: ui.success.bind(ui),
    error: ui.error.bind(ui),
    warning: ui.warning.bind(ui),
    info: ui.info.bind(ui),
  }
}
