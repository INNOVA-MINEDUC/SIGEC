<template>
  <div class="landing-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="/imgs/img4.jpg" alt="Niña embarazada" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Buscar por</p>
        <h1 class="hero-title">ID, nombre o escuela...</h1>
        <p class="hero-subtitle">Permite localizar casos por ID, nombre o centro educativo de forma rápida y segura.</p>
      </div>
    </section>

    <!-- ── STATS SECTION ── -->
    <!-- <section class="stats">
      <div class="stats-container">
        <div class="stats-grid">
          <div class="stat-card" v-for="card in statCards" :key="card.label">
            <div class="stat-icon-wrapper">
              <img :src="card.pink" alt="Icon" class="stat-icon pink-icon" />
              <img :src="card.white" alt="Icon" class="stat-icon white-icon" />
            </div>
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- ── INDICADORES NACIONALES ── -->
<section class="indicadores">
  <div class="section-shell">

    <div class="sec-grid">
      <div class="sec-item">
        <span class="sec-val">{{ displayKpis.estudiantes.toLocaleString('es-GT') }}</span>
        <span class="sec-label">Casos totales</span>
        <span class="sec-module">Número total de casos reportados en el Ministerio de salud pública y asistencia social (MSPAS) que requieren verificación dentro del sistema de registros educativos.</span>
      </div>

      <div class="sec-item">
        <span class="sec-val">{{ displayKpis.mayoresOSinRegistro.toLocaleString('es-GT') }}</span>
        <span class="sec-label">Casos mayores de 14 años o sin registro</span>
        <span class="sec-module">Cantidad de casos correspondientes a niñas mayores de 14 años o que no presentan registro dentro del sistema de registros educativos.</span>
      </div>

      <div class="sec-item">
        <span class="sec-val">{{ displayKpis.verificadosSire.toLocaleString('es-GT') }}</span>
        <span class="sec-label">Verificados en el SIRE</span>
        <span class="sec-module">Cantidad de casos cuya información ha sido validada y confirmada en el sistema de registros educativos (SIRE).</span>
      </div>

      <div class="sec-item">
        <span class="sec-val sec-val--money">{{ displayKpis.sinVerificarSire.toLocaleString('es-GT') }}</span>
        <span class="sec-label">Sin verificar en el SIRE</span>
        <span class="sec-module">Cantidad de casos que aún no han sido localizados o validados dentro del sistema de registros educativos.</span>
      </div>

      <div class="sec-item">
        <span class="sec-val sec-val--money">{{ displayKpis.verificadosQuejas.toLocaleString('es-GT') }}</span>
        <span class="sec-label">Verificados en el sistema de quejas, comentarios o sugerencias</span>
        <span class="sec-module">Cantidad de casos ingresados dentro del sistema de quejas, comentarios o sugerencias.</span>
      </div>

      <div class="sec-item">
        <span class="sec-val sec-val--money">{{ displayKpis.sinQuejas.toLocaleString('es-GT') }}</span>
        <span class="sec-label">Sin quejas</span>
        <span class="sec-module">Cantidad de casos que, a la fecha de consulta, no cuentan con un registro en el sistema de quejas, comentarios o sugerencias.</span>
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
              @keydown.enter="handleSearch"
              @input="onSearchInput"
              placeholder="Buscar por nombre, queja, CUI o código personal..."
              class="pill-input"
            />
            <button class="pill-btn" @click="handleSearch">Buscar</button>
          </div>
          <!-- <button class="btn btn-outline" @click="resetSearch">Importar EXCEL</button>
          <button class="btn btn-primary">Importar PDF</button> -->
        </div>
      </div>
    </section>

    <!-- ── TABLE ── -->
    <section class="table-section">
      <div class="container-max">
        <div class="table-header">
          <h2>Casos recientes</h2>

          <!-- Grupo de filtros -->
          <div class="filters-wrapper">

            <v-checkbox
              v-model="soloSinQueja"
              label="Solo sin queja"
              color="primary"
              density="compact"
              hide-details
              class="queja-check"
              @update:modelValue="handleFilter"
            />

            <v-select
              v-model="selectedDepartamental"
              :items="departamentales"
              item-title="nombre"
              item-value="id"
              label="Dirección Departamental"
              prepend-inner-icon="mdi-map-marker"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              class="filter-select"
              @update:modelValue="handleFilter"
            />

            <v-select
              v-model="selectedEstado"
              :items="estadoOptions"
              label="Estado"
              prepend-inner-icon="mdi-clipboard-check"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              class="filter-select"
              @update:modelValue="handleFilter"
            />

            <v-btn
              color="primary"
              variant="tonal"
              rounded="xl"
              prepend-icon="mdi-filter-remove"
              class="clear-filter-btn"
              @click="limpiarFiltros"
            >
              Limpiar filtros
            </v-btn>

          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>CUI</th>
                <th>Código Personal</th>
                <th>Numero de Queja</th>
                <th>Estado Actual dentro del Sistema Educativo</th>
                <th>Estado del Caso</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(caso, i) in paginated"
                :key="caso.id"
                :class="i % 2 === 0 ? 'row-even' : 'row-odd'"
              >
                <td>
                  {{ caso.numero_caso || 'Sin caso' }}
                </td>

                <td>
                  {{ caso.nina?.nombre_completo || 'Sin nombre' }}
                </td>

                <td>
                  {{ caso.nina?.cui || 'Sin CUI' }}
                </td>

                <td>
                  {{ caso.nina?.historialEducativo?.[0]?.codigo_personal || 'Sin código' }}
                </td>

                <td>
                  <div class="queja-container">
                    <div class="queja-dot" :style="getQuejaStyle(caso)"></div>
                    <span class="queja-text">
                      {{ tieneQueja(caso) ? caso.queja : 'Sin queja' }}
                    </span>
                  </div>
                </td>

                <td>
                  {{ caso.nina?.historialEducativo?.[0]?.status_actual || 'Sin registro' }}
                </td>

                <td>
                  <span class="status-badge" :style="getStatusStyle(caso.estado)">
                    {{ caso.estado || 'Sin estado' }}
                  </span>
                </td>

                <td>
                  <button class="action-btn" @click="irAQueja(caso)">SEGUIMIENTO</button>
                </td>
              </tr>

              <tr v-if="paginated.length === 0">
                <td colspan="8" class="empty-state">No se encontraron casos.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="page-size">
            <span>Casos por Página:</span>
            <select v-model="itemsPerPage" @change="handlePageSizeChange">
              <option v-for="n in ITEMS_PER_PAGE_OPTIONS" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div class="page-controls">
            <span>{{ serverTotal > 0 ? `${startItem}-${endItem} de ${serverTotal}` : '0 de 0' }}</span>
            <div class="pag-buttons">
              <button @click="goToPage(1)" :disabled="serverPage === 1 || loading">
                <v-icon size="16">mdi-chevron-double-left</v-icon>
              </button>
              <button @click="goToPage(serverPage - 1)" :disabled="serverPage === 1 || loading">
                <v-icon size="16">mdi-chevron-left</v-icon>
              </button>
              <button @click="goToPage(serverPage + 1)" :disabled="serverPage >= serverTotalPages || loading">
                <v-icon size="16">mdi-chevron-right</v-icon>
              </button>
              <button @click="goToPage(serverTotalPages)" :disabled="serverPage >= serverTotalPages || loading">
                <v-icon size="16">mdi-chevron-double-right</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/helpers/api'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

