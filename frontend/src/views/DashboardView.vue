<template>
  <div class="dashboard-page">
    <AppNavbar />

    <section class="hero-dash">
      <img :src="heroImage" alt="Corredor de escuela" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Visualiza el panorama nacional</p>
        <h1 class="hero-title">en nuestro dashboard</h1>
        <p class="hero-subtitle">
          Panel de control que centraliza información clave, indicadores y estado de los casos,<br/>
          facilitando el seguimiento y la gestión eficiente del sistema.
        </p>
      </div>
    </section>

    <section class="py-6 bg-white border-bottom">
      <div class="container-max">
        <div class="card-box filters-card">
          <div class="filters-header">
            <div class="filters-title">
              <span class="icon-filter">🔍</span>
              <span>Filtrar Información</span>
            </div>
            <button @click="showAdvanced = !showAdvanced" class="btn-toggle">
              {{ showAdvanced ? 'Ocultar Filtros Avanzados' : 'Más Filtros' }}
              <span class="arrow" :class="{ open: showAdvanced }">▼</span>
            </button>
          </div>

          <div class="filters-grid">

            <div class="filter-group">
              <label>Estado del Caso</label>
              <select v-model="filters.estado">
                <option value="">Todos</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Código de Estudiante</label>
              <input type="text" v-model="filters.codigoEstudiante" placeholder="Ej. A123XYZ" />
            </div>
          </div>

          <div class="filters-advanced-wrapper" :class="{ 'is-open': showAdvanced }">
            <div class="filters-grid advanced-grid">
              <div class="filter-group">
                <label>Edad</label>
                <select v-model="filters.edad">
                  <option value="">Todas</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Grado</label>
                <select v-model="filters.grado">
                  <option value="">Todos</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Nivel Educativo</label>
                <select v-model="filters.nivel">
                  <option value="">Todos</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Lengua</label>
                <select v-model="filters.lengua">
                  <option value="">Todas</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Pueblo</label>
                <select v-model="filters.pueblo">
                  <option value="">Todos</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Centro Educativo</label>
                <input type="text" v-model="filters.centroEducativo" placeholder="Nombre de escuela..." />
              </div>

              <div class="filter-group">
                <label>Fecha de Casos</label>
                <input type="date" v-model="filters.fechaCaso" />
              </div>

              <div class="filter-group">
                <label>¿Tiene Queja?</label>
                <select v-model="filters.tieneQueja">
                  <option value="">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Dirección Departamental (DIDEDUC)</label>
                <select v-model="filters.dideduc">
                  <option value="">Todas</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Status Actual</label>
                <select v-model="filters.statusActual">
                  <option value="">Todos</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Resultado</label>
                <select v-model="filters.resultado">
                  <option value="">Todos</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Área</label>
                <select v-model="filters.area">
                  <option value="">Todas</option>
                  <option value="rural">Rural</option>
                  <option value="urbana">Urbana</option>
                </select>
              </div>
            </div>
          </div>

          <div class="filters-footer">
            <button @click="clearFilters" class="btn-clear">Limpiar Filtros</button>
          </div>
        </div>
      </div>
    </section>

    <section class="py-8 bg-white">
      <div class="container-max">
        <div class="stats-grid">
          <div
            v-for="(card, i) in statCards" :key="i"
            class="stat-card-custom"
            @mouseenter="card.hovered = true"
            @mouseleave="card.hovered = false"
            :class="{ hovered: card.hovered }"
          >
            <img :src="card.hovered ? card.white : card.pink" :alt="card.label" class="stat-img" />
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-8">
      <div class="container-max">
        <div class="card-box unified-card">
          <div class="grid-2-col">
            <div class="map-container unified-left">
              <GuateMap />
            </div>
            <div class="age-container unified-right">
              <div class="age-chart-wrapper">
                <div v-for="item in ageData" :key="item.label" class="age-bar-row">
                  <span class="age-label">{{ item.label }}</span>
                  <div class="age-track">
                    <div class="age-fill" :style="{ width: ((item.value / maxAge) * 100) + '%' }"></div>
                  </div>
                  <span class="age-value">{{ item.value }}</span>
                </div>
                <div class="age-x-axis">
                  <span v-for="n in [0, 5, 10, 15]" :key="n">{{ n }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-2 text-center">
      <div class="container-max">
        <h2 class="chart-title">Graficas por Mes y Estado de Casos</h2>
        <p class="chart-subtitle">Muestra la distribución de casos por mes y estado, facilitando su análisis y seguimiento.</p>
      </div>
    </section>

    <section class="py-6 pb-12">
      <div class="container-max">
        <div class="grid-2-col gap-5">
          <div class="card-box chart-container">
            <LineChart />
          </div>
          <div class="card-box chart-container" style="overflow: hidden;">
            <DonaChart />
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import AppNavbar  from '@/components/AppNavbar.vue'
import AppFooter  from '@/components/AppFooter.vue'
import GuateMap   from '@/components/GuateMap.vue'
import LineChart  from '@/components/LineChart.vue'
import DonaChart  from '@/components/DonaChart.vue'
import { useCasosStore } from '@/stores/casos'

import heroImage   from '@/assets/ninas embarazadas -37.png'
import iconPink16  from '@/assets/ninas_embarazadas_-20.png'
import iconPink15  from '@/assets/ninas embarazadas -31.png'
import iconPink14  from '@/assets/ninas embarazadas -30.png'
import iconPink13  from '@/assets/ninas embarazadas -32.png'
import iconWhite16 from '@/assets/ninas_embarazadas_-13.png'
import iconWhite15 from '@/assets/ninas embarazadas -34.png'
import iconWhite14 from '@/assets/ninas embarazadas -35.png'
import iconWhite13 from '@/assets/ninas embarazadas -33.png'

const casosStore = useCasosStore()

// ── Control de Visibilidad de Filtros Avanzados ───────
const showAdvanced = ref(false)

// ── Estado Reactivo para los Filtros ──────────────────
const initialFilters = {
  codigoEstudiante: '',
  edad: '',
  grado: '',
  nivel: '',
  lengua: '',
  pueblo: '',
  centroEducativo: '',
  fechaCaso: '',
  departamento: '',
  municipio: '',
  estado: '',
  tieneQueja: '',
  dideduc: '',
  statusActual: '',
  resultado: '',
  area: ''
}

const filters = reactive({ ...initialFilters })

const clearFilters = () => {
  Object.assign(filters, initialFilters)
}

// ── Stat Cards ─────────────────────────────────────────
const statCards = ref([
  { label: 'Total de Casos',            value: '1,000M', pink: iconPink16, white: iconWhite16, hovered: false },
  { label: 'Estudiantes Inactivos',     value: '500',    pink: iconPink14, white: iconWhite14, hovered: false },
  { label: 'Estudiantes Activos',       value: '500',    pink: iconPink15, white: iconWhite15, hovered: false },
  { label: 'Porcentaje de Estudiantes', value: '50%',    pink: iconPink13, white: iconWhite13, hovered: false }
])

// ── Age Bar Chart ──────────────────────────────────────
const ageDataRaw = [
  { label: '17 años',       value: casosStore.casosPorEdad(17).length || 14 },
  { label: 'Menores de 12', value: casosStore.casosPorEdad(12).length || 12 },
  { label: '16 años',       value: casosStore.casosPorEdad(16).length || 11 },
  { label: '15 años',       value: casosStore.casosPorEdad(15).length || 9  },
  { label: '14 años',       value: casosStore.casosPorEdad(14).length || 6  },
  { label: '13 años',       value: casosStore.casosPorEdad(13).length || 3  },
]

const ageData = computed(() => [...ageDataRaw].sort((a, b) => b.value - a.value))
const maxAge  = computed(() => { const m = Math.max(...ageData.value.map(d => d.value)); return m > 0 ? m : 15 })
</script>

<style scoped>
.dashboard-page {
  background-color: #f5f5f5;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.container-max { max-width: 60rem; margin: 0 auto; padding: 0 1.5rem; }
.bg-white  { background-color: #ffffff; }
.border-bottom { border-bottom: 1px solid #eaeaea; }
.py-8      { padding-top: 2rem; padding-bottom: 2rem; }
.py-6      { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.pb-12     { padding-bottom: 3rem; }
.pb-2      { padding-bottom: 0.5rem; }
.text-center { text-align: center; }
.gap-5     { gap: 1.25rem; }

/* HERO */
.hero-dash { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg   { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(255,151,151,0) 0%, rgba(255,151,151,0.2) 40%, rgba(255,151,151,0.95) 100%);
}
.hero-content {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  padding-bottom: 3.5rem; padding-inline: 1.5rem; text-align: center;
}
.hero-top-text { color: white; font-size: 32px; font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: -0.25rem; line-height: 1.1; }
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; max-width: 900px; margin-bottom: 0; }
.hero-subtitle { margin-top: 1rem; color: white; font-size: 1.125rem; font-weight: 500; text-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 700px; }

/* FILTERS STYLES */
.filters-card {
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.filters-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}
.icon-filter {
  font-size: 1.2rem;
}
.btn-toggle {
  background: transparent;
  border: none;
  color: #ff9797;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.2s;
}
.btn-toggle:hover { color: #e67e7e; }
.btn-toggle .arrow {
  font-size: 0.7rem;
  transition: transform 0.3s;
}
.btn-toggle .arrow.open {
  transform: rotate(180deg);
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1rem;
}
.filters-advanced-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.4s;
}
.filters-advanced-wrapper.is-open {
  max-height: 800px; /* Suficiente espacio para acomodar las filas */
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #f0f0f0;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.filter-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6d6d6d;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.filter-group select,
.filter-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background-color: #fafafa;
  color: #1a1a1a;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
.filter-group select:focus,
.filter-group input:focus {
  border-color: #ff9797;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 151, 151, 0.15);
}
.filter-group select:disabled {
  background-color: #eeeeee;
  color: #b0b0b0;
  cursor: not-allowed;
}
.filters-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f5f5f5;
}
.btn-clear {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #6d6d6d;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-clear:hover {
  background: #eaeaea;
  color: #1a1a1a;
}

/* STAT CARDS */
.stats-grid { display: flex; gap: 1.5rem; }
.stat-card-custom {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2.5rem 1rem 2rem; border-radius: 1rem; cursor: pointer;
  transition: all 0.2s; background-color: #f7f7f7;
}
.stat-card-custom.hovered { background-color: #ff9797; }
.stat-img   { width: 4rem; height: 4rem; object-fit: contain; margin-bottom: 1.25rem; }
.stat-label { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center; color: #1a1a1a; }
.stat-card-custom.hovered .stat-label { color: #ffffff; }
.stat-value { color: #ff9797; font-size: 2.5rem; font-weight: 700; line-height: 1; }
.stat-card-custom.hovered .stat-value { color: #ffffff; }

/* GRID & CARDS */
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; }
.card-box { background-color: #ffffff; border: none; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.unified-card  { padding: 0; }
.unified-left  { padding: 1.5rem; }
.unified-right { padding: 2.5rem 1.5rem 1.5rem; }
.map-container { min-height: 280px; display: flex; align-items: center; justify-content: center; overflow: hidden; }

/* AGE CHART */
.age-container    { display: flex; flex-direction: column; justify-content: center; }
.age-chart-wrapper { display: flex; flex-direction: column; gap: 0.75rem; height: 100%; justify-content: center; }
.age-bar-row { display: flex; align-items: center; gap: 0.75rem; }
.age-label   { font-size: 0.75rem; width: 6rem; text-align: right; flex-shrink: 0; color: #6d6d6d; }
.age-track   { flex: 1; height: 1rem; border-radius: 0.25rem; background-color: #f0f0f0; overflow: hidden; }
.age-fill    { height: 100%; background-color: #ff9797; border-radius: 0.25rem; transition: width 0.5s ease; }
.age-value   { font-size: 0.75rem; width: 1rem; flex-shrink: 0; color: #6d6d6d; }
.age-x-axis  { display: flex; justify-content: space-between; padding-left: 6.75rem; padding-right: 1.75rem; margin-top: 0.25rem; }
.age-x-axis span { font-size: 0.75rem; color: #b0b0b0; }

/* CHART TITLE */
.chart-title    { color: #6d6d6d; font-size: 1.25rem; font-weight: 600; }
.chart-subtitle { margin-top: 0.25rem; font-size: 0.875rem; color: #ff9797; }

/* CHART WRAPPERS */
.chart-container { display: flex; align-items: center; justify-content: center; }
.chart-container > div { width: 100%; }
</style>