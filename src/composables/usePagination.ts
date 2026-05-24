import { ref, computed } from 'vue'

export function usePagination(defaultLimit = 20) {
  const page = ref(1)
  const limit = ref(defaultLimit)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / limit.value))
  const offset = computed(() => (page.value - 1) * limit.value)

  function setPage(p: number) {
    page.value = Math.max(1, Math.min(p, totalPages.value || 1))
  }

  function nextPage() {
    if (page.value < totalPages.value) page.value++
  }

  function prevPage() {
    if (page.value > 1) page.value--
  }

  function reset() {
    page.value = 1
  }

  return { page, limit, total, totalPages, offset, setPage, nextPage, prevPage, reset }
}