// ── Datos paginados del servidor ───────────────────────────────────────────────
const casos           = ref([])
const departamentales = ref([])

const serverTotal      = ref(0)
const serverPage       = ref(1)
const serverTotalPages = ref(1)
const serverStats      = ref({})

// ── Filtros y UI ────────────────────────────────────────────────────────────────
const search                = ref('')
const selectedDepartamental = ref(null)
const selectedEstado        = ref('Todos')
const soloSinQueja          = ref(false)
const itemsPerPage          = ref(10)
const loading               = ref(false)

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20]

const ESTADOS_CASO = [
  'Verificados en el SIRE',
  'sin Verificar en el SIRE',
  'Verificados en el Sistema de Quejas, Comentarios o Sugerencias',
  'sin Quejas',
]

// ── Helpers de estilo ──────────────────────────────────────────────────────────
const normalizeText = (v) =>
  String(v ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

const STATUS_STYLES = {
  'verificados en el sire':          { backgroundColor: '#10233f', color: '#fff' },
  'sin verificar en el sire':        { backgroundColor: '#6d6d6d', color: '#fff' },
  'verificados en el sistema de quejas, comentarios o sugerencias': { backgroundColor: '#1F3864', color: '#fff' },
  'sin quejas':                      { backgroundColor: '#b0b0b0', color: '#fff' },
}

const getStatusStyle = (estado) =>
  STATUS_STYLES[normalizeText(estado)] || { backgroundColor: '#f0f0f0', color: '#6d6d6d' }

const tieneQueja    = (caso) => !!(caso.queja && String(caso.queja).trim() !== '')
const getQuejaStyle = (caso) => ({
  backgroundColor: tieneQueja(caso) ? '#10233f' : '#fff',
  border:          tieneQueja(caso) ? 'none'    : '2px solid #10233f',
})

// ── Carga unificada: filtros + búsqueda + paginación en el servidor ────────────
const fetchCasos = async (targetPage = 1) => {
  loading.value = true
  try {
    const { data } = await api.post('/caso', {
      departamental_id: selectedDepartamental.value || null,
      estado:           selectedEstado.value !== 'Todos' ? selectedEstado.value : null,
      sinQueja:         soloSinQueja.value,
      busqueda:         search.value.trim() || null,
      page:             targetPage,
      limit:            itemsPerPage.value,
    })
    casos.value            = Array.isArray(data.data) ? data.data : []
    serverTotal.value      = data.total      ?? 0
    serverPage.value       = data.page       ?? targetPage
    serverTotalPages.value = data.totalPages ?? 1
    serverStats.value      = data.stats      ?? {}
  } catch (e) {
    console.error('Error cargando casos:', e)
    casos.value = []
    serverTotal.value = 0; serverTotalPages.value = 1
  } finally {
    loading.value = false
  }
}

const cargarDepartamentales = async () => {
  try {
    const { data } = await api.get('/dept/departamentales')
    departamentales.value = Array.isArray(data.data) ? data.data : []
  } catch (e) {
    console.error('Error cargando departamentales:', e)
    departamentales.value = []
  }
}

onMounted(() => Promise.all([cargarDepartamentales(), fetchCasos(1)]))

// ── KPIs — vienen del servidor, no de los 10 registros de la página ───────────
const displayKpis = computed(() => ({
  estudiantes:         serverTotal.value,
  mayoresOSinRegistro: serverStats.value.mayoresOSinRegistro ?? 0,
  verificadosSire:     serverStats.value['Verificados en el SIRE'] ?? 0,
  sinVerificarSire:    serverStats.value['sin Verificar en el SIRE'] ?? 0,
  verificadosQuejas:   serverStats.value['Verificados en el Sistema de Quejas, Comentarios o Sugerencias'] ?? 0,
  sinQuejas:           serverStats.value['sin Quejas'] ?? 0,
}))

// ── La tabla renderiza exactamente lo que devuelve el servidor ─────────────────
const paginated = computed(() => casos.value)

const startItem = computed(() =>
  serverTotal.value === 0 ? 0 : (serverPage.value - 1) * itemsPerPage.value + 1
)
const endItem = computed(() =>
  Math.min(serverPage.value * itemsPerPage.value, serverTotal.value)
)

const estadoOptions = computed(() => ['Todos', ...ESTADOS_CASO])

// ── Manejadores ───────────────────────────────────────────────────────────────
const handleSearch       = () => fetchCasos(1)
const handleFilter       = () => fetchCasos(1)
const goToPage           = (p) => fetchCasos(Math.max(1, Math.min(p, serverTotalPages.value)))
const handlePageSizeChange = () => fetchCasos(1)

// Cuando el campo queda vacío se recarga sin filtro de búsqueda automáticamente
const onSearchInput = () => { if (search.value === '') fetchCasos(1) }

const limpiarFiltros = () => {
  search.value = ''; selectedDepartamental.value = null
  selectedEstado.value = 'Todos'; soloSinQueja.value = false
  fetchCasos(1)
}

const irAQueja = (caso) => router.push({ path: '/complains', query: { caso_id: caso.id } })
</script>

<style scoped>



/* ==========================
   INDICADORES SECUNDARIOS
========================== */

.indicadores{
  width: 100vw;
  margin-bottom: 20px;
}

@keyframes secEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sec-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  background: #10233f;
}

