<template>
  <div class="landing-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img :src="heroImage" alt="Persona escribiendo en laptop" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Haz tu queja</p>
        <h1 class="hero-title">De manera Confidencial...</h1>
        <p class="hero-subtitle">
          Canal oficial para la recepción de quejas y denuncias, asegurando<br />
          atención oportuna y confidencialidad en cada caso.
        </p>
      </div>
    </section>

    <!-- ── FORM SECTION ── -->
    <section class="form-section">
      <div class="form-container">

        <!-- Step Indicator -->
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

        <!-- Form Card -->
        <div class="form-card">

          <!-- STEP 1 -->
          <div v-if="step === 1">
            <div class="form-header">
              <h2>Datos de Contacto:</h2>
              <p class="text-pink-alert">Recuerda llenar toda la información del FORMULARIO</p>
              <p class="text-gray-info">Por favor, completa todos los campos con información verídica.</p>
            </div>
            <div class="form-grid">
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-account-outline</v-icon>
                <input type="text" v-model="form.nombre" placeholder="Nombre Completo" />
              </div>
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-credit-card-outline</v-icon>
                <input type="text" v-model="form.dpi" placeholder="DPI" />
              </div>
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-account-group-outline</v-icon>
                <select v-model="form.tipoUsuario" :class="{ 'empty-select': !form.tipoUsuario }">
                  <option value="" disabled>Tipo de Usuario</option>
                  <option v-for="opt in TIPO_USUARIO" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
              </div>
              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-cellphone</v-icon>
                  <select v-model="form.tipoContactoPrincipal" :class="{ 'empty-select': !form.tipoContactoPrincipal }">
                    <option value="" disabled>Tipo de Contacto Principal</option>
                    <option v-for="opt in TIPO_CONTACTO" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-phone-outline</v-icon>
                  <input type="text" v-model="form.contactoPrincipal" placeholder="Contacto Principal" />
                </div>
              </div>
              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-cellphone</v-icon>
                  <select v-model="form.tipoContactoAlterno" :class="{ 'empty-select': !form.tipoContactoAlterno }">
                    <option value="" disabled>Tipo de Contacto Alterno</option>
                    <option v-for="opt in TIPO_CONTACTO" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
                </div>
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-phone-outline</v-icon>
                  <input type="text" v-model="form.contactoAlterno" placeholder="Contacto Alterno" />
                </div>
              </div>
              <div class="confidencial-group">
                <p>¿Desea que sus datos personales sean confidenciales?</p>
                <div class="radio-options">
                  <label class="radio-label" v-for="val in ['si', 'no']" :key="val" @click="form.confidencial = val">
                    <div class="radio-circle" :class="{ active: form.confidencial === val }">
                      <div class="radio-dot" v-if="form.confidencial === val"></div>
                    </div>
                    {{ val === 'si' ? 'Sí' : 'No' }}
                  </label>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-prev" disabled>PREVIOUS</button>
              <button class="btn-next" @click="step = 2">Siguiente</button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div v-if="step === 2">
            <div class="form-header">
              <h2>Detalles de la Queja:</h2>
              <p class="text-pink-alert">Recuerda llenar toda la información del FORMULARIO</p>
              <p class="text-gray-info">Por favor, describe la situación con el mayor detalle posible.</p>
            </div>
            <div class="form-grid">
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-account-group-outline</v-icon>
                <select v-model="form.tipoQueja" :class="{ 'empty-select': !form.tipoQueja }">
                  <option value="" disabled>Tipo de Queja</option>
                  <option v-for="opt in TIPOS_QUEJA" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
              </div>
              <div class="input-box textarea-box">
                <textarea v-model="form.descripcion" placeholder="Descripción detallada de la queja..." rows="6"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-prev" @click="step = 1">PREVIOUS</button>
              <button class="btn-next" @click="step = 3">Siguiente</button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div v-if="step === 3">
            <div class="form-header">
              <h2>Información Adicional:</h2>
              <p class="text-pink-alert">Recuerda llenar toda la información del FORMULARIO</p>
              <p class="text-gray-info">Por favor, ingresa la información del centro educativo involucrado.</p>
            </div>
            <div class="form-grid">
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-account-outline</v-icon>
                <input type="text" v-model="form.escuela" placeholder="Nombre del Centro Educativo" />
              </div>
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-credit-card-outline</v-icon>
                <input type="text" v-model="form.municipio" placeholder="Municipio" />
              </div>
              <div class="input-box">
                <v-icon size="16" class="input-icon">mdi-account-group-outline</v-icon>
                <select v-model="form.departamento" :class="{ 'empty-select': !form.departamento }">
                  <option value="" disabled>Departamento</option>
                  <option v-for="opt in DEPARTAMENTOS" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-prev" @click="step = 2">PREVIOUS</button>
              <button class="btn-next" @click="submitForm">Enviar Queja</button>
            </div>
          </div>

        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import heroImage from '@/assets/ninas embarazadas -25.jpg'

