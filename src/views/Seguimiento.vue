<template>
  <div class="landing-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="@/assets/ninas_embarazadas_-09.webp" alt="Niña embarazada" class="hero-bg" loading="lazy" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Buscar por</p>
        <h1 class="hero-title">ID, nombre o escuela...</h1>
        <p class="hero-subtitle">Permite localizar casos por ID, nombre o centro educativo de forma rápida y segura.</p>
      </div>
    </section>

    <!-- ── STATS SECTION ── -->
    <section class="stats">
      <div class="stats-container">
        <div class="stats-grid">
          <div class="stat-card" v-for="card in statCards" :key="card.label">
            <div class="stat-icon-wrapper">
              <img :src="card.pink"  alt="Icon" class="stat-icon pink-icon" />
              <img :src="card.white" alt="Icon" class="stat-icon white-icon" />
            </div>
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SEARCH BAR ── -->
    <section class="search-bar-section">
      <div class="container-max">
        <div class="search-actions">
          <div class="search-pill">
            <input
              type="text"
              v-model="search"
              @keydown.enter="resetPage"
              placeholder="Buscar por ID, nombre o escuela..."
              class="pill-input"
            />
            <button class="pill-btn" @click="resetPage">Buscar</button>
          </div>
          <button class="btn btn-outline" @click="resetSearch">Actualizar</button>
          <button class="btn btn-primary">Nuevo Reporte</button>
        </div>
      </div>
    </section>

    <!-- ── TABLE ── -->
    <section class="table-section">
      <div class="container-max">
        <div class="table-header">
          <h2>Casos recientes</h2>
          <select v-model="filter" @change="resetPage">
            <option v-for="opt in FILTER_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Escuela</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(caso, i) in paginated" :key="caso.id" :class="i % 2 === 0 ? 'row-even' : 'row-odd'">
                <td>{{ caso.id }}</td>
                <td>{{ caso.nombre }}</td>
                <td>{{ caso.escuela }}</td>
                <td>
                  <span class="status-badge" :style="getStatusStyle(caso.estado)">{{ caso.estado }}</span>
                </td>
                <td><button class="action-btn">SEGUIMIENTO</button></td>
              </tr>
              <tr v-if="paginated.length === 0">
                <td colspan="5" class="empty-state">No se encontraron casos.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="page-size">
            <span>Items per page:</span>
            <select v-model="itemsPerPage" @change="resetPage">
              <option v-for="n in ITEMS_PER_PAGE_OPTIONS" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="page-controls">
            <span>{{ filtered.length > 0 ? `${startItem}-${endItem} of ${filtered.length}` : '0 of 0' }}</span>
            <div class="pag-buttons">
              <button @click="page = 1"                                      :disabled="page === 1"><v-icon size="16">mdi-chevron-double-left</v-icon></button>
              <button @click="page = Math.max(1, page - 1)"                  :disabled="page === 1"><v-icon size="16">mdi-chevron-left</v-icon></button>
              <button @click="page = Math.min(totalPages, page + 1)"         :disabled="page === totalPages || totalPages === 0"><v-icon size="16">mdi-chevron-right</v-icon></button>
              <button @click="page = totalPages"                             :disabled="page === totalPages || totalPages === 0"><v-icon size="16">mdi-chevron-double-right</v-icon></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useStatCards } from '@/composables/useStatCards'
import { usePagination } from '@/composables/usePagination'

const { statCards } = useStatCards()

// ── Constants ──────────────────────────────────────────
const CASOS = [
  { id: 'C-01A2B3', nombre: 'A. G.', escuela: 'Escuela Central',   estado: 'En seguimiento'    },
  { id: 'C-0F4D5E', nombre: 'M. R.', escuela: 'Esc. Las Flores',   estado: 'Aún estudiando'    },
  { id: 'C-6ZEY7K', nombre: 'J. P.', escuela: 'Esc. San José',     estado: 'Fuera del sistema' },
  { id: 'C-56H4Y1', nombre: 'L. S.', escuela: 'Inst. Básico',      estado: 'En seguimiento'    },
  { id: 'C-8J9KDL', nombre: 'E. V.', escuela: 'Colegio Nuevo',     estado: 'Aún estudiando'    },
  { id: 'C-1M2N30', nombre: 'D. Q.', escuela: 'Esc. Primaria',     estado: 'Fuera del sistema' },
  { id: 'C-4P5Q6R', nombre: 'F. H.', escuela: 'Inst. Técnico',     estado: 'Aún estudiando'    },
  { id: 'C-7S8T9U', nombre: 'G. B.', escuela: 'Esc. del Sol',      estado: 'En seguimiento'    },
  { id: 'C-2V3W4X', nombre: 'H. C.', escuela: 'Liceo Científico',  estado: 'Aún estudiando'    },
  { id: 'C-3Y4Z5A', nombre: 'I. K.', escuela: 'Esc. Modelo',       estado: 'Fuera del sistema' },
  { id: 'C-5B6C7D', nombre: 'L. M.', escuela: 'Esc. Nacional',     estado: 'En seguimiento'    },
  { id: 'C-8E9F0G', nombre: 'N. P.', escuela: 'Inst. Básico Sur',  estado: 'Aún estudiando'    },
  { id: 'C-1H2I3J', nombre: 'R. S.', escuela: 'Colegio Esperanza', estado: 'Fuera del sistema' },
  { id: 'C-4K5L6M', nombre: 'T. U.', escuela: 'Esc. Central',      estado: 'En seguimiento'    },
  { id: 'C-7N8O9P', nombre: 'V. W.', escuela: 'Liceo del Valle',   estado: 'Aún estudiando'    },
  { id: 'C-0Q1R2S', nombre: 'X. Y.', escuela: 'Esc. Aurora',       estado: 'En seguimiento'    },
  { id: 'C-3T4U5V', nombre: 'Z. A.', escuela: 'Inst. Técnico Sur', estado: 'Fuera del sistema' },
]