/* Laptop */
@media (max-width: 1400px) {
  .sec-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Tablet */
@media (max-width: 992px) {
  .sec-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Celular */
@media (max-width: 576px) {
  .sec-grid {
    grid-template-columns: 1fr;
  }
}

.sec-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 16px 24px;
  border-right: 1px solid rgba(255, 255, 255, .08);
  animation: secEnter .4s ease both;
  transition: background .22s ease;
}

.sec-item:hover {
  background: rgba(23, 196, 232, .07);
}

.sec-item:last-child {
  border-right: none;
}

.sec-item:nth-child(1) { animation-delay: .35s; }
.sec-item:nth-child(2) { animation-delay: .42s; }
.sec-item:nth-child(3) { animation-delay: .49s; }
.sec-item:nth-child(4) { animation-delay: .56s; }
.sec-item:nth-child(5) { animation-delay: .63s; }

.sec-val {
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 900;
  color: #17c4e8;
  line-height: 1;
  margin-bottom: 7px;
}

.sec-val--money {
  font-size: clamp(16px, 1.6vw, 22px);
}

.sec-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, .9);
  line-height: 1.35;
  margin-bottom: 4px;
}

.sec-module {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: .09em;
  color: rgba(255, 255, 255, .35);
  margin-top: 2px;
}

