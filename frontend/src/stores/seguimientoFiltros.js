import { defineStore } from 'pinia'

// Filtros de la tabla de Seguimiento.
//
// Se guardan en un store persistido (localStorage vía pinia-plugin-persistedstate)
// para que NO se pierdan al desmontar la vista: al registrar un caso y volver a
// Seguimiento, los filtros y la página siguen aplicados.
//
// Es un store aparte de FiltroStore (que usa el dashboard/mapa) para no mezclar
// responsabilidades ni afectar ese flujo.
export const useSeguimientoFiltros = defineStore('seguimientoFiltros', {
  state: () => ({
    search:                '',
    selectedDepartamental: null,
    selectedEstado:        'Todos',
    filtroQueja:           'Todos',   // 'Todos' | 'con' | 'sin'
    filtroCui:             'Todos',   // 'Todos' | 'con' | 'sin'
    itemsPerPage:          10,
    page:                  1,
  }),

  actions: {
    // Restablece solo los filtros (no el tamaño de página) y vuelve a la 1.
    reset() {
      this.search                = ''
      this.selectedDepartamental = null
      this.selectedEstado        = 'Todos'
      this.filtroQueja           = 'Todos'
      this.filtroCui             = 'Todos'
      this.page                  = 1
    },
  },

  persist: true,
})
