<template>
  <div class="audit-page">
    <AppNavbar />

    <section class="hero-dash">
      <img :src="heroImage" alt="Auditoría" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Historial de acciones del sistema</p>
        <h1 class="hero-title">Auditoría</h1>
      </div>
    </section>

    <section class="py-8">
      <div class="container-max">

        <div class="audit-header">
          <div>
            <h2 class="section-title">Bitácora de Auditoría</h2>
            <p class="section-subtitle">Consulta quién realizó cada acción dentro del sistema.</p>
          </div>
          <div class="export-actions">
            <button class="export-btn excel-btn" :disabled="exportando" @click="exportarExcelAuditoria">
              <v-icon size="16" class="mr-1">mdi-file-excel-outline</v-icon>
              {{ exportando === 'excel' ? 'Generando...' : 'Excel' }}
            </button>
            <button class="export-btn pdf-btn" :disabled="exportando" @click="exportarPdfAuditoria">
              <v-icon size="16" class="mr-1">mdi-file-pdf-box</v-icon>
              {{ exportando === 'pdf' ? 'Generando...' : 'PDF' }}
            </button>
          </div>
        </div>

        <div class="card-box mt-6">

          <div class="filters-row">
            <div class="select-wrapper">
              <label class="filter-label">Acción</label>
              <select v-model="accionFiltro" class="audit-select" @change="cargar(1)">
                <option value="">Todas</option>
                <option v-for="op in ACCIONES" :key="op.value" :value="op.value">{{ op.label }}</option>
              </select>
              <v-icon size="16" class="select-icon">mdi-chevron-down</v-icon>
            </div>

            <div class="date-field">
              <label class="filter-label">Desde</label>
              <input type="date" v-model="desde" class="date-input" @change="cargar(1)" />
            </div>

            <div class="date-field">
              <label class="filter-label">Hasta</label>
              <input type="date" v-model="hasta" class="date-input" @change="cargar(1)" />
            </div>
          </div>

          <div class="table-responsive">
            <table class="audit-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reg in registros" :key="reg.id">
                  <td class="text-gray">{{ formatFecha(reg.createdAt) }}</td>
                  <td>
                    <div class="user-name">{{ reg.usuario?.name || 'Sistema' }}</div>
                    <div class="user-email">{{ reg.usuario?.email || '' }}</div>
                  </td>
                  <td>
                    <span class="accion-badge" :class="`accion-${reg.accion}`">
                      {{ accionLabel(reg.accion) }}
                    </span>
                  </td>
                  <td class="text-gray">{{ reg.descripcion }}</td>
                </tr>
                <tr v-if="!cargando && registros.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No se encontraron registros.</td>
                </tr>
                <tr v-if="cargando">
                  <td colspan="4" class="text-center py-4 text-muted">Cargando...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-row" v-if="totalPages > 1">
            <button class="page-btn" :disabled="page <= 1" @click="cargar(page - 1)">
              <v-icon size="18">mdi-chevron-left</v-icon>
            </button>
            <span class="page-info">Página {{ page }} de {{ totalPages }}</span>
            <button class="page-btn" :disabled="page >= totalPages" @click="cargar(page + 1)">
              <v-icon size="18">mdi-chevron-right</v-icon>
            </button>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import api from '@/helpers/api'
import heroImage from '@/assets/ninas embarazadas -39.png'
import { exportarAuditoriaExcel, exportarAuditoriaPDF } from '@/composables/useExport'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const registros    = ref([])
const page         = ref(1)
const totalPages   = ref(1)
const cargando     = ref(false)
const accionFiltro = ref('')
const desde        = ref('')
const hasta        = ref('')
const exportando   = ref(false)

const ACCIONES = [
  { value: 'crear_caso',          label: 'Caso creado' },
  { value: 'actualizar_caso',     label: 'Caso actualizado' },
  { value: 'crear_usuario',       label: 'Usuario creado' },
  { value: 'actualizar_usuario',  label: 'Usuario actualizado' },
  { value: 'activar_usuario',     label: 'Usuario activado' },
  { value: 'desactivar_usuario',  label: 'Usuario desactivado' },
  { value: 'descargar_pdf',       label: 'Descarga de PDF' },
  { value: 'descargar_excel',     label: 'Descarga de Excel' },
  { value: 'carga_masiva',        label: 'Carga masiva' },
]

function accionLabel(value) {
  return ACCIONES.find(a => a.value === value)?.label || value
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}

async function cargar(nuevaPagina = 1) {
  cargando.value = true
  try {
    const { data } = await api.get('/auditoria', {
      params: {
        page: nuevaPagina,
        accion: accionFiltro.value || undefined,
        desde: desde.value || undefined,
        hasta: hasta.value || undefined,
      }
    })
    registros.value = data.data
    page.value = data.page
    totalPages.value = data.totalPages
  } catch (error) {
    console.error('Error cargando auditoría:', error)
  } finally {
    cargando.value = false
  }
}

// Construye un texto legible con los filtros activos
function textoFiltros() {
  const partes = []
  if (accionFiltro.value) partes.push(`Acción: ${accionLabel(accionFiltro.value)}`)
  if (desde.value) partes.push(`Desde: ${desde.value}`)
  if (hasta.value) partes.push(`Hasta: ${hasta.value}`)
  return partes.join(' · ')
}

