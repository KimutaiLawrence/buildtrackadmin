import { ref } from 'vue'
import { useToasts } from './useToasts'

export function useApi<T>() {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function execute(fn: () => Promise<T>, showError = true): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      const result = await fn()
      data.value = result
      return result
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || 'An error occurred'
      error.value = msg
      if (showError) toasts.error('Error', msg)
      return null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
