<template>
  <div class="charge-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="@/assets/hero_charge_data.jpg" alt="Hero background" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Importar datos</h1>
        <p class="hero-subtitle">sube y administra tus archivos web</p>
      </div>
    </section>

    <!-- ── MAIN CONTENT ── -->
    <section class="content-section">
      <div class="content-container">
        <div class="main-card">
          <div class="card-row">

            <!-- Left Column -->
            <div class="card-left">
              <div class="section-label">Importar excel</div>
              <h2 class="section-heading">Ministerio de salud pública y asistencia social<br />(MSPAS)</h2>

              <div v-if="lastUpload" class="last-upload-card">
                <div class="last-upload-header">
                  <v-icon size="18" color="primary">mdi-circle</v-icon>
                  <span class="last-upload-title">Última carga</span>
                </div>
                <div class="last-upload-grid last-upload-grid--wide">
                  <div v-for="field in lastUploadFields" :key="field.label" class="last-upload-field">
                    <div class="field-label">{{ field.label }}</div>
                    <div class="field-value">{{ field.value }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="card-right">
              <div class="upload-zone">
                <img src="@/assets/upload_icon.png" alt="Upload icon" class="upload-img" />
                <div class="upload-text">Arrastre y suelte su archivo</div>
                <div class="upload-or">o</div>
                <input type="file" ref="fileInput" accept=".xlsx,.xls" class="file-input" @change="onFileChange" />
                <button class="upload-btn" @click="fileInput.click()">Subir archivos</button>
                <div class="upload-hint">Tamaño hasta 100 MB</div>

                <!-- Importación formato SIRE: flujo independiente del de arriba,
                     con sus propios estados y su propio endpoint. -->
                <div class="inicial-row">
                  <input
                    type="file"
                    ref="fileInputInicial"
                    accept=".xlsx,.xls"
                    class="file-input"
                    @change="onArchivoInicial"
                  />
                  <button
                    class="inicial-btn"
                    :disabled="uploading || validando || cargandoInicial"
                    @click="fileInputInicial.click()"
                  >
                    <v-icon size="14">mdi-database-import</v-icon>
                    {{ cargandoInicial ? 'Importando…' : 'Importar archivo SIRE' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Resultado de la carga inicial (flujo propio, no pisa el de arriba) -->
          <div v-if="resultadoInicial" class="resultado-card">
            <div class="inicial-head">
              <v-icon size="18" color="#10233f">mdi-database-import</v-icon>
              <span>Carga inicial — {{ resultadoInicial.archivo }}</span>
            </div>
            <div class="resultado-grid">
              <div class="resultado-item">
                <div class="resultado-num">{{ resultadoInicial.total }}</div>
                <div class="resultado-label">Total filas</div>
              </div>
              <div class="resultado-item success">
                <div class="resultado-num">{{ resultadoInicial.nuevos }}</div>
                <div class="resultado-label">Casos registrados</div>
              </div>
              <div class="resultado-item warn">
                <div class="resultado-num">{{ resultadoInicial.duplicados }}</div>
                <div class="resultado-label">No insertados</div>
              </div>
              <div class="resultado-item warn">
                <div class="resultado-num">{{ resultadoInicial.sinUbicacion?.length ?? 0 }}</div>
                <div class="resultado-label">Sin ubicación</div>
              </div>
            </div>
            <!-- Registros NO insertados, con el motivo de cada uno -->
            <div v-if="resultadoInicial.fallidos?.length" class="detalle-bloque">
              <div class="detalle-titulo">
                <v-icon size="16" color="#c62828">mdi-close-circle-outline</v-icon>
                No insertados ({{ resultadoInicial.fallidos.length }})
              </div>
              <div class="detalle-scroll">
                <table class="detalle-tabla">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Nombre</th>
                      <th>CUI</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="f in resultadoInicial.fallidos" :key="'f' + f.fila">
                      <td class="col-fila">{{ f.fila }}</td>
                      <td>{{ f.nombre || '—' }}</td>
                      <td>{{ f.cui || '—' }}</td>
                      <td class="col-motivo">{{ f.motivo }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Insertados pero sin ubicación resuelta -->
            <div v-if="resultadoInicial.sinUbicacion?.length" class="detalle-bloque">
              <div class="detalle-titulo">
                <v-icon size="16" color="#e65100">mdi-map-marker-alert-outline</v-icon>
                Insertados sin ubicación completa ({{ resultadoInicial.sinUbicacion.length }})
              </div>
              <div class="detalle-scroll">
                <table class="detalle-tabla">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Nombre</th>
                      <th>Problema</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="u in resultadoInicial.sinUbicacion" :key="'u' + u.fila">
                      <td class="col-fila">{{ u.fila }}</td>
                      <td>{{ u.nombre || '—' }}</td>
                      <td class="col-motivo">{{ u.problema }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div
              v-if="!resultadoInicial.fallidos?.length && !resultadoInicial.sinUbicacion?.length"
              class="detalle-ok"
            >
              <v-icon size="16" color="#2e7d32">mdi-check-circle-outline</v-icon>
              Todos los registros se importaron sin observaciones.
            </div>

            <div class="inicial-actions">
              <button class="clear-btn" @click="resultadoInicial = null">LIMPIAR</button>
            </div>
          </div>

          <!-- Error de la carga inicial -->
          <div v-if="errorInicial" class="validacion-error">
            <v-icon size="20" color="#c62828">mdi-alert-circle</v-icon>
            <div>
              <div class="val-title">No se pudo ejecutar la carga inicial</div>
              <div class="val-msg">{{ errorInicial }}</div>
            </div>
          </div>

          <!-- Validando / Cargando -->
          <div v-if="cargandoInicial" class="uploading-state">
            <v-progress-circular indeterminate color="#10233f" size="32" />
            <span>Ejecutando carga inicial, puede tardar unos segundos…</span>
          </div>

          <div v-if="validando || uploading" class="uploading-state">
            <v-progress-circular indeterminate color="#ff9797" size="32" />
            <span>{{ validando ? 'Validando archivo...' : 'Procesando, por favor espere...' }}</span>
          </div>

          <!-- Error de validación -->
          <div v-if="validacion?.error && !uploading && !validando" class="validacion-error">
            <v-icon size="20" color="#c62828">mdi-alert-circle</v-icon>
            <div>
              <div class="val-title">Archivo rechazado — {{ validacion.nombreArchivo }}</div>
              <div class="val-msg">{{ validacion.error }}</div>
              <div class="val-hint">Columnas esperadas: Nombre completo, CUI RENAP, Departamento, Fecha Primer Contacto, Edad Años, Fecha Nacimiento, Dirección, Pueblo, Comunidad Lingüística, Numero de notificación, Institución</div>
            </div>
          </div>

          <!-- Advertencias (columnas faltantes no bloqueantes) -->
          <div v-if="validacion?.advertencias?.length && !validacion.error && !uploading && !validando && !resultado" class="validacion-warn">
            <v-icon size="18" color="#e65100">mdi-alert-outline</v-icon>
            <div>
              <div class="val-title">Archivo: {{ validacion.nombreArchivo }}</div>
              <div v-for="a in validacion.advertencias" :key="a" class="val-msg">{{ a }}</div>
            </div>
          </div>

          <!-- Resultado -->
          <div v-if="resultado && !uploading && !validando" class="resultado-card">
            <div v-if="validacion?.advertencias?.length" class="resultado-warn-banner">
              <v-icon size="16" color="#e65100">mdi-alert-outline</v-icon>
              {{ validacion.advertencias[0] }}
            </div>
            <div class="resultado-grid">
              <div class="resultado-item">
                <div class="resultado-num">{{ resultado.total }}</div>
                <div class="resultado-label">Total filas</div>
              </div>
              <div class="resultado-item success">
                <div class="resultado-num">{{ resultado.nuevos }}</div>
                <div class="resultado-label">Casos registrados</div>
              </div>
              <div class="resultado-item warn">
                <div class="resultado-num">{{ resultado.duplicados }}</div>
                <div class="resultado-label">Omitidos / duplicados</div>
              </div>
            </div>
            <button class="clear-btn" @click="clearResultado">LIMPIAR</button>
          </div>
        </div>

        <!-- Historial -->
        <div class="history-header">
          <v-icon size="28" color="green-darken-3">mdi-bookshelf</v-icon>
          <h2 class="history-title">Historial de cargas</h2>
        </div>

        <div class="history-card">
          <v-data-table
            v-if="uploadHistory.length"
            :headers="historyHeaders"
            :items="uploadHistory"
            density="comfortable"
             items-per-page-text="Registros por página"
          />
          <div v-else class="empty-state">No hay cargas registradas aún</div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import api from '@/helpers/api'

// ── State ──────────────────────────────────────────────
const fileInput     = ref(null)
const uploading     = ref(false)
const validando     = ref(false)
const resultado     = ref(null)
const lastUpload    = ref(null)
const uploadHistory = ref([])
const validacion    = ref(null)   // { error, advertencias, nombreArchivo }

// ── Constants ──────────────────────────────────────────
const historyHeaders = [
  {
    title: 'Archivo',
    key: 'nombre_archivo',
    headerProps: {
      style: 'background-color: #10233f; color: white;'
    }
  },
  {
    title: 'Total',
    key: 'total_registros',
    headerProps: {
      style: 'background-color: #10233f; color: white;'
    }
  },
  {
    title: 'Nuevos',
    key: 'registros_nuevos',
    headerProps: {
      style: 'background-color: #10233f; color: white;'
    }
  },
  {
    title: 'Duplicados',
    key: 'registros_duplicados',
    headerProps: {
      style: 'background-color: #10233f; color: white;'
    }
  },
  {
    title: 'Subido por',
    key: 'usuario_nombre',
    headerProps: {
      style: 'background-color: #10233f; color: white;'
    }
  },
  {
    title: 'Fecha',
    key: 'fecha_fmt',
    headerProps: {
      style: 'background-color: #10233f; color: white;'
    }
  },
]

// Columnas esperadas en el archivo MSPAS
const COLS_OBLIGATORIAS = [
  { patron: 'nombre completo', label: 'Nombre completo' },
]
const COLS_IMPORTANTES = [
  { patron: 'cui renap',             label: 'CUI RENAP' },
  { patron: 'departamento',          label: 'Departamento' },
  { patron: 'fecha primer contacto', label: 'Fecha Primer Contacto' },
  { patron: 'edad',                  label: 'Edad Años' },
  { patron: 'fecha nacimiento',      label: 'Fecha Nacimiento' },
]

// ── Computed ───────────────────────────────────────────
const lastUploadFields = computed(() => {
  if (!lastUpload.value) return []
  return [
    { label: 'Archivo',    value: lastUpload.value.nombre_archivo },
    { label: 'Total',      value: lastUpload.value.total_registros },
    { label: 'Nuevos',     value: lastUpload.value.registros_nuevos },
    { label: 'Duplicados', value: lastUpload.value.registros_duplicados },
    { label: 'Fecha',      value: lastUpload.value.fecha_fmt },
  ]
})

// ── Lifecycle ──────────────────────────────────────────
onMounted(fetchHistorial)

async function fetchHistorial() {
  try {
    const res = await api.get('/upload/historial')
    uploadHistory.value = res.data.data.map(formatEntry)
    lastUpload.value    = uploadHistory.value[0] ?? null
  } catch {
    uploadHistory.value = []
  }
}

function formatEntry(d) {
  const fecha = new Date(d.fecha_carga)
  return {
    ...d,
    usuario_nombre: d.usuario?.name ?? d.usuario?.email ?? `Usuario #${d.usuario_id ?? '?'}`,
    fecha_fmt: fecha.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })
              + ' ' + fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
  }
}

// ── Validación de columnas (client-side, sin enviar al backend) ────────────
const norm = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

async function validarColumnas(file) {
  const buf  = await file.arrayBuffer()
  const wb   = XLSX.read(buf, { type: 'array', sheetRows: 8 })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  // Detectar fila de cabeceras (primeras 7 filas)
  let headers = []
  for (const fila of rows.slice(0, 7)) {
    const celdas = (fila || []).filter(Boolean).map(c => norm(c))
    const esHeader = celdas.some(c =>
      c.includes('nombre completo') || c.includes('cui renap') || c.includes('cui')
    )
    if (esHeader) { headers = celdas; break }
  }

  const tiene = (patron) => headers.some(h => h.includes(patron))

  const faltanObligatorias = COLS_OBLIGATORIAS.filter(c => !tiene(c.patron)).map(c => c.label)
  const faltanImportantes  = COLS_IMPORTANTES.filter(c => !tiene(c.patron)).map(c => c.label)

  return { headers, faltanObligatorias, faltanImportantes }
}

// ── Upload ─────────────────────────────────────────────
async function onFileChange(payload) {
  const file =
    payload?.target?.files?.[0]
    ?? (payload instanceof File ? payload : null)
    ?? (Array.isArray(payload) ? payload[0] : null)

  if (!file) return
  if (!file.name.match(/\.(xls|xlsx)$/)) {
    validacion.value = { error: 'Solo se aceptan archivos Excel (.xlsx / .xls)', advertencias: [], nombreArchivo: file.name }
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  // 1. Validar columnas antes de enviar
  validando.value = true
  validacion.value = null
  resultado.value  = null

  try {
    const { faltanObligatorias, faltanImportantes } = await validarColumnas(file)

    if (faltanObligatorias.length > 0) {
      validacion.value = {
        error: `El archivo no contiene las columnas obligatorias: ${faltanObligatorias.join(', ')}`,
        advertencias: [],
        nombreArchivo: file.name,
      }
      if (fileInput.value) fileInput.value.value = ''
      return
    }

    validacion.value = {
      error: null,
      advertencias: faltanImportantes.length
        ? [`Columnas no encontradas (los casos quedarán incompletos): ${faltanImportantes.join(', ')}`]
        : [],
      nombreArchivo: file.name,
    }
  } catch (e) {
    validacion.value = { error: 'No se pudo leer el archivo: ' + e.message, advertencias: [], nombreArchivo: file.name }
    if (fileInput.value) fileInput.value.value = ''
    return
  } finally {
    validando.value = false
  }

  // 2. Enviar al backend
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload/masivo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    const data = response.data
    resultado.value = { total: data.total, nuevos: data.nuevos, duplicados: data.duplicados }

    // Diagnóstico en consola
    console.group(`%c Carga masiva — ${file.name}`, 'color:#ff9797;font-weight:bold;font-size:14px')
    console.log('Respuesta:', data)
    console.log(`Fila cabecera: ${data._debug?.fila_cabecera}`)
    console.log('Columnas:', data._debug?.columnas_detectadas)
    if (data._debug?.omitidos_muestra?.length) {
      console.group('%c Filas omitidas', 'color:orange')
      data._debug.omitidos_muestra.forEach(r => console.warn(r))
      console.groupEnd()
    }
    if (data.nuevos === 0) console.warn('%c 0 casos registrados — revisa el formato del archivo', 'color:orange;font-weight:bold')
    console.groupEnd()

    await fetchHistorial()

  } catch (error) {
    const msg = error.response?.data?.message || error.message
    validacion.value = { ...validacion.value, error: 'Error en la carga: ' + msg }
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function clearResultado() {
  resultado.value  = null
  validacion.value = null
}

// ── Carga inicial desde el Excel semilla del servidor ──────────────────────
// Flujo aparte del de "Subir archivos": no envía archivo, solo dispara el
// proceso en el backend, que aplica las mismas validaciones de la carga masiva
// (deduplicación, ubicación con Fuse, nivel canónico, estado según queja).
const fileInputInicial = ref(null)
const cargandoInicial  = ref(false)
const resultadoInicial = ref(null)
const errorInicial     = ref(null)

async function onArchivoInicial(payload) {
  const file = payload?.target?.files?.[0]
  if (!file) return

  cargandoInicial.value  = true
  errorInicial.value     = null
  resultadoInicial.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post('/upload/inicial', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    resultadoInicial.value = data
    await fetchHistorial()
  } catch (error) {
    errorInicial.value = error.response?.data?.message || error.message
  } finally {
    cargandoInicial.value = false
    // Permite volver a elegir el mismo archivo si se reintenta
    if (fileInputInicial.value) fileInputInicial.value.value = ''
  }
}
</script>

<style scoped>
/* ── BASE ── */
.charge-page {
  background-color: #ffffff;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

/* ── HERO ── */
.hero             { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg          { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay     { position: absolute; inset: 0;
  background: linear-gradient(to bottom,
      rgba(16, 35, 63, 0) 0%,
      rgba(16, 35, 63, 0.2) 40%,
      rgba(16, 35, 63, 0.95) 100%); }
.hero-content     { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 3.5rem; padding-inline: 1.5rem; text-align: center; }
.hero-title       { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; max-width: 900px; margin-bottom: 0; }
.hero-subtitle    { margin-top: 0.5rem; color: white; font-size: 1.5rem; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 700px; }

/* ── CONTENT SECTION ── */
.content-section  { background-color: #ffffff; padding: 3rem 1.5rem 0; }
.content-container { max-width: 1000px; margin: 0 auto; }

/* ── MAIN CARD ── */
.main-card {
  background-color: #f5f5f5;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 768px) {
  .card-row { grid-template-columns: 1fr; }
}

/* ── LEFT COLUMN ── */
.section-label {
  color: primary;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.section-heading {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  line-height: 1.25;
  margin-bottom: 1.5rem;
}

/* ── LAST UPLOAD CARD ── */
.last-upload-card {
  background-color: #ffffff;
  border-radius: 0.2rem;
  padding: 1rem 1.25rem;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.last-upload-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.last-upload-title {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
}
.last-upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.last-upload-grid--wide {
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
}
.field-label { font-size: 0.75rem; color: #9e9e9e; }
.field-value { font-size: 0.875rem; font-weight: 700; color: #333; }

/* ── UPLOAD ZONE ── */
.card-right {
  display: flex;
  align-items: stretch;
  justify-content: center;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 1rem;
}
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 1.5rem;
  border: 2px dashed #a8cce8;
  border-radius: 0.5rem;
  background-color: #ffffff;
  width: 100%;
  transition: all 0.2s ease;
}
.upload-zone:hover {
  background-color: #f8fbff;
  border-color: #7bb3d8;
}
.upload-img  { width: 70px; height: 70px; object-fit: contain; margin-bottom: 0.5rem; }
.upload-text { color: #6d6d6d; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
.upload-or {
  color: #b0b0b0;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 80%;
}
.upload-or::before,
.upload-or::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #97a9ff;
}
.file-input  { display: none; }
.upload-btn {
  background-color: #10233f;
  color: white;
  border-radius: 0.5rem;
  border: none;
  padding: 0.625rem 2.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.upload-btn:hover { opacity: 0.9; }
.upload-hint { margin-top: 0.5rem; font-size: 0.7rem; color: #9e9e9e; }

/* ── Carga inicial (botón pequeño, secundario al de subir archivos) ── */
.inicial-row {
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px dashed #e0e0e0;
  width: 100%;
  display: flex;
  justify-content: center;
}
.inicial-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  color: #10233f;
  border: 1px solid #10233f;
  border-radius: 0.4rem;
  padding: 0.3rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.inicial-btn:hover:not(:disabled) { background: #10233f; color: #fff; }
.inicial-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.inicial-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #10233f;
  margin-bottom: 0.75rem;
}
.inicial-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}
/* ── Detalle de registros no insertados (en pantalla) ── */
.detalle-bloque {
  margin-top: 1rem;
  text-align: left;
}
.detalle-titulo {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #10233f;
  margin-bottom: 0.4rem;
}
/* Altura acotada: con cientos de filas la tarjeta no crece sin control */
.detalle-scroll {
  max-height: 260px;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 0.4rem;
}
.detalle-tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
}
.detalle-tabla thead th {
  position: sticky;
  top: 0;
  background: #10233f;
  color: #fff;
  text-align: left;
  padding: 0.4rem 0.55rem;
  font-weight: 600;
  white-space: nowrap;
}
.detalle-tabla td {
  padding: 0.35rem 0.55rem;
  border-top: 1px solid #eee;
  color: #4a4a4a;
  vertical-align: top;
}
.detalle-tabla tbody tr:nth-child(even) { background: #fafafa; }
.col-fila   { width: 3rem; font-variant-numeric: tabular-nums; color: #6d6d6d; }
.col-motivo { color: #c62828; }

.detalle-ok {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  justify-content: center;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #2e7d32;
}

/* ── RESULTS ── */
.result-alert { margin-top: 2rem; border-radius: 0.5rem; }
.data-table   { margin-top: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.clear-btn {
  margin-top: 1.5rem;
  background-color: #ff9797;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.clear-btn:hover { opacity: 0.9; }

/* ── UPLOADING ── */
.uploading-state {
  display: flex; align-items: center; gap: 1rem; justify-content: center;
  padding: 2.5rem; color: #6d6d6d; font-size: 0.9rem; margin-top: 1.5rem;
}

/* ── RESULTADO ── */
.resultado-card {
  margin-top: 2rem;
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.resultado-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.resultado-item {
  text-align: center; padding: 1rem; border-radius: 0.5rem; background: #f5f5f5;
}
.resultado-item.success { background: #e8f5e9; }
.resultado-item.warn    { background: #fff3e0; }
.resultado-num   { font-size: 2rem; font-weight: 700; color: #333; }
.resultado-item.success .resultado-num { color: #2e7d32; }
.resultado-item.warn    .resultado-num { color: #e65100; }
.resultado-label { font-size: 0.75rem; color: #9e9e9e; margin-top: 0.25rem; }

/* ── HISTORY ── */
.history-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 3rem 0 1rem;
}
.history-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #333;
}
.history-card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 2.5rem;
}
.empty-state {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #9e9e9e;
}

/* ── VALIDACIÓN ── */
.validacion-error,
.validacion-warn {
  margin-top: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
}
.validacion-error {
  background: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
}
.validacion-warn {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  color: #e65100;
}
.val-title { font-weight: 700; margin-bottom: 0.25rem; font-size: 0.875rem; }
.val-msg   { font-size: 0.82rem; margin-bottom: 0.15rem; }
.val-hint  {
  margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.75;
  font-style: italic; line-height: 1.5;
}
.resultado-warn-banner {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fff3e0; color: #e65100;
  border-radius: 0.5rem; padding: 0.5rem 0.75rem;
  font-size: 0.78rem; margin-bottom: 1rem;
}
</style>