// Trae todos los registros que cumplan los filtros activos (sin paginar)
async function obtenerTodosLosRegistros() {
  const todos = []
  let pagina = 1
  let total = 1

  do {
    const { data } = await api.get('/auditoria', {
      params: {
        page: pagina,
        limit: 100,
        accion: accionFiltro.value || undefined,
        desde: desde.value || undefined,
        hasta: hasta.value || undefined,
      }
    })
    todos.push(...data.data)
    total = data.totalPages
    pagina++
  } while (pagina <= total)

  return todos
}

async function exportarExcelAuditoria() {
  if (exportando.value) return
  exportando.value = 'excel'
  try {
    const todos = await obtenerTodosLosRegistros()
    exportarAuditoriaExcel(todos, textoFiltros())
  } catch (error) {
    console.error('Error exportando auditoría a Excel:', error)
  } finally {
    exportando.value = false
  }
}

async function exportarPdfAuditoria() {
  if (exportando.value) return
  exportando.value = 'pdf'
  try {
    const todos = await obtenerTodosLosRegistros()
    await exportarAuditoriaPDF(todos, textoFiltros(), auth.user)
  } catch (error) {
    console.error('Error exportando auditoría a PDF:', error)
  } finally {
    exportando.value = false
  }
}

onMounted(() => cargar(1))
</script>

<style scoped>
.audit-page {
  background-color: #fcfcfc;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.container-max { max-width: 65rem; margin: 0 auto; padding: 0 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 4rem; }
.mt-6 { margin-top: 1.5rem; }

/* HERO */
.hero-dash { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg   { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
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
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; margin-bottom: 0; }

/* HEADER */
.audit-header    { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
.section-title   { font-size: 24px; font-weight: 700; color: #555555; margin-bottom: 0.25rem; line-height: 1.2; }
.section-subtitle { font-size: 14px; color: #ff9797; margin: 0; }

/* EXPORT BUTTONS */
.export-actions { display: flex; gap: 0.6rem; }
.export-btn {
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #e0e0e0; border-radius: 4px;
  background-color: #ffffff; color: #555555;
  font-size: 13px; font-weight: 600;
  padding: 0.5rem 1rem; cursor: pointer;
  transition: all 0.2s;
}
.export-btn:hover:not(:disabled) { border-color: #ff9797; color: #ff9797; }
.export-btn:disabled { opacity: 0.6; cursor: default; }
.excel-btn:hover:not(:disabled) { border-color: #137333; color: #137333; }
.pdf-btn:hover:not(:disabled)   { border-color: #c0392b; color: #c0392b; }

/* CARD */
.card-box { background-color: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; overflow: hidden; }

/* FILTERS */
.filters-row { display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f0f0f0; background-color: #fcfcfc; flex-wrap: wrap; }
.select-wrapper { position: relative; width: 220px; }
.filter-label { font-size: 12px; color: #888; position: absolute; top: -8px; left: 8px; background-color: #fcfcfc; padding: 0 4px; z-index: 1; }
.audit-select { width: 100%; appearance: none; background-color: transparent; border: 1px solid #e0e0e0; border-radius: 4px; padding: 0.4rem 2rem 0.4rem 0.75rem; font-size: 14px; color: #333; outline: none; cursor: pointer; height: 38px; }
.select-icon  { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #a0a0a0; }
.date-field   { position: relative; }
.date-input   { border: 1px solid #e0e0e0; border-radius: 4px; padding: 0.4rem 0.75rem; font-size: 14px; color: #333; outline: none; height: 38px; }

/* TABLE */
.table-responsive { width: 100%; overflow-x: auto; }
.audit-table { width: 100%; border-collapse: collapse; text-align: left; }
.audit-table th { background-color: #fcfcfc; color: #888888; font-size: 11px; font-weight: 600; text-transform: capitalize; padding: 0.8rem 1.5rem; white-space: nowrap; border-bottom: 1px solid #f0f0f0; }
.audit-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; font-size: 13px; }
.audit-table tr:last-child td { border-bottom: none; }

.user-name  { font-weight: 700; color: #1a1a1a; font-size: 13px; line-height: 1.2; }
.user-email { font-size: 12px; color: #a0a0a0; margin-top: 0.1rem; }
.text-gray  { color: #1a1a1a; font-size: 13px; }

/* BADGES */
.accion-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 11px; font-weight: 600; white-space: nowrap; background-color: #f5f5f5; color: #6d6d6d; }
.accion-crear_caso, .accion-crear_usuario        { background-color: #e6f4ea; color: #137333; }
.accion-actualizar_caso, .accion-actualizar_usuario { background-color: #fff3e0; color: #b06000; }
.accion-activar_usuario                          { background-color: #e6f4ea; color: #137333; }
.accion-desactivar_usuario                       { background-color: #fdecea; color: #c0392b; }
.accion-descargar_pdf, .accion-descargar_excel   { background-color: #e8f0fe; color: #1967d2; }
.accion-carga_masiva                             { background-color: #f3e8fd; color: #7b1fa2; }

/* PAGINATION */
.pagination-row { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem 1.5rem; border-top: 1px solid #f0f0f0; }
.page-btn { background: none; border: 1px solid #e0e0e0; border-radius: 4px; cursor: pointer; padding: 0.25rem; color: #6d6d6d; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-info { font-size: 13px; color: #6d6d6d; }

.text-center { text-align: center; }
.text-muted  { color: #a0a0a0; }
</style>
