/**
 * usePagination — Composable
 * Lógica de paginación reutilizable para tablas de datos.
 *
 * @param {import('vue').ComputedRef<Array>} items - Lista filtrada de items
 * @param {number} defaultPerPage - Items por página por defecto
 */

import { ref, computed } from 'vue'

export function usePagination(items, defaultPerPage = 10) {
  const page         = ref(1)
  const itemsPerPage = ref(defaultPerPage)

  const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20]

  const totalPages = computed(() =>
    Math.ceil(items.value.length / itemsPerPage.value)
  )

  const paginated = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value
    return items.value.slice(start, start + itemsPerPage.value)
  })

  const startItem = computed(() =>
    items.value.length === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1
  )

  const endItem = computed(() =>
    Math.min(page.value * itemsPerPage.value, items.value.length)
  )

  function resetPage() {
    page.value = 1
  }

  return {
    page,
    itemsPerPage,
    ITEMS_PER_PAGE_OPTIONS,
    totalPages,
    paginated,
    startItem,
    endItem,
    resetPage
  }
}