/* ==========================
   DISTRIBUCIÓN POR SEXO
========================== */

.sex-bars {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  margin-bottom: 6px;
}

.sex-bar-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.sex-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sex-dot--m { background: #17c4e8; }
.sex-dot--f { background: #f472b6; }

.sex-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, .12);
  border-radius: 2px;
  overflow: hidden;
}

.sex-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width .9s ease;
}

.sex-bar-fill--m { background: #17c4e8; }
.sex-bar-fill--f { background: #f472b6; }

.sex-pct {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  min-width: 28px;
  text-align: right;
  flex-shrink: 0;
}

.sex-name {
  font-size: 10px;
  color: rgba(255, 255, 255, .55);
  min-width: 40px;
  flex-shrink: 0;
}

/* ==========================
   RESPONSIVE
========================== */

@media (max-width: 1200px) {

  .sec-item:nth-child(3) {
    border-right: none;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }


  .sec-item:nth-child(2),
  .sec-item:nth-child(4) {
    border-right: none;
  }

  .sec-item:nth-child(3) {
    border-right: 1px solid rgba(255,255,255,.08);
  }

  .sec-item:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    border-right: none;
  }
}

@media (max-width: 640px) {
  .kpi-grid,

  .kpi-divider-label {
    font-size: 9px;
  }

  .sec-item {
    padding: 18px 12px 16px;
  }
}

.queja-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.queja-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0,0,0,.04);
}

.queja-text {
  font-size: .75rem;
  font-weight: 500;
  color: #6d6d6d;
}

.clear-filter-btn {
  height: 56px;
  padding-inline: 20px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  transition: .2s;
}

.clear-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255,151,151,.20);
}

@media (max-width: 768px) {
  .clear-filter-btn {
    width: 100%;
  }
}

.landing-page {
  background-color: #ffffff;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

/* HERO */
.hero { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(16, 35, 63, 0) 0%,
    rgba(16, 35, 63, 0.2) 40%,
    rgba(16, 35, 63, 0.95) 100%
);
}
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 3.5rem;
  padding-inline: 1.5rem;
  text-align: center;
}
.hero-top-text { color: white; font-size: 32px; font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: -0.25rem; line-height: 1.1; }
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; max-width: 900px; margin-bottom: 0; }
.hero-subtitle { margin-top: 1rem; color: white; font-size: 1.125rem; font-weight: 500; text-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 700px; }

