<template>
  <div class="dashboard-page">
    <AppNavbar />

    <!-- HERO -->
    <section class="hero-dash">
      <img src="/imgs/img3.jpg" alt="Corredor de escuela" class="hero-bg" />
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

    <!-- FILTROS -->
    <section class="filters-section">
      <div class="container-max">
        <div class="filters-card">

          <div class="filters-header">
            <div class="filters-title">
              <v-icon size="18" color="#17c4e8">mdi-filter-outline</v-icon>
              <span>Filtrar Información</span>
              <span v-if="casosStore.loading" class="loading-chip">Cargando...</span>
              <span v-else class="count-chip">{{ casosStore.total }} casos</span>
            </div>
            <div class="header-actions">
              <button @click="showAdvanced = !showAdvanced" class="btn-toggle">
                {{ showAdvanced ? 'Ocultar avanzados' : 'Más filtros' }}
                <v-icon size="14" :class="{ rotated: showAdvanced }">mdi-chevron-down</v-icon>
              </button>
            </div>
          </div>

          <!-- Filtros principales -->
          <div class="filters-grid">
                <div class="filter-group">
                <label>Dideduc (Dir. Departamental)</label>
                <select v-model="filters.departamental">
                  <option value="">Todas</option>
                  <option v-for="d in departamentales" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                </select>
              </div>
            <div class="filter-group">
              <label>Departamento</label>
              <select v-model="filters.departamento" @change="onDepartamentoChange">
                <option value="">Todos</option>
                <option v-for="d in departamentos" :key="d.id" :value="d.nombre">{{ d.nombre }}</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Municipio</label>
              <select v-model="filters.municipio" :disabled="!filters.departamento">
                <option value="">{{ filters.departamento ? 'Todos' : 'Selecciona departamento' }}</option>
                <option v-for="m in municipios" :key="m.id" :value="m.nombre">{{ m.nombre }}</option>
              </select>
            </div>

                 <div class="filter-group">
                <label>Status en Sistema</label>
                <select v-model="filters.statusActual">
                  <option value="">Todos</option>
                  <option v-for="s in STATUS_SISTEMA" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

          </div>

          <!-- Filtros avanzados -->
          <div class="advanced-wrapper" :class="{ open: showAdvanced }">
            <div class="filters-grid advanced-grid">

          
     <div class="filter-group">
              <label>¿Tiene Queja?</label>
              <select v-model="filters.tieneQueja">
                <option value="">Todos</option>
                <option value="si">Con queja</option>
                <option value="no">Sin queja</option>
              </select>
            </div>

            <div class="filter-group">
              <label>¿Tiene CUI?</label>
              <select v-model="filters.tieneCui">
                <option value="">Todos</option>
                <option value="si">Con CUI</option>
                <option value="no">Sin CUI</option>
              </select>
            </div>
              <div class="filter-group">
                <label>Pueblo de Pertenencia</label>
                <select v-model="filters.pueblo">
                  <option value="">Todos</option>
                  <option v-for="p in PUEBLOS" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Comunidad Lingüística</label>
                <select v-model="filters.lengua">
                  <option value="">Todas</option>
                  <option v-for="c in COMUNIDADES" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Grado</label>
                <select v-model="filters.grado">
                  <option value="">Todos</option>
                  <option v-for="g in GRADOS" :key="g.id" :value="g.id">{{ g.nombre }}</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Nivel Educativo</label>
                <select v-model="filters.nivel">
                  <option value="">Todos</option>
                  <option v-for="n in NIVELES" :key="n.id" :value="n.id">{{ n.nombre }}</option>
                </select>
              </div>

                 <div class="filter-group">
              <label>Estado del Caso</label>
              <select v-model="filters.estado">
                <option value="">Todos</option>
                <option v-for="est in ESTADOS_CASO" :key="est" :value="est">{{ est }}</option>
              </select>
            </div>

              <div class="filter-group">
                <label>Resultado</label>
                <select v-model="filters.resultado">
                  <option value="">Todos</option>
                  <option v-for="r in RESULTADOS" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Área</label>
                <select v-model="filters.area">
                  <option value="">Todas</option>
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Edad mínima</label>
                <input type="number" v-model="filters.edadMin" placeholder="Ej. 10" min="0" max="18" />
              </div>

              <div class="filter-group">
                <label>Edad máxima</label>
                <input type="number" v-model="filters.edadMax" placeholder="Ej. 18" min="0" max="18" />
              </div>

              <div class="filter-group">
                <label>Fecha desde</label>
                <input type="date" v-model="filters.fechaInicio" />
              </div>

              <div class="filter-group">
                <label>Fecha hasta</label>
                <input type="date" v-model="filters.fechaFin" />
              </div>

              <div class="filter-group span-2">
                <label>Centro Educativo (nombre)</label>
                <input type="text" v-model="filters.centroEducativo" placeholder="Buscar por nombre de escuela..." />
              </div>

              <div class="filter-group span-2">
                <label>Código Personal del Estudiante</label>
                <input type="text" v-model="filters.codigoEstudiante" placeholder="Ej. A123XYZ" />
              </div>

            </div>
          </div>

          <!-- Footer de filtros -->
          <div class="filters-footer">
            <button @click="limpiar" class="btn-clear">
              <v-icon size="15">mdi-close-circle-outline</v-icon>
              Limpiar filtros
            </button>
            <div class="footer-right">
              <button @click="exportarExcelClick" class="btn-export excel" :disabled="casosStore.loading || exporting || casosStore.total === 0">
                <v-icon size="15">mdi-microsoft-excel</v-icon>
                {{ exporting ? 'Generando...' : 'Excel' }}
              </button>
              <div class="pdf-group">
                <button
                  @click="pixelarNombres = !pixelarNombres"
                  class="btn-pixelar"
                  :class="{ 'btn-pixelar-active': pixelarNombres }"
                  title="Oculta los nombres de las niñas en el PDF por privacidad"
                >
                  <v-icon size="14">{{ pixelarNombres ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
                  {{ pixelarNombres ? 'Nombres ocultos' : 'Pixelar nombres' }}
                </button>
                <button @click="exportarPDFClick" class="btn-export pdf" :disabled="casosStore.loading || exporting || casosStore.total === 0">
                  <v-icon size="15">mdi-file-pdf-box</v-icon>
                  {{ exporting ? 'Generando...' : 'PDF' }}
                </button>
              </div>
              <button @click="aplicarFiltros" class="btn-apply" :disabled="casosStore.loading">
                <v-icon size="15">mdi-magnify</v-icon>
                {{ casosStore.loading ? 'Buscando...' : 'Aplicar filtros' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- STAT CARDS -->
    <section class="py-8 bg-white">
  <div class="kpi-grid">
          <div class="kpi-card" v-for="item in kpiPrincipales" :key="item.id">
            <div class="kpi-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.iconPath" />
              </svg>
            </div>
            <div class="kpi-number">{{ item.value }}</div>
            <div class="kpi-label">{{ item.label }}</div>
          </div>
        </div>
    </section>

        <section class="pb-2 text-center">
      <div class="container-max" style="background-color: #10233f; border-radius: 10px; padding-block: 1rem;">
        <h2 class="chart-title">Gráficas geográficas y edades</h2>
        <p class="chart-subtitle">Distribución de casos por departamentos, municipios y edades según los filtros aplicados.</p>
      </div>
    </section>

    <!-- MAPA + BAR CHART -->
    <section class="py-8">
      <div class="container-max">
        <div class="card-box unified-card">
          <div class="grid-2-col">
            <div class="map-container unified-left">
              <GuateMap />
            </div>
            <div class="age-container unified-right">
              <BarChart />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CHARTS -->
    <section class="pb-2 text-center">
      <div class="container-max" style="background-color: #10233f; border-radius: 10px; padding-block: 1rem;">
        <h2 class="chart-title">Gráficas por mes y estado de casos</h2>
        <p class="chart-subtitle">Distribución de casos por mes y estado según los filtros aplicados.</p>
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
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import api from '@/helpers/api'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import GuateMap  from '@/components/GuateMap.vue'
import LineChart from '@/components/LineChart.vue'
import DonaChart from '@/components/DonaChart.vue'
import BarChart  from '@/components/BarChart.vue'
import { useCasosStore } from '@/stores/casos'
import { exportarExcel, exportarPDF } from '@/composables/useExport'

import heroImage   from '@/assets/ninas embarazadas -37.png'




const casosStore = useCasosStore()

// Normaliza el status para comparar sin importar mayúsculas/acentos:
// en la BD se guardan en mayúsculas ("MAYOR DE 14 AÑOS", "NO EXISTE REGISTRO").
const normStatus = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const esMayorOSinRegistro = (caso) => {
  // Coincide con cualquier historial de la niña (no solo el primero), igual que
  // el conteo del servidor en Seguimiento.
  const historiales = caso.nina?.historialEducativo ?? []
  return historiales.some(h => {
    const s = normStatus(h.status_actual)
    return s === 'mayor de 14 anos' || s === 'no existe registro' || s === 'sin registro'
  })
}

const kpiPrincipales = computed(() => {
  const mayoresOSinRegistro = casosStore.casos.filter(esMayorOSinRegistro).length

  return [
    {
      id: 'casos_totales',
      label: 'Casos Totales',
      value: casosStore.total,
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      id: 'mayores_14_sin_registro',
      label: 'Casos Mayores de 14 años o sin Registro',
      value: mayoresOSinRegistro,
      iconPath: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
    },
    {
      id: 'verificados_sire',
      label: 'Verificados en el SIRE',
      value: casosStore.casosPorEstado('Verificados en el SIRE').length,
      iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'sin_verificar_sire',
      label: 'Sin Verificar en el SIRE',
      value: casosStore.casosPorEstado('sin Verificar en el SIRE').length,
      iconPath: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'verificados_quejas',
      label: 'Verificados en el Sistema de Quejas, Comentarios o Sugerencias',
      value: casosStore.casosPorEstado('Verificados en el Sistema de Quejas, Comentarios o Sugerencias').length,
      iconPath: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H12V4.875z'
    },
    {
      id: 'sin_quejas',
      label: 'Sin Quejas',
      value: casosStore.casosPorEstado('sin Quejas').length,
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    }
  ]
})

// ── Lookup data ───────────────────────────────────────────────────────────────
const departamentos   = ref([])
const municipios      = ref([])
const departamentales = ref([])

// Pueblos y comunidades lingüísticas — listas fijas (ya no son tablas de BD)
const PUEBLOS = ['Maya', 'Xinka', 'Garífuna', 'Ladino', 'Otros']
const COMUNIDADES = [
  'Kaqchikel', "K'iche'", 'Español', "Achi'", 'Akateko', 'Awakateko',
  'Chalchiteko', "Ch'orti'", 'Chuj', 'Ixil', "Jakalteko / Popti'",
  'Mam', 'Mopan', 'Poqomam', "Poqomchi'", "Q'anjob'al", "Q'eqchi'",
  'Sakapulteko', 'Sipakapense', 'Tektiteko', "Tz'utujil", 'Uspanteko',
  'Garífuna', 'Xinka', 'Otros',
]

// ── Constantes de valores conocidos ──────────────────────────────────────────
const GRADOS = [
  { id: 1, nombre: "1ro" },
  { id: 2, nombre: "2do" },
  { id: 3, nombre: "3ro" },
  { id: 4, nombre: "4to" },
  { id: 5, nombre: "5to" },
  { id: 6, nombre: "6to" }
]
// El id es el valor canónico guardado en historial_educativo.nivel — el mismo
// vocabulario que usa la carga masiva. Ver backend/helpers/nivelEducativo.js
const NIVELES = [
  {
    id: "Preprimaria",
    nombre: "Nivel de Educación Preprimaria",
  },
  {
    id: "Primaria",
    nombre: "Nivel de Educación Primaria",
  },
  {
    id: "Media (Básico)",
    nombre: "Nivel de Educación Media (Ciclo Básico)",
  },
  {
    id: "Media (Diversificado)",
    nombre: "Nivel de Educación Media (Ciclo Diversificado)",
  },
];
const STATUS_SISTEMA = ['Inscrita', 'No inscrita', 'Retirada', 'Mayor de 14 años', 'No existe Registro']
const RESULTADOS   = ['Promovido', 'No Promovido', 'Retirado', 'Cursando actualmente']

// Estados institucionales del caso
const ESTADOS_CASO = [
  'Verificados en el SIRE',
  'sin Verificar en el SIRE',
  'Verificados en el Sistema de Quejas, Comentarios o Sugerencias',
  'sin Quejas',
]

// ── Estado de filtros ─────────────────────────────────────────────────────────
const showAdvanced = ref(false)

const initialFilters = () => ({
  departamento:    '',
  municipio:       '',
  estado:          '',
  tieneQueja:      '',
  tieneCui:        '',
  departamental:   '',
  pueblo:          '',
  lengua:          '',
  grado:           '',
  nivel:           '',
  statusActual:    '',
  resultado:       '',
  area:            '',
  edadMin:         '',
  edadMax:         '',
  fechaInicio:     '',
  fechaFin:        '',
  centroEducativo: '',
  codigoEstudiante:'',
})

const filters = reactive(initialFilters())

const toTitleCase = (text = '') => {
  return text
    .toLowerCase()
    .split(' ')
    .map(palabra =>
      palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(' ')
}

// ── Carga de datos de referencia ──────────────────────────────────────────────
onMounted(async () => {
  const [rDept, rDeptales] = await Promise.all([
    api.get('/dept'),
    api.get('/dept/departamentales'),
  ])

  departamentos.value = (rDept.data.data || []).map(dep => ({
    ...dep,
    nombre: toTitleCase(dep.nombre)
  }))

  departamentales.value = (rDeptales.data.data || []).map(dep => ({
    ...dep,
    nombre: toTitleCase(dep.nombre)
  }))

  await casosStore.fetchTodos()
})

const onDepartamentoChange = async () => {
  filters.municipio = ''
  municipios.value = []

  if (!filters.departamento) return

  const dept = departamentos.value.find(
    d => d.nombre === filters.departamento
  )

  if (!dept) return

  const r = await api.get('/dept/municipios', {
    params: { departamento_id: dept.id }
  })

  municipios.value = (r.data.data || []).map(mun => ({
    ...mun,
    nombre: toTitleCase(mun.nombre)
  }))
}

// ── Construir params desde filters ───────────────────────────────────────────
const buildParams = () => {
  const params = {}
  if (filters.departamento)     params.departamento      = filters.departamento
  if (filters.municipio)        params.municipio         = filters.municipio
  if (filters.estado)           params.estado            = filters.estado
  if (filters.tieneQueja)       params.tiene_queja       = filters.tieneQueja
  if (filters.tieneCui)         params.tiene_cui         = filters.tieneCui
  if (filters.departamental)    params.departamental     = filters.departamental
  if (filters.pueblo)           params.pueblo            = filters.pueblo
  if (filters.lengua)           params.lengua            = filters.lengua
  if (filters.grado)            params.grado             = filters.grado
  if (filters.nivel)            params.nivel             = filters.nivel
  if (filters.statusActual)     params.status_actual     = filters.statusActual
  if (filters.resultado)        params.resultado         = filters.resultado
  if (filters.area)             params.area              = filters.area
  if (filters.edadMin !== '')   params.edad_min          = filters.edadMin
  if (filters.edadMax !== '')   params.edad_max          = filters.edadMax
  if (filters.fechaInicio)      params.fecha_inicio      = filters.fechaInicio
  if (filters.fechaFin)         params.fecha_fin         = filters.fechaFin
  if (filters.centroEducativo)  params.centro_educativo  = filters.centroEducativo
  if (filters.codigoEstudiante) params.codigo_estudiante = filters.codigoEstudiante
  return params
}

// ── Aplicar filtros (retorna promesa para que export pueda awaitar) ────────────
const aplicarFiltros = () => {
  return casosStore.fetchConFiltros(buildParams())
}

// ── Auto-aplicar cuando cambian selects (debounced 350ms) ─────────────────────
let _autoTimer = null
const _autoApply = () => {
  clearTimeout(_autoTimer)
  _autoTimer = setTimeout(aplicarFiltros, 350)
}

watch(
  () => [
    filters.departamento, filters.municipio, filters.estado, filters.tieneQueja,
    filters.tieneCui,
    filters.departamental, filters.pueblo,   filters.lengua, filters.grado,
    filters.nivel, filters.statusActual,     filters.resultado, filters.area,
    filters.edadMin, filters.edadMax,        filters.fechaInicio, filters.fechaFin,
  ],
  _autoApply
)

const limpiar = () => {
  clearTimeout(_autoTimer)
  Object.assign(filters, initialFilters())
  municipios.value = []
  casosStore.fetchTodos()
}

// ── Resumen de filtros para el PDF ────────────────────────────────────────────
const resumenFiltros = computed(() => {
  const partes = []
  if (filters.departamento)    partes.push(`Depto: ${filters.departamento}`)
  if (filters.municipio)       partes.push(`Municipio: ${filters.municipio}`)
  if (filters.estado)          partes.push(`Estado: ${filters.estado}`)
  if (filters.tieneQueja)      partes.push(`Queja: ${filters.tieneQueja === 'si' ? 'Con queja' : 'Sin queja'}`)
  if (filters.grado)           partes.push(`Grado: ${filters.grado}`)
  if (filters.nivel)           partes.push(`Nivel: ${filters.nivel}`)
  if (filters.area)            partes.push(`Área: ${filters.area}`)
  if (filters.fechaInicio)     partes.push(`Desde: ${filters.fechaInicio}`)
  if (filters.fechaFin)        partes.push(`Hasta: ${filters.fechaFin}`)
  return partes.join('  ·  ')
})

// ── Exportar (siempre aplica filtros antes de exportar) ───────────────────────
const exporting = ref(false)
const pixelarNombres = ref(false)

const exportarExcelClick = async () => {
  if (exporting.value) return
  exporting.value = true
  try {
    await aplicarFiltros()
    await nextTick()
    exportarExcel(casosStore.casos, 'SIGEC_Casos')
  } finally {
    exporting.value = false
  }
}

const exportarPDFClick = async () => {
  if (exporting.value) return
  exporting.value = true
  try {
    await aplicarFiltros()
    await nextTick()
    exportarPDF(casosStore.casos, 'SIGEC_Casos', resumenFiltros.value, { pixelarNombres: pixelarNombres.value })
  } finally {
    exporting.value = false
  }
}

</script>

<style scoped>
.kpi-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 4px 0 18px;
}

.kpi-divider-line {
  flex: 1;
  border: none;
  border-top: 1px solid #c6d8e6;
  margin: 0;
}

.kpi-divider-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.13em;
  color: #8da7be;
  text-transform: uppercase;
  white-space: nowrap;
}

/* ==========================
   KPI PRINCIPALES
========================== */

@keyframes kpiEnter {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 22px 14px 18px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #dce8f0;
  box-shadow: 0 2px 8px rgba(16, 35, 63, 0.04);
  animation: kpiEnter 0.45s ease both;
  transition: transform .22s ease, box-shadow .22s ease;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 28px rgba(16, 35, 63, 0.13);
}

.kpi-card:nth-child(1) { animation-delay: .05s; }
.kpi-card:nth-child(2) { animation-delay: .12s; }
.kpi-card:nth-child(3) { animation-delay: .19s; }
.kpi-card:nth-child(4) { animation-delay: .26s; }
.kpi-card:nth-child(5) { animation-delay: .33s; }

.kpi-icon-wrap {
  width: 34px;
  height: 34px;
  color: #17c4e8;
  margin-bottom: 10px;
}

.kpi-icon-wrap :deep(svg) {
  width: 100%;
  height: 100%;
}

.kpi-number {
  font-size: clamp(20px, 2.2vw, 30px);
  font-weight: 900;
  color: #10233f;
  line-height: 1;
  margin-bottom: 6px;
  letter-spacing: -.02em;
}

.kpi-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #6a8299;
  text-transform: uppercase;
  letter-spacing: .07em;
  line-height: 1.3;
}



.dashboard-page {
  background-color: #f5f5f5;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.container-max { max-width: 60rem; margin: 0 auto; padding: 0 1.5rem; }
.bg-white      { background-color: #ffffff; }
.py-8          { padding-top: 2rem; padding-bottom: 2rem; }
.py-6          { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.pb-12         { padding-bottom: 3rem; }
.pb-2          { padding-bottom: 0.5rem; }
.text-center   { text-align: center; }
.gap-5         { gap: 1.25rem; }

/* HERO */
.hero-dash { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg   { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom,
      rgba(16, 35, 63, 0) 0%,
      rgba(16, 35, 63, 0.2) 40%,
      rgba(16, 35, 63, 0.95) 100%);
}
.hero-content {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  padding-bottom: 3.5rem; padding-inline: 1.5rem; text-align: center;
}
.hero-top-text { color: white; font-size: 32px; font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: -0.25rem; line-height: 1.1; }
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; max-width: 900px; margin-bottom: 0; }
.hero-subtitle { margin-top: 1rem; color: white; font-size: 1.125rem; font-weight: 500; text-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 700px; }

/* FILTERS */
.filters-section { background: #fff; border-bottom: 1px solid #eaeaea; padding: 1.5rem 0; }

.filters-card {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 0.75rem;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.filters-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.filters-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1rem; font-weight: 600; color: #1a1a1a;
}
.count-chip {
  background: #e0eef0; color: #10233f; border: 1px solid #17c4e8;
  border-radius: 999px; padding: 0.1rem 0.6rem; font-size: 0.75rem; font-weight: 600;
}
.loading-chip {
  background: #f0f0f0; color: #6d6d6d;
  border-radius: 999px; padding: 0.1rem 0.6rem; font-size: 0.75rem;
}
.header-actions { display: flex; align-items: center; gap: 0.5rem; }
.btn-toggle {
  background: transparent; border: none; color: #10233f;
  font-weight: 600; font-size: 0.8rem; cursor: pointer;
  display: flex; align-items: center; gap: 0.25rem;
  transition: color 0.2s;
}
.btn-toggle:hover { color: #10233f; }
.btn-toggle .v-icon { transition: transform 0.3s; }
.btn-toggle .v-icon.rotated { transform: rotate(180deg); }

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 0.75rem;
}
.advanced-grid {
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
}
.span-2 { grid-column: span 2; }

.advanced-wrapper {
  max-height: 0; overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.4s;
}
.advanced-wrapper.open {
  max-height: 1000px; margin-top: 1rem; padding-top: 1rem;
  border-top: 1px dashed #f0f0f0;
}

.filter-group { display: flex; flex-direction: column; gap: 0.3rem; }
.filter-group label {
  font-size: 0.7rem; font-weight: 700; color: #6d6d6d;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.filter-group select,
.filter-group input {
  width: 100%; padding: 0.55rem 0.7rem; font-size: 0.8rem;
  border: 1px solid #e0e0e0; border-radius: 0.5rem;
  background-color: #fafafa; color: #1a1a1a; outline: none;
  transition: all 0.2s; box-sizing: border-box;
}
.filter-group select:focus,
.filter-group input:focus {
  border-color: #ff9797; background-color: #fff;
  box-shadow: 0 0 0 3px rgba(255,151,151,0.15);
}
.filter-group select:disabled { opacity: 0.5; cursor: not-allowed; }

.filters-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f5f5f5;
}
.footer-right { display: flex; align-items: center; gap: 0.5rem; }

.btn-clear {
  display: flex; align-items: center; gap: 0.35rem;
  background: #f5f5f5; border: 1px solid #e0e0e0; color: #6d6d6d;
  padding: 0.45rem 0.9rem; border-radius: 0.5rem;
  font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-clear:hover { background: #eaeaea; color: #1a1a1a; }

.btn-export {
  display: flex; align-items: center; gap: 0.35rem;
  border: none; padding: 0.45rem 0.9rem; border-radius: 0.5rem;
  font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-export:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-export.excel { background: #e6f4ea; color: #137333; }
.btn-export.excel:hover:not(:disabled) { background: #c8e6c9; }
.btn-export.pdf   { background: #fce4e4; color: #b71c1c; }
.btn-export.pdf:hover:not(:disabled) { background: #ffcdd2; }

.pdf-group { display: flex; align-items: center; gap: 0; border: 1px solid #e0e0e0; border-radius: 0.5rem; overflow: hidden; }
.pdf-group .btn-export.pdf { border-radius: 0; border: none; border-left: 1px solid #e0e0e0; }

.btn-pixelar {
  display: flex; align-items: center; gap: 0.3rem;
  background: #f5f5f5; border: none; color: #6d6d6d;
  padding: 0.45rem 0.75rem; font-size: 0.75rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-pixelar:hover { background: #ebebeb; color: #10233f; }
.btn-pixelar-active { background: #10233f !important; color: #ffffff !important; }

.btn-apply {
  display: flex; align-items: center; gap: 0.35rem;
  background: #10233f; border: none; color: white;
  padding: 0.45rem 1.1rem; border-radius: 0.5rem;
  font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255,151,151,0.4);
}
.btn-apply:hover:not(:disabled) { background: #e67e7e; }
.btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }

/* STAT CARDS */
.stats-grid { display: flex; gap: 1.5rem; }
.stat-card-custom {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 2.5rem 1rem 2rem;
  border-radius: 1rem; cursor: pointer; transition: all 0.2s;
  background-color: #f7f7f7;
}
.stat-card-custom.hovered { background-color: #ff9797; }
.stat-img   { width: 4rem; height: 4rem; object-fit: contain; margin-bottom: 1.25rem; }
.stat-label { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center; color: #1a1a1a; }
.stat-card-custom.hovered .stat-label { color: #ffffff; }
.stat-value { color: #ff9797; font-size: 2.5rem; font-weight: 700; line-height: 1; }
.stat-card-custom.hovered .stat-value { color: #ffffff; }

/* GRID */
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; }
.card-box {
  background-color: #ffffff; border: none; border-radius: 0.75rem;
  padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.unified-card  { padding: 0; }
.unified-left  { padding: 1.5rem; }
.unified-right { padding: 2.5rem 1.5rem 1.5rem; }
.map-container {
  min-height: 280px; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}
.age-container { display: flex; flex-direction: column; justify-content: center; }

/* CHART TITLE */
.chart-title    { color: #fff; font-size: 1.25rem; font-weight: 600; }
.chart-subtitle { margin-top: 0.25rem; font-size: 0.875rem; color: #17c4e8; }

/* CHART WRAPPERS */
.chart-container { display: flex; align-items: center; justify-content: center; }
.chart-container > div { width: 100%; }
</style>