const STATUS_STYLES = {
  'En seguimiento':    { backgroundColor: '#ff9797', color: '#ffffff' },
  'Aún estudiando':    { backgroundColor: '#ffd6d6', color: '#c05050' },
  'Fuera del sistema': { backgroundColor: '#f0f0f0', color: '#888888' },
}

const FILTER_OPTIONS = ['Todos', 'En seguimiento', 'Aún estudiando', 'Fuera del sistema']

// ── State ──────────────────────────────────────────────
const search = ref('')
const filter = ref('Todos')

// ── Computed ───────────────────────────────────────────
const filtered = computed(() =>
  CASOS.filter(c => {
    const matchFilter = filter.value === 'Todos' || c.estado === filter.value
    const q = search.value.toLowerCase()
    return matchFilter && (!q || c.id.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q) || c.escuela.toLowerCase().includes(q))
  })
)

// ── Pagination (composable) ────────────────────────────
const {
  page, itemsPerPage, ITEMS_PER_PAGE_OPTIONS,
  totalPages, paginated, startItem, endItem, resetPage
} = usePagination(filtered)

// ── Methods ────────────────────────────────────────────
const getStatusStyle = (estado) => STATUS_STYLES[estado] || {}

function resetSearch() {
  search.value = ''
  filter.value = 'Todos'
  resetPage()
}
</script>

<style scoped>
.landing-page {
  background-color: var(--sigec-bg);
  color: var(--sigec-text);
  font-family: var(--sigec-font);
  min-height: 100vh;
}

/* STATS */
.stats { padding: 4rem 0 3rem; background-color: white; }
.stats-container { max-width: 75rem; margin: 0 auto; padding: 0 1.5rem; }

/* SEARCH BAR */
.container-max { max-width: 60rem; margin: 0 auto; padding: 0 1.5rem; }
.search-bar-section { padding-bottom: 2rem; background-color: var(--sigec-bg); }
.search-actions { display: flex; flex-wrap: wrap; align-items: stretch; gap: 1rem; }
.search-pill { display: flex; flex: 1; min-width: 300px; background-color: var(--sigec-bg-soft); border-radius: 9999px; overflow: hidden; }
.pill-input { flex: 1; background-color: transparent; border: none; padding: 0.875rem 1.5rem; font-size: 1rem; color: var(--sigec-text); outline: none; }
.pill-input::placeholder { color: #9e9e9e; }
.pill-btn { background-color: var(--sigec-primary); color: white; border: none; padding: 0 2.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
.pill-btn:hover { opacity: 0.9; }
.btn { display: flex; align-items: center; justify-content: center; padding: 0.875rem 2rem; border-radius: 9999px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; white-space: nowrap; }
.btn-primary { background-color: var(--sigec-primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-outline { background-color: transparent; border: 1px solid var(--sigec-primary); color: var(--sigec-primary); }
.btn-outline:hover { background-color: #fff0f0; }

/* TABLE */
.table-section { padding-bottom: 5rem; background-color: var(--sigec-bg); }
.table-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.table-header h2 { color: var(--sigec-text); font-size: 1rem; font-weight: 600; margin: 0; }
.table-header select { padding: 0.375rem 0.75rem; border-radius: 0.25rem; border: 1px solid #e0e0e0; font-size: 0.875rem; outline: none; color: var(--sigec-text); background-color: white; }
.table-wrapper { border-radius: 0.25rem; overflow-x: auto; border: 1px solid var(--sigec-border); }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
thead tr { background-color: #fafafa; border-bottom: 1px solid var(--sigec-border); }
th { padding: 1rem 1.5rem; font-weight: 600; color: var(--sigec-text-dark); font-size: 0.75rem; }
tbody tr { border-bottom: 1px solid var(--sigec-bg-muted); }
.row-even { background-color: var(--sigec-bg); }
.row-odd  { background-color: #fdfafa; }
td { padding: 1rem 1.5rem; color: var(--sigec-text); font-size: 0.75rem; vertical-align: middle; }
.status-badge { display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
.action-btn { color: var(--sigec-primary); font-weight: 600; background: none; border: none; font-size: 0.65rem; letter-spacing: 0.05em; cursor: pointer; transition: opacity 0.2s; }
.action-btn:hover { opacity: 0.7; }
.empty-state { text-align: center; padding: 2rem 1rem; color: var(--sigec-text-muted); }

/* PAGINATION */
.pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; margin-top: 1.5rem; gap: 1.5rem; }
.page-size { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--sigec-text); }
.page-size select { padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid #e0e0e0; font-size: 0.75rem; outline: none; color: var(--sigec-text); background-color: white; }
.page-controls { display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: var(--sigec-text); }
.pag-buttons { display: flex; align-items: center; gap: 0.25rem; }
.pag-buttons button { width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; border-radius: 0.25rem; background-color: transparent; border: none; color: var(--sigec-text); cursor: pointer; transition: all 0.2s; }
.pag-buttons button:hover:not(:disabled) { background-color: #f9fafb; }
.pag-buttons button:disabled { color: #d0d0d0; cursor: not-allowed; }
</style>