/* STATS */
.stats { padding: 4rem 0 3rem; background-color: white; }
.stats-container { max-width: 75rem; margin: 0 auto; padding: 0 1.5rem; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 2rem; } }
.stat-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem 1.5rem; border-radius: 1.25rem; cursor: pointer;
  transition: all 0.2s ease-in-out; background-color: #f8f8f8;
}
.stat-card:hover { background-color: #ff9797; transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(255,151,151,0.4); }
.stat-icon-wrapper { margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; }
.stat-icon { width: 4.5rem; height: 4.5rem; object-fit: contain; }
.stat-card .white-icon       { display: none; }
.stat-card:hover .pink-icon  { display: none; }
.stat-card:hover .white-icon { display: block; }
.stat-label { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center; color: #1a1a1a; transition: color 0.2s; }
.stat-card:hover .stat-label { color: #ffffff; }
.stat-value { color: #ff9797; font-size: 48px; font-weight: 800; line-height: 1; transition: color 0.2s; }
.stat-card:hover .stat-value { color: #ffffff; }

/* SEARCH BAR */
.container-max { max-width: 70rem; margin: 0 auto; padding: 0 1.5rem; }
.search-bar-section { padding-bottom: 2rem; background-color: #ffffff; }
.search-actions { display: flex; flex-wrap: wrap; align-items: stretch; gap: 1rem; }
.search-pill { display: flex; flex: 1; min-width: 300px; background-color: #f8f8f8; border-radius: 9999px; overflow: hidden; }
.pill-input { flex: 1; background-color: #81848b; border: none; padding: 0.875rem 1.5rem; font-size: 1rem; color: #fff; outline: none; }
.pill-input::placeholder { color: #fff; }
.pill-btn { background-color: #10233f; color: white; border: none; padding: 0 2.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
.pill-btn:hover { opacity: 0.9; }
.btn { display: flex; align-items: center; justify-content: center; padding: 0.875rem 2rem; border-radius: 9999px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; white-space: nowrap; }
.btn-primary { background-color: #ff9797; color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-outline { background-color: transparent; border: 1px solid #ff9797; color: #ff9797; }
.btn-outline:hover { background-color: #fff0f0; }

/* TABLE */
.table-section { padding-bottom: 5rem; background-color: #ffffff; }
.table-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
.table-header h2 { color: #6d6d6d; font-size: 1rem; font-weight: 600; margin: 0; }
.table-header select { padding: 0.375rem 0.75rem; border-radius: 0.25rem; border: 1px solid #e0e0e0; font-size: 0.875rem; outline: none; color: #6d6d6d; background-color: white; text-transform: capitalize; }
.table-wrapper { border-radius: 0.25rem; overflow-x: auto; border: 1px solid #f0f0f0; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
thead tr { background-color: #fafafa; border-bottom: 1px solid #f0f0f0; }
th { padding: 1rem 1.5rem; font-weight: 600; color: #1a1a1a; font-size: 0.75rem; }
tbody tr { border-bottom: 1px solid #f5f5f5; }
.row-even { background-color: #ffffff; }
.row-odd  { background-color: #fdfafa; }
td { padding: 1rem 1.5rem; color: #6d6d6d; font-size: 0.75rem; vertical-align: middle; }
.status-badge { display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: .5rem; font-weight: 500; text-transform: uppercase; }
.action-btn { color: #10233f; font-weight: 600; background: none; border: none; font-size: 0.65rem; letter-spacing: 0.05em; cursor: pointer; transition: opacity 0.2s; }
.action-btn:hover { opacity: 0.7; }
.empty-state { text-align: center; padding: 2rem 1rem; color: #b0b0b0; }

/* PAGINATION */
.pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; margin-top: 1.5rem; gap: 1.5rem; }
.page-size { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #6d6d6d; }
.page-size select { padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid #e0e0e0; font-size: 0.75rem; outline: none; color: #6d6d6d; background-color: white; }
.page-controls { display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: #6d6d6d; }
.pag-buttons { display: flex; align-items: center; gap: 0.25rem; }
.pag-buttons button { width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; border-radius: 0.25rem; background-color: transparent; border: none; color: #6d6d6d; cursor: pointer; transition: all 0.2s; }
.pag-buttons button:hover:not(:disabled) { background-color: #f9fafb; }
.pag-buttons button:disabled { color: #d0d0d0; cursor: not-allowed; }

.filters-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  width: 220px;
  min-width: 220px;
}

.queja-check {
  background: #fafafa;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 12px;
  border: 1px solid #efefef;
  height: 56px;
  display: flex;
  align-items: center;
}

:deep(.v-field) {
  border-radius: 14px !important;
  box-shadow: 0 2px 10px rgba(0,0,0,.03);
}

:deep(.v-field:hover) {
  box-shadow: 0 6px 18px rgba(255,151,151,.12);
}

@media (max-width: 768px) {
  .filter-select {
    width: 100%;
    min-width: 100%;
  }

  .filters-wrapper {
    width: 100%;
  }
}
</style>