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
                <button class="upload-btn" @click="abrirModalFecha">Subir archivos</button>
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
                    :disabled="ocupado"
                    @click="fileInputInicial.click()"
                  >
                    <v-icon size="14">mdi-database-import</v-icon>
                    {{ cargandoInicial ? 'Importando…' : 'Importar archivo SIRE' }}
                  </button>

                </div>
              </div>
            </div>
          </div>

          <!-- Base de quejas: botón propio. Agrega la queja a los casos que no la
               tienen y registra los que no existen, sin duplicar niñas; siempre
               pasa por una vista previa. Los otros botones también reconocen este
               formato y lo envían aquí. -->
          <div class="quejas-franja">
            <div class="quejas-icono">
              <v-icon size="26" color="#10233f">mdi-file-document-multiple-outline</v-icon>
            </div>
            <div class="quejas-texto">
              <div class="quejas-titulo">Importar quejas</div>
              <p class="quejas-desc">
                Base de quejas (Nombre completo, Código personal, Queja No., …). Agrega el número de
                queja a los casos que no lo tienen y registra los casos que no existen, sin duplicar
                niñas. Antes de guardar se muestra una vista previa.
              </p>
            </div>
            <input
              type="file"
              ref="fileInputQuejas"
              accept=".xlsx,.xls"
              class="file-input"
              @change="onArchivoQuejas"
            />
            <button class="quejas-btn" :disabled="ocupado" @click="fileInputQuejas.click()">
              <v-icon size="18">mdi-upload</v-icon>
              {{ quejas.cargando ? 'Procesando…' : 'Subir quejas' }}
            </button>
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
              <div class="resultado-item info">
                <div class="resultado-num">{{ resultadoInicial.actualizados ?? 0 }}</div>
                <div class="resultado-label">Queja agregada</div>
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

            <!-- Casos existentes a los que se les agregó la queja -->
            <div v-if="resultadoInicial.actualizadosDetalle?.length" class="detalle-bloque">
              <div class="detalle-titulo">
                <v-icon size="16" color="#1565c0">mdi-flag-plus-outline</v-icon>
                Queja agregada a casos existentes ({{ resultadoInicial.actualizadosDetalle.length }})
              </div>
              <div class="detalle-scroll">
                <table class="detalle-tabla">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>No. Caso</th>
                      <th>Nombre</th>
                      <th>CUI</th>
                      <th>Queja agregada</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="a in resultadoInicial.actualizadosDetalle" :key="'a' + a.fila">
                      <td class="col-fila">{{ a.fila }}</td>
                      <td>{{ a.numero_caso }}</td>
                      <td>{{ a.nombre || '—' }}</td>
                      <td>{{ a.cui || '—' }}</td>
                      <td class="col-queja">{{ a.queja }}</td>
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
              v-if="!resultadoInicial.fallidos?.length && !resultadoInicial.sinUbicacion?.length && !resultadoInicial.actualizadosDetalle?.length"
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

          <!-- Base de quejas: procesando / error / vista previa y resultado -->
          <div v-if="quejas.cargando" class="uploading-state">
            <v-progress-circular indeterminate color="#10233f" size="32" />
            <span>
              {{ quejas.cargando === 'vista'
                ? 'Analizando la base de quejas (todavía no se guarda nada)…'
                : 'Importando la base de quejas…' }}
            </span>
          </div>

          <div v-if="quejas.error && !quejas.cargando" class="validacion-error">
            <v-icon size="20" color="#c62828">mdi-alert-circle</v-icon>
            <div>
              <div class="val-title">No se pudo procesar la base de quejas</div>
              <div class="val-msg">{{ quejas.error }}</div>
            </div>
          </div>

          <div v-if="quejas.resultado && !quejas.cargando" class="resultado-card">
            <div class="inicial-head">
              <v-icon size="18" color="#10233f">mdi-file-document-multiple-outline</v-icon>
              <span>
                {{ quejas.resultado.simulacion ? 'Vista previa' : 'Importación completada' }}
                — {{ quejas.resultado.archivo }}
              </span>
            </div>

            <div v-if="quejas.resultado.simulacion" class="aviso-previa">
              <v-icon size="16" color="#1565c0">mdi-eye-outline</v-icon>
              Todavía no se guardó ningún cambio. Revise el detalle y presione «Confirmar importación».
            </div>
            <div v-for="a in quejas.resultado.advertencias" :key="a" class="resultado-warn-banner">
              <v-icon size="16" color="#e65100">mdi-information-outline</v-icon>
              {{ a }}
            </div>

            <div class="resultado-grid">
              <div v-for="t in tarjetasQuejas" :key="t.label" class="resultado-item" :class="t.clase">
                <div class="resultado-num">{{ t.valor }}</div>
                <div class="resultado-label">{{ t.label }}</div>
              </div>
            </div>

            <div v-for="b in bloquesQuejas" :key="b.clave" class="detalle-bloque">
              <div class="detalle-titulo">
                <v-icon size="16" :color="b.color">{{ b.icono }}</v-icon>
                {{ b.titulo }} ({{ b.filas.length }})
              </div>
              <p v-if="b.nota" class="detalle-nota">{{ b.nota }}</p>
              <div class="detalle-scroll">
                <table class="detalle-tabla">
                  <thead>
                    <tr><th v-for="c in b.columnas" :key="c.k">{{ c.h }}</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="f in b.filas" :key="b.clave + f.fila">
                      <td v-for="c in b.columnas" :key="c.k" :class="c.clase">{{ f[c.k] ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="inicial-actions">
              <button class="ghost-btn" @click="descargarDetalleQuejas">
                <v-icon size="15">mdi-microsoft-excel</v-icon>
                Descargar detalle
              </button>
              <template v-if="quejas.resultado.simulacion">
                <button class="ghost-btn" @click="cerrarQuejas">Cancelar</button>
                <button class="confirm-btn" @click="enviarQuejas(false)">
                  <v-icon size="15">mdi-check</v-icon>
                  Confirmar importación
                </button>
              </template>
              <button v-else class="clear-btn" @click="cerrarQuejas">LIMPIAR</button>
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
            mobile-breakpoint="sm"
          />
          <div v-else class="empty-state">No hay cargas registradas aún</div>
        </div>
      </div>
    </section>

    <!-- ── Modal: fecha de ingreso antes de subir MSPAS ── -->
    <div v-if="modalFecha" class="modal-overlay" @click.self="cerrarModalFecha">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-head">
          <v-icon size="20" color="#10233f">mdi-calendar-check</v-icon>
          <span>Fecha de ingreso del caso</span>
        </div>
        <p class="modal-text">
          Esta fecha se guardará como fecha de ingreso de todos los casos del archivo que vas a subir.
        </p>
        <input
          type="date"
          class="modal-date"
          v-model="fechaIngresoMasivo"
          :max="hoyISO"
          @keydown.enter="confirmarFecha"
        />
        <div class="modal-actions">
          <button class="modal-btn ghost" @click="cerrarModalFecha">Cancelar</button>
          <button class="modal-btn primary" :disabled="!fechaIngresoMasivo" @click="confirmarFecha">
            Continuar
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: año de las fechas de la base de quejas (trae Día/Mes sin año) ── -->
    <div v-if="quejas.modal" class="modal-overlay" @click.self="cerrarQuejas">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-head">
          <v-icon size="20" color="#10233f">mdi-file-document-multiple-outline</v-icon>
          <span>Importar base de quejas</span>
        </div>
        <div v-if="quejas.detectado" class="aviso-previa">
          <v-icon size="16" color="#1565c0">mdi-information-outline</v-icon>
          Este archivo tiene el formato de la base de quejas: se importará con el flujo de quejas.
        </div>
        <p class="modal-text">
          <strong>{{ quejas.archivo?.name }}</strong><br />
          Primero se mostrará una vista previa: no se guardará nada hasta que la confirme.
        </p>
        <label class="modal-label" for="anio-quejas">Año de las fechas (el archivo solo trae día y mes)</label>
        <input
          id="anio-quejas"
          type="number"
          class="modal-date"
          v-model.number="quejas.anio"
          :min="2000"
          :max="anioActual + 1"
          @keydown.enter="anioQuejasValido && enviarQuejas(true)"
        />
        <div class="modal-actions">
          <button class="modal-btn ghost" @click="cerrarQuejas">Cancelar</button>
          <button class="modal-btn primary" :disabled="!anioQuejasValido" @click="enviarQuejas(true)">
            Ver vista previa
          </button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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

// Fecha de ingreso para la carga MSPAS (botón azul), elegida en un modal
const fechaIngresoMasivo = ref('')
const modalFecha = ref(false)
const hoyISO = new Date().toISOString().slice(0, 10)

// Botón azul → abre el modal de fecha (no el selector de archivo directamente)
function abrirModalFecha() {
  fechaIngresoMasivo.value = ''
  modalFecha.value = true
}

function cerrarModalFecha() {
  modalFecha.value = false
}

// Con la fecha ya elegida se cierra el modal y se abre el selector de archivos
function confirmarFecha() {
  if (!fechaIngresoMasivo.value) return
  modalFecha.value = false
  fileInput.value.click()
}

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

// Formato "base de quejas": la fila con "Nombre completo" está entre las
// primeras y trae "Queja No." / "No. de queja", sin CUI. Cualquier botón de
// carga lo reconoce y lo envía al flujo de quejas en vez de rechazarlo.
const RE_COLUMNA_QUEJA = /queja\s*no\b|no\.?\s*de\s*queja|numero\s*de\s*queja/
async function esFormatoQuejas(file) {
  try {
    const wb   = XLSX.read(await file.arrayBuffer(), { type: 'array', sheetRows: 8 })
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null })
    const i = rows.findIndex(f => (f || []).some(c => norm(c).includes('nombre completo')))
    if (i < 0) return false
    const headers  = rows[i].filter(Boolean).map(c => norm(c))
    const tieneQueja = headers.some(h => RE_COLUMNA_QUEJA.test(h))
    const tieneCui   = headers.some(h => /\bcui\b/.test(h))
    // El formato SIRE también trae queja, pero con CUI y encabezados en la fila 5
    return tieneQueja && (!tieneCui || i < 4)
  } catch {
    return false
  }
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

  if (await esFormatoQuejas(file)) {
    if (fileInput.value) fileInput.value.value = ''
    abrirQuejas(file, true)
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
    // Fecha de ingreso elegida por el usuario para todos los casos de esta carga
    if (fechaIngresoMasivo.value) formData.append('fecha_ingreso', fechaIngresoMasivo.value)

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

  if (await esFormatoQuejas(file)) {
    if (fileInputInicial.value) fileInputInicial.value.value = ''
    abrirQuejas(file, true)
    return
  }

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

// ── Base de quejas ─────────────────────────────────────────────────────────
// Flujo en dos pasos sobre el mismo archivo: vista previa (simular=true, no
// guarda nada) y, si el usuario la confirma, la importación real.
const anioActual      = new Date().getFullYear()
const fileInputQuejas = ref(null)
const quejas = reactive({
  archivo:   null,
  anio:      anioActual,
  modal:     false,
  cargando:  false,     // 'vista' | 'importar' | false
  resultado: null,
  error:     null,
  detectado: false,     // true si llegó por otro botón y se reconoció el formato
})

const ocupado = computed(() => uploading.value || validando.value || cargandoInicial.value || !!quejas.cargando)
const anioQuejasValido = computed(() => Number.isInteger(quejas.anio) && quejas.anio >= 2000 && quejas.anio <= anioActual + 1)

function abrirQuejas(file, detectado = false) {
  quejas.archivo   = file
  quejas.resultado = null
  quejas.error     = null
  quejas.detectado = detectado
  quejas.modal     = true
}

function onArchivoQuejas(e) {
  const file = e.target.files?.[0]
  e.target.value = ''   // permite volver a elegir el mismo archivo
  if (file) abrirQuejas(file)
}

function cerrarQuejas() {
  quejas.modal     = false
  quejas.archivo   = null
  quejas.resultado = null
  quejas.error     = null
}

async function enviarQuejas(simular) {
  if (!quejas.archivo || !anioQuejasValido.value) return
  quejas.modal    = false
  quejas.cargando = simular ? 'vista' : 'importar'
  quejas.error    = null
  try {
    const formData = new FormData()
    formData.append('file', quejas.archivo)
    formData.append('anio', String(quejas.anio))
    formData.append('simular', String(simular))
    const { data } = await api.post('/upload/quejas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    quejas.resultado = data
    if (!simular) await fetchHistorial()
  } catch (error) {
    quejas.error = error.response?.data?.message || error.message
  } finally {
    quejas.cargando = false
  }
}

const tarjetasQuejas = computed(() => {
  const r = quejas.resultado
  if (!r) return []
  return [
    { label: 'Total filas',               valor: r.total },
    { label: 'Casos nuevos',              valor: r.nuevos,       clase: 'success' },
    { label: 'Queja agregada',            valor: r.actualizados, clase: 'info' },
    { label: 'Ya registradas (sin cambios)', valor: r.sinCambios },
    { label: 'Ya tienen otra queja',      valor: r.otraQueja,    clase: 'warn' },
    { label: 'Conflictos (no importados)', valor: r.conflictos,  clase: 'warn' },
  ]
})

// Tablas de detalle: solo las que tienen filas, primero lo que requiere revisión
const bloquesQuejas = computed(() => {
  const r = quejas.resultado
  if (!r) return []
  return [
    {
      clave: 'conflictos', titulo: 'Conflictos: no se importaron', icono: 'mdi-close-circle-outline', color: '#c62828',
      nota: 'Revise estos registros manualmente: los datos del archivo contradicen a un caso existente.',
      filas: r.conflictosDetalle,
      columnas: [{ h: 'Fila', k: 'fila', clase: 'col-fila' }, { h: 'Nombre', k: 'nombre' }, { h: 'Código personal', k: 'codigo' },
                 { h: 'Queja', k: 'queja' }, { h: 'Motivo', k: 'motivo', clase: 'col-motivo' }],
    },
    {
      clave: 'otra', titulo: 'Ya tienen otra queja: no se sobrescribió', icono: 'mdi-alert-outline', color: '#e65100',
      nota: 'Puede ser una segunda queja de la misma niña o un error de una carga anterior. La observación indica cuando la queja del archivo está registrada en el caso de otra niña.',
      filas: r.otraQuejaDetalle,
      columnas: [{ h: 'Fila', k: 'fila', clase: 'col-fila' }, { h: 'Caso', k: 'numero_caso' }, { h: 'Nombre', k: 'nombre' },
                 { h: 'Queja actual', k: 'queja_actual' }, { h: 'Queja del archivo', k: 'queja' },
                 { h: 'Observación', k: 'observacion', clase: 'col-motivo' }],
    },
    {
      clave: 'agregada', titulo: 'Queja agregada a casos existentes', icono: 'mdi-flag-plus-outline', color: '#1565c0',
      filas: r.quejaAgregadaDetalle,
      columnas: [{ h: 'Fila', k: 'fila', clase: 'col-fila' }, { h: 'Caso', k: 'numero_caso' }, { h: 'Nombre', k: 'nombre' },
                 { h: 'Queja agregada', k: 'queja', clase: 'col-queja' }],
    },
    {
      clave: 'nuevos', titulo: 'Casos nuevos', icono: 'mdi-account-plus-outline', color: '#2e7d32',
      filas: r.nuevosDetalle,
      columnas: [{ h: 'Fila', k: 'fila', clase: 'col-fila' }, { h: 'Caso', k: 'numero_caso' }, { h: 'Nombre', k: 'nombre' },
                 { h: 'Código personal', k: 'codigo' }, { h: 'Queja', k: 'queja' }],
    },
    {
      clave: 'ubicacion', titulo: 'Registrados sin ubicación completa', icono: 'mdi-map-marker-alert-outline', color: '#e65100',
      filas: r.sinUbicacion,
      columnas: [{ h: 'Fila', k: 'fila', clase: 'col-fila' }, { h: 'Caso', k: 'numero_caso' }, { h: 'Nombre', k: 'nombre' },
                 { h: 'Problema', k: 'motivo', clase: 'col-motivo' }],
    },
  ].filter(b => b.filas?.length)
})

// Excel con el detalle (una hoja por tabla) para revisar los pendientes
function descargarDetalleQuejas() {
  const r = quejas.resultado
  if (!r) return
  const wb = XLSX.utils.book_new()
  const resumen = [
    ['Archivo', r.archivo],
    ['Tipo', r.simulacion ? 'Vista previa (sin guardar)' : 'Importación'],
    ['Año de las fechas', r.anio],
    [],
    ...tarjetasQuejas.value.map(t => [t.label, t.valor]),
    [],
    ...(r.advertencias ?? []).map(a => ['Advertencia', a]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen')
  for (const b of bloquesQuejas.value) {
    const filas = b.filas.map(f => Object.fromEntries(b.columnas.map(c => [c.h, f[c.k] ?? ''])))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), b.titulo.slice(0, 31).replace(/[:\\/?*[\]]/g, ''))
  }
  const hoy = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `Detalle_base_quejas_${hoy}.xlsx`)
  // Contiene datos personales: queda en la bitácora como las demás descargas
  api.post('/auditoria/descarga', { tipo: 'excel', descripcion: `Descargó el detalle de la base de quejas "${r.archivo}"` }).catch(() => {})
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
.hero             { position: relative; width: 100%; overflow: hidden; height: clamp(260px, 45vw, 500px); }
.hero-bg          { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay     { position: absolute; inset: 0;
  background: linear-gradient(to bottom,
      rgba(16, 35, 63, 0) 0%,
      rgba(16, 35, 63, 0.2) 40%,
      rgba(16, 35, 63, 0.95) 100%); }
.hero-content     { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: clamp(1.75rem, 5vw, 3.5rem); padding-inline: 1.5rem; text-align: center; }
.hero-title       { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: clamp(2rem, 7vw, 4rem); font-weight: 700; line-height: 1.15; max-width: 900px; margin-bottom: 0; }
.hero-subtitle    { margin-top: 0.5rem; color: white; font-size: clamp(1rem, 3vw, 1.5rem); font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 700px; }

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
  font-size: clamp(1.35rem, 4vw, 2rem);
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
.field-value { font-size: 0.875rem; font-weight: 700; color: #333; overflow-wrap: anywhere; }

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
  flex-wrap: wrap;
  gap: 0.5rem;
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
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}
.inicial-actions .clear-btn { margin-top: 0; }

/* ── Base de quejas ── */
.quejas-franja {
  display: flex; align-items: center; gap: 1rem;
  margin-top: 1.5rem; padding: 1rem 1.25rem;
  background: #ffffff; border: 1px solid #d9e2f3; border-left: 4px solid #10233f;
  border-radius: 0.75rem;
}
.quejas-icono {
  flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%;
  background: #e3ecf8; display: flex; align-items: center; justify-content: center;
}
.quejas-texto { flex: 1; min-width: 0; }
.quejas-titulo { font-size: 1rem; font-weight: 700; color: #10233f; margin-bottom: 0.15rem; }
.quejas-desc { font-size: 0.78rem; color: #6d6d6d; line-height: 1.5; margin: 0; }
.quejas-btn {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  background: #10233f; color: #ffffff; border: none; border-radius: 0.5rem;
  padding: 0.7rem 1.4rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
.quejas-btn:hover:not(:disabled) { opacity: 0.9; }
.quejas-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.aviso-previa {
  display: flex; align-items: center; gap: 0.5rem;
  background: #e3f0fb; color: #0d47a1;
  border-radius: 0.5rem; padding: 0.55rem 0.75rem;
  font-size: 0.8rem; font-weight: 600; margin-bottom: 0.75rem;
}
.detalle-nota { font-size: 0.72rem; color: #6d6d6d; margin: 0 0 0.4rem; line-height: 1.45; }
.ghost-btn,
.confirm-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  border-radius: 0.5rem; padding: 0.625rem 1.1rem;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, background 0.2s;
}
.ghost-btn { background: #ffffff; color: #10233f; border: 1px solid #cfd6e0; }
.ghost-btn:hover { background: #f4f6f9; }
.confirm-btn { background: #10233f; color: #ffffff; border: none; }
.confirm-btn:hover { opacity: 0.9; }
.modal-label { display: block; font-size: 0.75rem; font-weight: 600; color: #10233f; margin-bottom: 0.35rem; }
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
.col-queja  { color: #1565c0; font-weight: 600; }

/* ── Modal de fecha de ingreso (carga MSPAS) ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 35, 63, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-box {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.modal-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 700;
  color: #10233f;
  margin-bottom: 0.5rem;
}
.modal-text {
  font-size: 0.8rem;
  color: #6d6d6d;
  line-height: 1.5;
  margin-bottom: 1rem;
}
.modal-date {
  width: 100%;
  border: 1px solid #cfd6e0;
  border-radius: 0.45rem;
  padding: 0.55rem 0.7rem;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 1.25rem;
}
.modal-date:focus { outline: none; border-color: #10233f; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}
.modal-btn {
  border-radius: 0.45rem;
  padding: 0.5rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 0.2s;
}
.modal-btn.primary { background: #10233f; color: #fff; }
.modal-btn.primary:disabled { opacity: 0.45; cursor: not-allowed; }
.modal-btn.primary:not(:disabled):hover { opacity: 0.9; }
.modal-btn.ghost { background: transparent; color: #6d6d6d; border-color: #d0d0d0; }
.modal-btn.ghost:hover { background: #f4f4f4; }

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
.resultado-item.info    { background: #e3f0fb; }
.resultado-num   { font-size: 2rem; font-weight: 700; color: #333; }
.resultado-item.success .resultado-num { color: #2e7d32; }
.resultado-item.warn    .resultado-num { color: #e65100; }
.resultado-item.info    .resultado-num { color: #1565c0; }
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
/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .content-section { padding: 2rem 1rem 0; }
  .main-card { padding: 1.25rem; }
  .card-right { padding: 0.75rem; }
}

@media (max-width: 600px) {
  .main-card { padding: 1rem; border-radius: 0.75rem; }
  .section-label { font-size: 16px; }
  .upload-btn { width: 100%; padding: 0.8rem 1.5rem; }
  .inicial-btn { padding: 0.6rem 0.9rem; font-size: 0.78rem; }
  .resultado-card { padding: 1rem; }
  .resultado-grid { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
  .resultado-item { padding: 0.75rem 0.5rem; }
  .resultado-num { font-size: 1.5rem; }
  .uploading-state { padding: 1.5rem 0.5rem; text-align: center; }
  .validacion-error,
  .validacion-warn { padding: 0.85rem 1rem; }
  .history-header { margin-top: 2rem; }
  .modal-actions .modal-btn { flex: 1; padding-block: 0.7rem; }
  .inicial-row { flex-direction: column; align-items: stretch; }
  .quejas-franja { flex-wrap: wrap; }
  .quejas-btn { width: 100%; }
  /* Las tablas de detalle se desplazan a lo ancho en vez de aplastar el motivo */
  .detalle-tabla { min-width: 620px; }
  .inicial-actions > * { flex: 1 1 100%; justify-content: center; }
}
</style>