// ── Constants ──────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Contacto' },
  { number: 2, label: 'Queja' },
  { number: 3, label: 'Información' },
]
const TIPO_USUARIO  = ['Estudiante', 'Docente', 'Padre/Madre de Familia', 'Personal Administrativo', 'Otro']
const TIPO_CONTACTO = ['Teléfono', 'Correo Electrónico', 'WhatsApp', 'Otro']
const TIPOS_QUEJA   = ['Acoso', 'Discriminación', 'Negligencia', 'Violencia', 'Otro']
const DEPARTAMENTOS = ['Guatemala', 'Quetzaltenango', 'Escuintla', 'Alta Verapaz', 'Huehuetenango', 'San Marcos', 'Otro']

// ── State ──────────────────────────────────────────────
const step = ref(1)

const form = reactive({
  nombre: '', dpi: '', tipoUsuario: '',
  tipoContactoPrincipal: '', contactoPrincipal: '',
  tipoContactoAlterno: '',  contactoAlterno: '',
  confidencial: '', descripcion: '', tipoQueja: '',
  escuela: '', municipio: '', departamento: ''
})

// ── Methods ────────────────────────────────────────────
function submitForm() {
  Swal.fire({
    title: '¡Guardado!',
    text: 'El registro se guardó correctamente',
    icon: 'success',
    confirmButtonColor: '#ff9797'
  }).then(() => {
    step.value = 1
    Object.keys(form).forEach(key => form[key] = '')
  })
}
</script>

<style scoped>
.landing-page {
  background-color: var(--sigec-bg);
  color: var(--sigec-text);
  font-family: var(--sigec-font);
  min-height: 100vh;
}

/* FORM SECTION */
.form-section   { padding: 3.5rem 0; background-color: var(--sigec-bg-muted); }
.form-container { max-width: 56rem; margin: 0 auto; padding: 0 1.5rem; }

/* Step Indicator */
.step-indicator { display: flex; align-items: center; width: 100%; margin-bottom: 1.5rem; padding: 0 1rem; }
.step-wrapper { display: flex; align-items: center; }
.step-wrapper:not(:last-child) { flex: 1; }
.step-node-content { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
.step-circle {
  width: 1.5rem; height: 1.5rem; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 600;
  background-color: #e0e0e0; color: #9d9d9d; flex-shrink: 0;
}
.step-circle.active { background-color: var(--sigec-primary); color: var(--sigec-bg); }
.step-label       { font-size: 0.875rem; color: var(--sigec-text-muted); font-weight: 400; }
.step-label.active { color: var(--sigec-primary); font-weight: 600; }
.step-label.done   { color: var(--sigec-primary); }
.step-line        { flex: 1; height: 1px; background-color: #e0e0e0; margin: 0 1rem; }
.step-line.active { background-color: var(--sigec-primary); }

/* Form Card */
.form-card { background-color: var(--sigec-bg); border-radius: 0.75rem; padding: 2rem; border: 1px solid var(--sigec-border); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.form-header { margin-bottom: 1.25rem; }
.form-header h2 { color: var(--sigec-text); font-size: 1.0625rem; font-weight: 600; margin-bottom: 0.125rem; }
.text-pink-alert { color: var(--sigec-primary); font-size: 0.75rem; margin-bottom: 0.25rem; }
.text-gray-info  { color: var(--sigec-text-muted); font-size: 0.75rem; }

.form-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.field-row { display: flex; gap: 0.75rem; }
.w-50 { width: 50%; }

.input-box {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 0.75rem; border-radius: 0.25rem;
  border: 1px solid #e8e8e8; background-color: #f9f9f9;
  width: 100%; position: relative;
}
.input-icon { color: var(--sigec-text-muted); flex-shrink: 0; }
.input-box input,
.input-box select { flex: 1; background: transparent; border: none; outline: none; font-size: 0.875rem; color: var(--sigec-text); width: 100%; }
.input-box select  { appearance: none; cursor: pointer; }
.empty-select      { color: var(--sigec-text-muted) !important; }
.select-chevron    { color: var(--sigec-text-muted); flex-shrink: 0; position: absolute; right: 0.75rem; pointer-events: none; }
.textarea-box      { align-items: flex-start; }
.textarea-box textarea { flex: 1; background: transparent; border: none; outline: none; font-size: 0.875rem; color: var(--sigec-text); resize: none; width: 100%; }

.confidencial-group    { margin-top: 0.5rem; }
.confidencial-group p  { font-size: 0.875rem; color: var(--sigec-text); margin-bottom: 0.5rem; }
.radio-options { display: flex; flex-direction: column; gap: 0.375rem; }
.radio-label   { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--sigec-text); cursor: pointer; }
.radio-circle  { width: 1rem; height: 1rem; border-radius: 9999px; border: 2px solid #c0c0c0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.radio-circle.active { border-color: var(--sigec-primary); }
.radio-dot     { width: 0.5rem; height: 0.5rem; background-color: var(--sigec-primary); border-radius: 9999px; }

.form-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 2rem; }
.btn-prev { background: none; border: none; color: var(--sigec-text-muted); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
.btn-prev:disabled { cursor: default; }
.btn-next { background-color: var(--sigec-primary); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.25rem; font-size: 0.875rem; cursor: pointer; transition: opacity 0.2s; }
.btn-next:hover { opacity: 0.9; }
</style>