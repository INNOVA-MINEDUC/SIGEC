<template>
  <div class="landing-page">
    <AppNavbar />

    <section class="hero">
      <img src="/imgs/img3.jpg" alt="Persona escribiendo en laptop" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
<p class="hero-top-text">Registra tu caso</p>
<h1 class="hero-title">registro seguro y confidencial</h1>
<p class="hero-subtitle">
  Cada caso registrado se almacena de forma segura en el sistema,
  permitiendo un control y seguimiento centralizado a nivel nacional,
  con acceso restringido y confidencial durante todo el proceso.
</p>
      </div>
    </section>


    <section class="form-section">
      <div class="form-container">

        <div class="step-indicator">
          <template v-for="(stepObj, i) in STEPS" :key="stepObj.number">
            <div class="step-wrapper">
              <div class="step-node-content">
                <div class="step-circle" :class="{ active: stepObj.number <= step }">
                  {{ stepObj.number }}
                </div>
                <span class="step-label" :class="{ active: stepObj.number === step, done: stepObj.number < step }">
                  {{ stepObj.label }}
                </span>
              </div>
              <div v-if="i < STEPS.length - 1" class="step-line" :class="{ active: stepObj.number < step }"></div>
            </div>
          </template>
        </div>

        <div class="form-card">

          <div v-if="casoId" class="update-banner">
            <v-icon size="16" color="#ff9797">mdi-pencil-circle-outline</v-icon>
            Actualizando caso {{ form.noCaso }} — todos los campos son editables
          </div>

          <Transition name="step-fade" mode="out-in">
          <!-- STEP 1 -->
          <div v-if="step === 1" key="step-1">
            <div class="form-header">
              <h2>Información General del Caso:</h2>
              <p class="text-pink-alert">Recuerda llenar toda la información del FORMULARIO</p>
              <p class="text-gray-info">Ingresa los datos de identificación y registro del caso.</p>
            </div>
            <div class="form-grid">

              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-file-document-outline</v-icon>
                  <input type="text" v-model="form.numeroQueja" placeholder="Número de Queja" />
                </div>
                <div class="input-box w-50 numero-auto">
                  <v-icon size="16" class="input-icon">mdi-auto-fix</v-icon>
                  <input type="text" v-model="form.noCaso" readonly placeholder="Generando..." />
                </div>
              </div>

              <p class="text-gray-info" style="margin: 0.25rem 0 0 0;">Fecha de ingreso del caso:</p>
              <div class="field-row">
                <div class="input-box" style="flex: 1;">
                  <select v-model="form.fechaIngresoDia" :class="{ 'empty-select': !form.fechaIngresoDia }">
                    <option value="" disabled selected>Día</option>
                    <option v-for="d in DIAS" :key="d" :value="d">{{ d }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box" style="flex: 2;">
                  <select v-model="form.fechaIngresoMes" :class="{ 'empty-select': !form.fechaIngresoMes }">
                    <option value="" disabled selected>Mes</option>
                    <option v-for="(m, i) in MESES" :key="m" :value="i + 1">{{ m }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box" style="flex: 1;">
                  <select v-model="form.fechaIngresoAno" :class="{ 'empty-select': !form.fechaIngresoAno }">
                    <option value="" disabled selected>Año</option>
                    <option v-for="a in ANOS" :key="a" :value="a">{{ a }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
              </div>

              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-map-marker-outline</v-icon>
                <select v-model="form.direccionDepartamental" :class="{ 'empty-select': !form.direccionDepartamental }">
                  <option value="" disabled selected>Dirección Departamental de Educación</option>
                  <option v-for="d in departamentales" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                </select>
                <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
              </div>

            </div>
            <p v-if="errores && step === 1" class="error-msg">{{ errores }}</p>
            <div class="form-actions">
              <button class="btn-prev" disabled>PREVIOUS</button>
              <button class="btn-next" @click="validarStep(1) && (step = 2, errores = '')">Siguiente</button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div v-else-if="step === 2" key="step-2">
            <div class="form-header">
              <h2>Datos Generales de la Niña:</h2>
              <p class="text-pink-alert">Recuerda llenar toda la información del FORMULARIO</p>
              <p class="text-gray-info">Toda la información del menor se maneja bajo estricta confidencialidad.</p>
            </div>
            <div class="form-grid">

              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-card-account-details-outline</v-icon>
                <input type="text" v-model="form.cui" placeholder="CUI" />
              </div>

              <p class="text-gray-info" style="margin: 0.25rem 0 0 0;">Fecha de primera consulta:</p>
              <div class="field-row">
                <div class="input-box" style="flex: 1;">
                  <select v-model="form.consultaDia" :class="{ 'empty-select': !form.consultaDia }">
                    <option value="" disabled selected>Día</option>
                    <option v-for="d in DIAS" :key="d" :value="d">{{ d }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box" style="flex: 2;">
                  <select v-model="form.consultaMes" :class="{ 'empty-select': !form.consultaMes }">
                    <option value="" disabled selected>Mes</option>
                    <option v-for="(m, i) in MESES" :key="m" :value="i + 1">{{ m }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box" style="flex: 1;">
                  <select v-model="form.consultaAno" :class="{ 'empty-select': !form.consultaAno }">
                    <option value="" disabled selected>Año</option>
                    <option v-for="a in ANOS" :key="a" :value="a">{{ a }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
              </div>

              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-account-outline</v-icon>
                <input type="text" v-model="form.nombreCompleto" placeholder="Nombre completo de la niña" />
              </div>

              <p class="text-gray-info" style="margin: 0.25rem 0 0 0;">Fecha de nacimiento:</p>
              <div class="field-row">
                <div class="input-box" style="flex: 1;">
                  <select v-model="form.nacimientoDia" :class="{ 'empty-select': !form.nacimientoDia }">
                    <option value="" disabled selected>Día</option>
                    <option v-for="d in DIAS" :key="d" :value="d">{{ d }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box" style="flex: 2;">
                  <select v-model="form.nacimientoMes" :class="{ 'empty-select': !form.nacimientoMes }">
                    <option value="" disabled selected>Mes</option>
                    <option v-for="(m, i) in MESES" :key="m" :value="i + 1">{{ m }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box" style="flex: 1;">
                  <select v-model="form.nacimientoAno" :class="{ 'empty-select': !form.nacimientoAno }">
                    <option value="" disabled selected>Año</option>
                    <option v-for="a in ANOS_NACIMIENTO" :key="a" :value="a">{{ a }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
              </div>

              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-account-clock-outline</v-icon>
                  <input type="number" v-model="form.edad" placeholder="Edad" min="0" max="18" />
                </div>
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-home-outline</v-icon>
                  <input type="text" v-model="form.direccionNina" placeholder="Dirección de residencia" />
                </div>
              </div>

              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-map-marker-radius-outline</v-icon>
                  <select v-model="form.departamentoNina" :class="{ 'empty-select': !form.departamentoNina }">
                    <option value="" disabled selected>Departamento de residencia</option>
                    <option v-for="d in departamentos" :key="d.id" :value="d.id">{{ toTitleCase(d.nombre) }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-map-legend</v-icon>
                  <select v-model="form.municipioNina" :class="{ 'empty-select': !form.municipioNina }" :disabled="!form.departamentoNina">
                    <option value="" disabled selected>{{ form.departamentoNina ? 'Municipio de residencia' : 'Selecciona un departamento primero' }}</option>
                    <option v-for="m in municipiosNina" :key="m.id" :value="m.id">{{ toTitleCase(m.nombre) }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
              </div>

              <div class="field-row">
                <div class="input-box" :class="form.institucion ? 'w-50' : ''">
                  <v-icon size="16" class="input-icon">mdi-office-building-marker-outline</v-icon>
                  <select v-model="form.institucion" :class="{ 'empty-select': !form.institucion }">
                    <option value="" disabled selected>Institución que reporta</option>
                    <option v-for="inst in INSTITUCIONES" :key="inst" :value="inst">{{ inst }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div v-if="form.institucion" class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-bell-outline</v-icon>
                  <input type="text" v-model="form.noNotificacion" placeholder="No. de Notificación" />
                </div>
              </div>

              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-account-group-outline</v-icon>
                  <select v-model="form.puebloPertenencia" :class="{ 'empty-select': !form.puebloPertenencia }">
                    <option value="" disabled selected>Pueblo de pertenencia</option>
                    <option v-for="p in PUEBLOS_LIST" :key="p" :value="p">{{ p }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-translate</v-icon>
                  <select v-model="form.comunidadLinguistica" :class="{ 'empty-select': !form.comunidadLinguistica }">
                    <option value="" disabled selected>Comunidad Lingüística</option>
                    <option v-for="c in COMUNIDADES_LIST" :key="c" :value="c">{{ c }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
              </div>

            </div>
            <p v-if="errores && step === 2" class="error-msg">{{ errores }}</p>
            <div class="form-actions">
              <button class="btn-prev" @click="step = 1; errores = ''">PREVIOUS</button>
              <button class="btn-next" @click="validarStep(2) && (step = 3, errores = '')">Siguiente</button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div v-else key="step-3">
            <div class="form-header">
              <h2>Situación de la Niña dentro del Sistema Educativo:</h2>
              <p class="text-pink-alert">Recuerda llenar toda la información del FORMULARIO</p>
              <p class="text-gray-info">Ingrese los datos correspondientes al centro de estudios.</p>
            </div>
            <div class="form-grid">

              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-barcode-scan</v-icon>
                  <input type="text" v-model="form.codigoPersonal" placeholder="Código Personal" />
                </div>
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-list-status</v-icon>
                  <select v-model="form.statusActual" :class="{ 'empty-select': !form.statusActual }">
                    <option value="" disabled selected>Estado Actual dentro del Sistema Educativo</option>
                    <option v-for="st in STATUS_SISTEMA" :key="st" :value="st">{{ st }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
              </div>

              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-shape-outline</v-icon>
                <select v-model="form.subsistema" :class="{ 'empty-select': !form.subsistema }">
                  <option value="" disabled selected>Selecciona el subsistema</option>
                  <option v-for="sub in SUBSISTEMAS" :key="sub" :value="sub">{{ sub }}</option>
                </select>
                <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
              </div>

              <!-- SUBSISTEMA ESCOLAR -->
              <template v-if="form.subsistema === 'Subsistema Escolar'">

                <div class="input-box">
                  <v-icon size="16" class="input-icon">mdi-podium</v-icon>
                  <select v-model="form.nivel" :class="{ 'empty-select': !form.nivel }">
                    <option value="" disabled selected>Nivel</option>
                    <option v-for="n in NIVELES" :key="n.valor" :value="n.valor">{{ n.label }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>

                <div class="field-row">
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-school-outline</v-icon>
                    <select v-model="form.grado" :class="{ 'empty-select': !form.grado }">
                      <option value="" disabled selected>Grado</option>
                      <option v-for="g in GRADOS" :key="g" :value="g">{{ g }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-calendar-range</v-icon>
                    <select v-model="form.anoEducativo" :class="{ 'empty-select': !form.anoEducativo }">
                      <option value="" disabled selected>Año del ciclo escolar</option>
                      <option v-for="a in ANOS" :key="a" :value="a">{{ a }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                </div>

                <div class="field-row">
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-poll</v-icon>
                    <select v-model="form.resultado" :class="{ 'empty-select': !form.resultado }">
                      <option value="" disabled selected>Resultado académico</option>
                      <option v-for="r in RESULTADOS" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-identifier</v-icon>
                    <input type="text" v-model="form.codigoUdi" placeholder="Código UDI" />
                  </div>
                </div>

                <div class="field-row">
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-map-marker-radius-outline</v-icon>
                    <select v-model="form.departamentoEscuela" :class="{ 'empty-select': !form.departamentoEscuela }">
                      <option value="" disabled selected>Departamento</option>
                      <option v-for="d in departamentos" :key="d.id" :value="d.id">{{ toTitleCase(d.nombre) }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-map-legend</v-icon>
                    <select v-model="form.municipioEscuela" :class="{ 'empty-select': !form.municipioEscuela }" :disabled="!form.departamentoEscuela">
                      <option value="" disabled selected>{{ form.departamentoEscuela ? 'Municipio' : 'Selecciona un departamento primero' }}</option>
                      <option v-for="m in municipiosEscuela" :key="m.id" :value="m.id">{{ toTitleCase(m.nombre) }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                </div>

                <div class="input-box">
                  <v-icon size="16" class="input-icon">mdi-town-hall</v-icon>
                  <input type="text" v-model="form.nombreCentro" placeholder="Nombre del centro educativo" />
                </div>

                <div class="input-box">
                  <v-icon size="16" class="input-icon">mdi-map-marker-distance</v-icon>
                  <input type="text" v-model="form.direccionCentro" placeholder="Dirección del centro educativo" />
                </div>

                <div class="field-row">
                  <div class="input-box" style="flex:1;">
                    <select v-model="form.jornada" aria-placeholder="Jornada" :class="{ 'empty-select': !form.jornada }">
                      <option value="" disabled selected>Jornada</option>
                      <option v-for="j in JORNADAS" :key="j" :value="j">{{ j }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                  <div class="input-box" style="flex:1;">
                    <select v-model="form.area" :class="{ 'empty-select': !form.area }">
                      <option value="" disabled selected>Área</option>
                      <option v-for="a in AREAS" :key="a" :value="a">{{ a }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                  <div class="input-box" style="flex:1;">
                    <select v-model="form.sector" :class="{ 'empty-select': !form.sector }">
                      <option value="" disabled selected>Sector</option>
                      <option v-for="s in SECTORES" :key="s" :value="s">{{ s }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                </div>

              </template>

              <!-- SUBSISTEMA EXTRAESCOLAR -->
              <template v-else-if="form.subsistema === 'Subsistema Extraescolar'">

                <div class="input-box">
                  <v-icon size="16" class="input-icon">mdi-book-open-variant</v-icon>
                  <input type="text" v-model="form.programa" placeholder="Programa" />
                </div>

                <div class="field-row">
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-stairs</v-icon>
                    <select v-model="form.etapa" :class="{ 'empty-select': !form.etapa }">
                      <option value="" disabled selected>Etapa</option>
                      <option v-for="e in ETAPAS" :key="e" :value="e">{{ e }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                  <div class="input-box w-50">
                    <v-icon size="16" class="input-icon">mdi-calendar-range</v-icon>
                    <select v-model="form.anoEducativo" :class="{ 'empty-select': !form.anoEducativo }">
                      <option value="" disabled selected>Año del ciclo escolar</option>
                      <option v-for="a in ANOS" :key="a" :value="a">{{ a }}</option>
                    </select>
                    <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                  </div>
                </div>

                <div class="input-box">
                  <v-icon size="16" class="input-icon">mdi-poll</v-icon>
                  <select v-model="form.resultado" :class="{ 'empty-select': !form.resultado }">
                    <option value="" disabled selected>Resultado académico</option>
                    <option v-for="r in RESULTADOS" :key="r" :value="r">{{ r }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>

              </template>

              <!-- Estado — obligatorio solo al crear; en edición viene precargado y es opcional cambiarlo -->
              <div class="estado-wrapper">

                <!-- Indicador del estado actual (solo en modo actualización) -->
                <div v-if="estadoOriginal" class="estado-actual-banner">
                  <v-icon size="14">mdi-information-outline</v-icon>
                  Estado actual del caso:
                  <span class="estado-chip" :style="estadoChipStyle(estadoOriginal)">{{ estadoOriginal }}</span>
                </div>

                <div
                  class="input-box estado-box"
                  :class="{ 'estado-error': submitIntent && !casoId && !form.estado }"
                >
                  <v-icon
                    size="16"
                    class="input-icon"
                    :color="form.estado ? '#10233f' : submitIntent && !casoId ? '#e53935' : '#b0b0b0'"
                  >mdi-flag</v-icon>
                  <select v-model="form.estado" :class="{ 'empty-select': !form.estado }">
                    <option value="" disabled selected>
                      {{ casoId ? 'Estado del caso' : 'Estado del caso *' }}
                    </option>
                    <option
                      v-for="est in ESTADOS_CASO"
                      :key="est"
                      :value="est"
                    >{{ est }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>

                <!-- Alerta solo al crear un caso nuevo sin estado -->
                <div v-if="submitIntent && !casoId && !form.estado" class="estado-requerido">
                  <v-icon size="13" color="#e53935">mdi-alert-circle</v-icon>
                  El estado es obligatorio
                </div>

              </div>

            </div>
            <p v-if="errores && step === 3" class="error-msg">{{ errores }}</p>
            <div class="form-actions">
              <button class="btn-prev" @click="step = 2; errores = ''">PREVIOUS</button>
              <button class="btn-next" @click="submitForm">Enviar Queja</button>
            </div>
          </div>
          </Transition>

        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { nextTick } from 'vue'
import Swal from 'sweetalert2'
import api from "@/helpers/api"
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import heroImage from '@/assets/ninas embarazadas -25.jpg'
const route = useRoute()
const casoId         = ref(null)
const cargandoCaso   = ref(false)
const estadoOriginal = ref('')      // estado que tenía el caso al cargarse
const submitIntent   = ref(false)   // true después del primer intento de submit fallido

// ── Convierte dia/mes/año a "YYYY-MM-DD" para la BD ───────────────────────────
const toFecha = (dia, mes, ano) => {
  if (!dia || !mes || !ano) return null
  const d = String(dia).padStart(2, '0')
  const m = String(mes).padStart(2, '0')
  return `${ano}-${m}-${d}`
}

// ── Constantes estáticas ──────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Info. General' },
  { number: 2, label: 'Datos de la Niña' },
  { number: 3, label: 'Situación Educativa' },
]

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentYear = new Date().getFullYear()
const ANOS          = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
const ANOS_NACIMIENTO = Array.from({ length: 20 }, (_, i) => currentYear - 5 - i)

const INSTITUCIONES  = ['Ministerio Público', 'Procuraduría General de la Nación', 'Otra']
const STATUS_SISTEMA = ['Inscrita', 'No inscrita', 'Retirada', 'Mayor de 14 años', 'No existe registro']
const SUBSISTEMAS    = ['Subsistema Escolar', 'Subsistema Extraescolar']
const GRADOS = ['1ro', '2do', '3ro', '4to', '5to', '6to']
// Se guarda el valor canónico (igual que la carga masiva y el filtro del
// dashboard) y se muestra la etiqueta larga institucional.
const NIVELES = [
  { valor: 'Preprimaria',           label: 'Nivel de Educación Preprimaria' },
  { valor: 'Primaria',              label: 'Nivel de Educación Primaria' },
  { valor: 'Media (Básico)',        label: 'Nivel de Educación Media (Ciclo Básico)' },
  { valor: 'Media (Diversificado)', label: 'Nivel de Educación Media (Ciclo Diversificado)' },
]
const RESULTADOS = ['Promovido', 'No promovido', 'Retirado', 'Cursando actualmente']
const ETAPAS     = ['Etapa I', 'Etapa II', 'Etapa III', 'Etapa IV']
const SECTORES   = ['Oficial', 'Privado', 'Cooperativa', 'Municipal']
const JORNADAS   = ['Matutina', 'Vespertina', 'Nocturna', 'Doble', 'Fin de semana']
const AREAS      = ['Urbana', 'Rural']

// Estados institucionales del caso (reemplazan a pendiente/faltante/completado)
const ESTADOS_CASO = [
  'Verificados en el SIRE',
  'sin Verificar en el SIRE',
  'Verificados en el Sistema de Quejas, Comentarios o Sugerencias',
  'sin Quejas',
]

const ESTADO_CHIP_STYLES = {
  'Verificados en el SIRE':          { backgroundColor: '#10233f', color: '#fff' },
  'sin Verificar en el SIRE':        { backgroundColor: '#6d6d6d', color: '#fff' },
  'Verificados en el Sistema de Quejas, Comentarios o Sugerencias': { backgroundColor: '#1F3864', color: '#fff' },
  'sin Quejas':                      { backgroundColor: '#b0b0b0', color: '#fff' },
}
const estadoChipStyle = (estado) => ESTADO_CHIP_STYLES[estado] || { backgroundColor: '#e0e0e0', color: '#6d6d6d' }

// Convierte "TOTONICAPAN" / "totonicapan" → "Totonicapan" (soporta nombres compuestos y con guion)
const toTitleCase = (text = '') => {
  return String(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(palabra =>
      palabra
        .split('-')
        .map(p => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p))
        .join('-')
    )
    .join(' ')
}

// Algunos casos vienen de cargas masivas antiguas con valores en MAYÚSCULAS
// (ej. "RETIRADA", "PROMOVIDO") que no coinciden exactamente con las opciones
// actuales de los select. Esto los normaliza a la opción canónica para que se
// muestren correctamente seleccionados al editar el caso.
const normalizarTexto = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

const matchCanonical = (valor, opciones) => {
  if (!valor) return ''
  const objetivo = normalizarTexto(valor)
  return opciones.find(op => normalizarTexto(op) === objetivo) || valor
}

// Lleva cualquier variante de nivel (texto largo, corto o con errores) al valor
// canónico que guarda la BD. Mismo criterio que backend/helpers/nivelEducativo.js
const normalizarNivel = (valor) => {
  if (!valor) return ''
  const n = normalizarTexto(valor)
  if (n.includes('preprimaria') || n.includes('pre primaria')) return 'Preprimaria'
  if (n.includes('diversificado'))                            return 'Media (Diversificado)'
  if (n.includes('basico'))                                   return 'Media (Básico)'
  if (n.includes('primaria'))                                 return 'Primaria'
  if (n.includes('media') || n.includes('medio'))             return 'Media (Básico)'
  return ''
}

// ── Estado ─────────────────────────────────────────────────────────────────────
const step = ref(1)

const form = reactive({
  // Step 1
  numeroQueja: '', noCaso: '',
  fechaIngresoDia: '', fechaIngresoMes: '', fechaIngresoAno: '',
  direccionDepartamental: '',

  // Step 2
  cui: '', noNotificacion: '',
  consultaDia: '', consultaMes: '', consultaAno: '',
  nombreCompleto: '',
  nacimientoDia: '', nacimientoMes: '', nacimientoAno: '',
  edad: '', direccionNina: '',
  departamentoNina: '', municipioNina: '',
  institucion: '', puebloPertenencia: '', comunidadLinguistica: '',

  // Step 3
  codigoPersonal: '', statusActual: '', subsistema: '',
  // Subsistema Escolar
  grado: '', nivel: '', codigoUdi: '',
  departamentoEscuela: '', municipioEscuela: '', nombreCentro: '',
  direccionCentro: '', jornada: '', area: '', sector: '',
  // Subsistema Extraescolar
  programa: '', etapa: '',
  // Comunes
  resultado: '', anoEducativo: '',
  estado: ''          // vacío por defecto; obligatorio solo al crear un caso nuevo
})

// ── Datos desde API ───────────────────────────────────────────────────────────
const departamentales   = ref([])
const departamentos     = ref([])
const municipiosEscuela = ref([])
const municipiosNina    = ref([])

// Listas fijas — ya no provienen de tablas de BD
const PUEBLOS_LIST = ['Maya', 'Xinka', 'Garífuna', 'Ladino', 'Otros']
const COMUNIDADES_LIST = [
  'Kaqchikel', "K'iche'", 'Español', "Achi'", 'Akateko', 'Awakateko',
  'Chalchiteko', "Ch'orti'", 'Chuj', 'Ixil', "Jakalteko / Popti'",
  'Mam', 'Mopan', 'Poqomam', "Poqomchi'", "Q'anjob'al", "Q'eqchi'",
  'Sakapulteko', 'Sipakapense', 'Tektiteko', "Tz'utujil", 'Uspanteko',
  'Garífuna', 'Xinka', 'Otros',
]

const errores = ref('')

const parseFecha = (str) => {
  if (!str) return { dia: '', mes: '', ano: '' }
  const [ano, mes, dia] = str.split('-')
  return { dia: parseInt(dia) || '', mes: parseInt(mes) || '', ano: parseInt(ano) || '' }
}

const cargarCaso = async (id) => {
  try {
    cargandoCaso.value = true
    const res = await api.get(`/caso/${id}`)
    const caso = res.data.data
    const nina = caso.nina || {}
    const historial = (nina.historialEducativo || [])[0] || {}
    const centro = historial.centroEducativo || {}
    const municipioCentro = centro.municipio || {}
    const deptCentro = municipioCentro.departamento || {}
    const municipioNinaObj = nina.municipio || {}
    const deptNinaObj = municipioNinaObj.departamento || {}

    // Step 1
    form.noCaso               = caso.numero_caso || ''
    form.numeroQueja          = caso.queja || ''
    const fi = parseFecha(caso.fecha_ingreso)
    form.fechaIngresoDia      = fi.dia
    form.fechaIngresoMes      = fi.mes
    form.fechaIngresoAno      = fi.ano
    form.direccionDepartamental = caso.departamental_id || ''

    // Step 2
    form.cui                  = nina.cui || ''
    const fc = parseFecha(caso.fecha_primera_consulta)
    form.consultaDia          = fc.dia
    form.consultaMes          = fc.mes
    form.consultaAno          = fc.ano
    form.nombreCompleto       = nina.nombre_completo || ''
    const fn = parseFecha(nina.fecha_nacimiento)
    form.nacimientoDia        = fn.dia
    form.nacimientoMes        = fn.mes
    form.nacimientoAno        = fn.ano
    form.edad                 = nina.edad || ''
    form.direccionNina        = nina.direccion || ''
    form.puebloPertenencia    = nina.pueblo || ''
    form.comunidadLinguistica = nina.comunidad_linguistica || ''
    form.institucion          = caso.institucion || ''
    form.noNotificacion       = caso.no_notificacion || ''

    // Step 3
    form.codigoPersonal       = historial.codigo_personal || ''
    form.statusActual         = matchCanonical(historial.status_actual, STATUS_SISTEMA)
    form.subsistema           = historial.subsistema || ''
    form.grado                = historial.grado || ''
    form.nivel                = normalizarNivel(historial.nivel)
    form.programa             = historial.programa || ''
    form.etapa                = historial.etapa || ''
    form.resultado            = matchCanonical(historial.resultado, RESULTADOS)
    form.anoEducativo         = historial.anio || ''
    form.codigoUdi            = centro.codigo_udi || ''
    form.nombreCentro         = centro.nombre || ''
    form.direccionCentro      = centro.direccion || ''
    form.jornada              = centro.jornada || ''
    form.area                 = centro.area || ''
    form.sector               = centro.sector || ''
    estadoOriginal.value      = caso.estado || ''
    form.estado               = caso.estado || ''   // precargado; cambiarlo es opcional

    // Load municipios for departamento selects and set values
    const deptNinaId    = deptNinaObj.id || ''
    const deptEscuelaId = deptCentro.id || ''

    if (deptNinaId) {
      form.departamentoNina = deptNinaId
      const rMun = await api.get('/dept/municipios', { params: { departamento_id: deptNinaId } })
      municipiosNina.value = rMun.data.data
      form.municipioNina = nina.municipio_id || ''
    }

    if (deptEscuelaId) {
      form.departamentoEscuela = deptEscuelaId
      const rMun = await api.get('/dept/municipios', { params: { departamento_id: deptEscuelaId } })
      municipiosEscuela.value = rMun.data.data
      form.municipioEscuela = centro.municipio_id || ''
    }

  } catch (err) {
    console.error('Error cargando caso:', err)
  } finally {
    cargandoCaso.value = false
  }
}

onMounted(async () => {
  const [resDept, resDepartamentales, resNumero] = await Promise.all([
    api.get('/dept'),
    api.get('/dept/departamentales'),
    api.get('/caso/generar-numero'),
  ])
  departamentos.value   = resDept.data.data
  departamentales.value = resDepartamentales.data.data

  if (route.query.caso_id) {
    casoId.value = route.query.caso_id
    await cargarCaso(casoId.value)
  } else {
    form.noCaso = resNumero.data.numero
  }
})

watch(() => form.departamentoEscuela, async (newDeptId) => {
  if (cargandoCaso.value) return
  form.municipioEscuela = ''
  municipiosEscuela.value = []
  if (!newDeptId) return
  const res = await api.get('/dept/municipios', { params: { departamento_id: newDeptId } })
  municipiosEscuela.value = res.data.data
})

watch(() => form.departamentoNina, async (newDeptId) => {
  if (cargandoCaso.value) return
  form.municipioNina = ''
  municipiosNina.value = []
  if (!newDeptId) return
  const res = await api.get('/dept/municipios', { params: { departamento_id: newDeptId } })
  municipiosNina.value = res.data.data
})

function validarStep(n) {
  errores.value = ''
  if (n === 1) {
    if (!form.noCaso.trim()) { errores.value = 'El No. de Caso es requerido'; return false }
    if (!form.fechaIngresoDia || !form.fechaIngresoMes || !form.fechaIngresoAno) {
      errores.value = 'La fecha de ingreso es requerida'; return false
    }
  }
  if (n === 2) {
    if (!form.nombreCompleto.trim()) { errores.value = 'El nombre completo es requerido'; return false }
    if (!form.nacimientoDia || !form.nacimientoMes || !form.nacimientoAno) {
      errores.value = 'La fecha de nacimiento es requerida'; return false
    }
  }
  return true
}

// ── Submit ─────────────────────────────────────────────────────────────────────
async function submitForm() {
  errores.value  = ''
  submitIntent.value = true

  if (!casoId.value && !form.estado) {
    errores.value = 'El estado del caso es obligatorio'
    return
  }

  try {
    if (casoId.value) {
      // UPDATE existing case — sends full payload so all fields can be edited
      await api.put(`/caso/${casoId.value}`, {
        queja:            form.numeroQueja || null,
        estado:           form.estado,
        fecha_ingreso:    toFecha(form.fechaIngresoDia, form.fechaIngresoMes, form.fechaIngresoAno),
        departamental_id: form.direccionDepartamental || null,
        datos_nina: {
          no_notificacion:          form.noNotificacion || null,
          fecha_primera_consulta:   toFecha(form.consultaDia, form.consultaMes, form.consultaAno),
          nombre_completo:          form.nombreCompleto,
          fecha_nacimiento:         toFecha(form.nacimientoDia, form.nacimientoMes, form.nacimientoAno),
          edad:                     form.edad || null,
          direccion:                form.direccionNina || null,
          municipio_id:          form.municipioNina || null,
          departamento_id:       form.departamentoNina || null,
          pueblo:                form.puebloPertenencia || null,
          comunidad_linguistica: form.comunidadLinguistica || null,
          institucion:           form.institucion || null,
        },
        situacion_educativa: {
          codigo_personal:         form.codigoPersonal || null,
          status_actual:           form.statusActual   || null,
          subsistema:              form.subsistema     || null,
          grado:                   form.grado          || null,
          nivel:                   form.nivel          || null,
          programa:                form.programa       || null,
          etapa:                   form.etapa          || null,
          resultado:               form.resultado      || null,
          anio:                    form.anoEducativo   || null,
          codigo_udi:              form.codigoUdi      || null,
          municipio_id:            form.municipioEscuela || null,
          nombre_centro_educativo: form.nombreCentro   || null,
          direccion:               form.direccionCentro || null,
          jornada:                 form.jornada        || null,
          area:                    form.area           || null,
          sector:                  form.sector         || null,
        }
      })
    } else {
      // CREATE new case
      const payload = {
        numero_queja:     form.numeroQueja,
        estado:           form.estado,
        no_caso:          form.noCaso,
        fecha_ingreso:    toFecha(form.fechaIngresoDia, form.fechaIngresoMes, form.fechaIngresoAno),
        departamental_id: form.direccionDepartamental,
        datos_nina: {
          cui:                      form.cui,
          no_notificacion:          form.noNotificacion,
          fecha_primera_consulta:   toFecha(form.consultaDia, form.consultaMes, form.consultaAno),
          nombre_completo:          form.nombreCompleto,
          fecha_nacimiento:         toFecha(form.nacimientoDia, form.nacimientoMes, form.nacimientoAno),
          edad:                     form.edad,
          direccion:                form.direccionNina,
          municipio_id:          form.municipioNina || null,
          departamento_id:       form.departamentoNina || null,
          institucion:           form.institucion,
          pueblo:                form.puebloPertenencia || null,
          comunidad_linguistica: form.comunidadLinguistica || null,
        },
        situacion_educativa: {
          codigo_personal:         form.codigoPersonal,
          status_actual:           form.statusActual,
          subsistema:              form.subsistema,
          grado:                   form.grado,
          nivel:                   form.nivel,
          programa:                form.programa,
          etapa:                   form.etapa,
          resultado:               form.resultado,
          anio:                    form.anoEducativo,
          codigo_udi:              form.codigoUdi,
          departamento_id:         form.departamentoEscuela,
          municipio_id:            form.municipioEscuela,
          nombre_centro_educativo: form.nombreCentro,
          direccion:               form.direccionCentro,
          jornada:                 form.jornada,
          area:                    form.area,
          sector:                  form.sector,
        }
      }
      await api.post('/caso/registrar', payload)
    }

    await Swal.fire({
      title: casoId.value ? '¡Actualizado!' : '¡Guardado!',
      text: casoId.value ? 'El caso fue actualizado correctamente' : 'El caso fue registrado correctamente',
      icon: 'success',
      confirmButtonColor: '#ff9797'
    })

    submitIntent.value = false
    if (!casoId.value) {
      step.value = 1
      Object.keys(form).forEach(key => { form[key] = '' })
      form.estado = ''
      const rn = await api.get('/caso/generar-numero')
      form.noCaso = rn.data.numero
    }

  } catch (error) {
    console.error(error)
    Swal.fire({ title: 'Error', text: error.response?.data?.message || 'No se pudo guardar', icon: 'error' })
  }
}
</script>

<style scoped>
.landing-page {
  background-color: #ffffff;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.hero { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg { width: 100%; height: 100%; object-fit: cover; object-position: center; }
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
.form-section   { padding: 3.5rem 0; background-color: #f5f5f5; }
.form-container { max-width: 56rem; margin: 0 auto; padding: 0 1.5rem; }
.step-indicator { display: flex; align-items: center; width: 100%; margin-bottom: 1.5rem; padding: 0 1rem; }
.step-wrapper { display: flex; align-items: center; }
.step-wrapper:not(:last-child) { flex: 1; }
.step-node-content { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
.step-circle { width: 1.5rem; height: 1.5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; background-color: #e0e0e0; color: #9d9d9d; flex-shrink: 0; }
.step-circle.active { background-color: #17c4e8; color: #ffffff; }
.step-label       { font-size: 0.875rem; color: #b0b0b0; font-weight: 400; }
.step-label.active { color: #10233f; font-weight: 600; }
.step-label.done   { color: #17c4e8; }
.step-line        { flex: 1; height: 1px; background-color: #e0e0e0; margin: 0 1rem; }
.step-line.active { background-color: #17c4e8; }
.form-card { background-color: #ffffff; border-radius: 0.75rem; padding: 2rem; border: 1px solid #f0f0f0; box-shadow: 0 5px 5px 0 rgba(0,0,0,0.05); }
.form-header { margin-bottom: 1.25rem; }
.form-header h2 { color: #6d6d6d; font-size: 1.0625rem; font-weight: 600; margin-bottom: 0.125rem; }
.text-pink-alert { color: red; font-size: 0.75rem; margin-bottom: 0.25rem; }
.text-gray-info  { color: #b0b0b0; font-size: 0.75rem; }
.form-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.field-row { display: flex; gap: 0.75rem; }
.w-50 { width: 50%; }
.input-box { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.75rem; border-radius: 0.25rem; border: 1px solid #e8e8e8; background-color: #f9f9f9; width: 100%; position: relative; }
.input-icon { color: #b0b0b0; flex-shrink: 0; }
.input-box input,
.input-box select { flex: 1; background: transparent; border: none; outline: none; font-size: 0.875rem; color: #6d6d6d; width: 100%; }
.input-box select  { appearance: none; cursor: pointer; }
.input-box input::placeholder { color: #b0b0b0; font-size: 0.875rem; }
.empty-select      { color: #b0b0b0 !important; }
.select-chevron    { color: #b0b0b0; flex-shrink: 0; position: absolute; right: 0.75rem; pointer-events: none; }
.form-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 2rem; }
.btn-prev { background: none; border: none; color: #b0b0b0; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
.btn-prev:disabled { cursor: default; }
.btn-next { background-color: #10233f; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.25rem; font-size: 0.875rem; cursor: pointer; transition: opacity 0.2s; }
.btn-next:hover { opacity: 0.9; }
.error-msg { color: #e53935; font-size: 0.75rem; margin-top: 0.5rem; text-align: center; }
.estado-wrapper { display: flex; flex-direction: column; gap: 0.4rem; }
.estado-box { border: 1.5px solid #ff9797; background-color: #fff8f8; }
.estado-error { border-color: #e53935 !important; background-color: #fff5f5 !important; animation: shake 0.3s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}
.estado-actual-banner {
  display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
  background: #fff3e0; border: 1px solid #ffcc80; border-radius: 0.375rem;
  padding: 0.45rem 0.75rem; font-size: 0.75rem; color: #7a4800;
}
.estado-chip {
  display: inline-block; padding: 0.1rem 0.55rem; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
}
.estado-requerido {
  display: flex; align-items: center; gap: 0.3rem;
  color: #e53935; font-size: 0.72rem; font-weight: 500;
}
.numero-auto { background-color: #f5f5f5; }
.numero-auto input { color: #10233f; font-weight: 700; cursor: default; letter-spacing: 0.05em; }
.update-banner {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fff8f8; border: 1px solid #ffcfcf; border-radius: 0.375rem;
  padding: 0.625rem 0.875rem; margin-bottom: 1.25rem;
  font-size: 0.8rem; color: #c05050; font-weight: 500;
}

/* Transición entre steps del formulario */
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>