<template>
  <div class="landing-page">
    <!-- ── NAVBAR ── -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="logo-container">
          <img :src="logoSisec" alt="Logo SIGEC" class="header-logo-img" />
        </div>

        <!-- Links -->
        <div class="nav-links">
          <router-link v-for="link in navLinks" :key="link.name" :to="link.to" class="nav-item" active-class="nav-item-active" :exact="link.to === '/'">
            {{ link.name }}
          </router-link>
          
          <div class="divider"></div>
          
          <router-link to="/profile" class="nav-btn account-btn">
            <v-icon size="15" class="mr-1">mdi-account</v-icon>
            Mi Cuenta
          </router-link>
          
          <button class="nav-btn logout-btn" @click="logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

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
                <div 
                  class="step-circle" 
                  :class="{ active: stepObj.number === step || stepObj.number < step }"
                >
                  {{ stepObj.number }}
                </div>
                <span 
                  class="step-label" 
                  :class="{ active: stepObj.number === step, done: stepObj.number < step }"
                >
                  {{ stepObj.label }}
                </span>
              </div>
              <div 
                v-if="i < STEPS.length - 1" 
                class="step-line" 
                :class="{ active: stepObj.number < step }"
              ></div>
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
                <select v-model="form.tipoUsuario" :class="{'empty-select': !form.tipoUsuario}">
                  <option value="" disabled>Tipo de Usuario</option>
                  <option v-for="opt in TIPO_USUARIO" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <v-icon size="16" class="select-chevron">mdi-chevron-down</v-icon>
              </div>

              <div class="field-row">
                <div class="input-box w-50">
                  <v-icon size="16" class="input-icon">mdi-cellphone</v-icon>
                  <select v-model="form.tipoContactoPrincipal" :class="{'empty-select': !form.tipoContactoPrincipal}">
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
                  <select v-model="form.tipoContactoAlterno" :class="{'empty-select': !form.tipoContactoAlterno}">
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
                  <label class="radio-label" @click="form.confidencial = 'si'">
                    <div class="radio-circle" :class="{ active: form.confidencial === 'si' }">
                      <div class="radio-dot" v-if="form.confidencial === 'si'"></div>
                    </div>
                    Sí
                  </label>
                  <label class="radio-label" @click="form.confidencial = 'no'">
                    <div class="radio-circle" :class="{ active: form.confidencial === 'no' }">
                      <div class="radio-dot" v-if="form.confidencial === 'no'"></div>
                    </div>
                    No
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
                <select v-model="form.tipoQueja" :class="{'empty-select': !form.tipoQueja}">
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
                <select v-model="form.departamento" :class="{'empty-select': !form.departamento}">
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

    <!-- ── FOOTER ── -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-logo">
          <img :src="logoDigecade1" alt="Logo DCE" class="footer-logo-img" />
        </div>

        <div class="footer-grid">
          <!-- Col 1 -->
          <div>
            <div class="footer-title">DIGECADE</div>
            <div class="footer-list">
              <div class="footer-item"><v-icon size="16">mdi-map-marker-outline</v-icon> <span>6a. Calle 1-87, Zona 10, Ciudad de Guatemala</span></div>
              <div class="footer-item"><v-icon size="16">mdi-phone-outline</v-icon> <span>PBX +502 2411-9595</span></div>
              <div class="footer-item"><v-icon size="16">mdi-email-outline</v-icon> <span>cegarcia@mineduc.gob.gt<br />edu.mineduc.gob.gt/DIGECADE</span></div>
            </div>
          </div>

          <!-- Col 2 -->
          <div>
            <div class="footer-title">SUBDIRECCION / CONTACTOS</div>
            <div class="footer-list">
              <div class="footer-item"><v-icon size="16">mdi-account-outline</v-icon> <span>Directora: Claudia E. Morales García (correo público)</span></div>
              <div class="footer-item"><v-icon size="16">mdi-phone-outline</v-icon> <span>Extensiones internas (ver directorio oficial)</span></div>
              <div class="footer-item"><v-icon size="16">mdi-web</v-icon> <span>Directorio oficial: documentos públicos del<br />MINEDUC</span></div>
            </div>
          </div>

          <!-- Col 3 -->
          <div>
            <div class="footer-title">SUBDIRECCION / CONTACTOS</div>
            <div class="footer-list">
              <div class="footer-item"><v-icon size="16">mdi-lightbulb-on-outline</v-icon> <span>Centro de Capacitación Tecnológica - INNOVA</span></div>
              <div class="footer-item"><v-icon size="16">mdi-web</v-icon> <span>cctmineduc.blogspot.com</span></div>
              <div class="footer-item"><v-icon size="16">mdi-message-processing-outline</v-icon> <span>(contacto via DIGECADE / MINEDUC;<br />ver página oficial para correos específicos)</span></div>
              <div class="footer-item mt-4"><v-icon size="16">mdi-circle-medium</v-icon> <span>Información pública tomada del sitio y directorio<br />oficial del Ministerio de Educación de Guatemala.</span></div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          @ 2023 ByteSpace. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

// Logos & Images
import logoDigecade1 from '@/assets/LOGOS_DCE1.png'
import logoSisec from '@/assets/LOGO_SISEC.png'
import heroImage from '@/assets/ninas embarazadas -25.jpg'

const router = useRouter()
const auth = useAuthStore()

const navLinks = [
  { name: 'Inicio', to: '/' },
  { name: 'Seguimiento', to: '/seguimiento' },
  { name: 'Quejas', to: '/complains' },
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Importar Datos', to: '/charge-data' },
  { name: 'Usuarios', to: '/users' }
]

function logout() {
  auth.logout()
  router.push('/login')
}

// Form logic
const step = ref(1)

const STEPS = [
  { number: 1, label: "Contacto" },
  { number: 2, label: "Queja" },
  { number: 3, label: "Información" },
]

const TIPO_USUARIO = ["Estudiante", "Docente", "Padre/Madre de Familia", "Personal Administrativo", "Otro"]
const TIPO_CONTACTO = ["Teléfono", "Correo Electrónico", "WhatsApp", "Otro"]
const TIPOS_QUEJA = ["Acoso", "Discriminación", "Negligencia", "Violencia", "Otro"]
const DEPARTAMENTOS = ["Guatemala", "Quetzaltenango", "Escuintla", "Alta Verapaz", "Huehuetenango", "San Marcos", "Otro"]

const form = reactive({
  nombre: '',
  dpi: '',
  tipoUsuario: '',
  tipoContactoPrincipal: '',
  contactoPrincipal: '',
  tipoContactoAlterno: '',
  contactoAlterno: '',
  confidencial: '',
  descripcion: '',
  tipoQueja: '',
  escuela: '',
  municipio: '',
  departamento: ''
})

const submitForm = () => {
  Swal.fire({
    title: 'Guardado!',
    text: 'El registro se guardó correctamente',
    icon: 'success',
    confirmButtonColor: '#ff9797'
  }).then(() => {
    // Optional: redirect or reset
    step.value = 1
    Object.keys(form).forEach(key => form[key] = '')
  })
}
</script>

<style scoped>
/* BASE STYLES */
.landing-page {
  background-color: #ffffff;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

/* NAVBAR */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.nav-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.header-logo-img {
  height: 44px;
  width: auto;
  object-fit: contain;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.nav-item {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #6d6d6d;
  text-decoration: none;
  border-bottom: 2px solid transparent;
}
.nav-item-active {
  color: #ff9797;
  border-bottom-color: #ff9797;
  font-weight: 600;
}
.divider {
  width: 1px;
  height: 1.25rem;
  background-color: #e5e7eb;
  margin: 0 0.25rem;
}
.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  color: #6d6d6d;
  text-decoration: none;
}
.logout-btn {
  background-color: #ff9797;
  color: white;
  margin-left: 0.25rem;
  padding: 0.375rem 1rem;
  transition: opacity 0.2s;
}
.logout-btn:hover {
  opacity: 0.9;
}

/* HERO */
.hero {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: 500px;
}
.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,151,151,0) 0%, rgba(255,151,151,0.2) 40%, rgba(255,151,151,0.95) 100%);
}
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 3.5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  text-align: center;
}
.hero-top-text {
  color: white;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
  margin-bottom: -0.25rem;
  line-height: 1.1;
}
.hero-title {
  color: white;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-size: 64px;
  font-weight: 700;
  line-height: 1.15;
  max-width: 900px;
  margin-bottom: 0;
}
.hero-subtitle {
  margin-top: 1rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  max-width: 700px;
  opacity: 1;
}

/* FORM SECTION */
.form-section {
  padding: 3.5rem 0;
  background-color: #f5f5f5;
}
.form-container {
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}
.step-wrapper {
  display: flex;
  align-items: center;
}
.step-wrapper:not(:last-child) {
  flex: 1;
}
.step-node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}
.step-circle {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #e0e0e0;
  color: #9d9d9d;
  flex-shrink: 0;
}
.step-circle.active {
  background-color: #ff9797;
  color: #ffffff;
}
.step-label {
  font-size: 0.875rem;
  color: #b0b0b0;
  font-weight: 400;
}
.step-label.active {
  color: #ff9797;
  font-weight: 600;
}
.step-label.done {
  color: #ff9797;
}
.step-line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
  margin: 0 1rem;
}
.step-line.active {
  background-color: #ff9797;
}

/* Form Card */
.form-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 2rem;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.form-header {
  margin-bottom: 1.25rem;
}
.form-header h2 {
  color: #6d6d6d;
  font-size: 1.0625rem;
  font-weight: 600;
  margin-bottom: 0.125rem;
}
.text-pink-alert {
  color: #ff9797;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}
.text-gray-info {
  color: #b0b0b0;
  font-size: 0.75rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.field-row {
  display: flex;
  gap: 0.75rem;
}
.w-50 {
  width: 50%;
}
.input-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #e8e8e8;
  background-color: #f9f9f9;
  width: 100%;
  position: relative;
}
.input-icon {
  color: #b0b0b0;
  flex-shrink: 0;
}
.input-box input,
.input-box select {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #6d6d6d;
  width: 100%;
}
.input-box select {
  appearance: none;
  cursor: pointer;
}
.empty-select {
  color: #b0b0b0 !important;
}
.select-chevron {
  color: #b0b0b0;
  flex-shrink: 0;
  position: absolute;
  right: 0.75rem;
  pointer-events: none;
}
.textarea-box {
  align-items: flex-start;
}
.textarea-box textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #6d6d6d;
  resize: none;
  width: 100%;
}

.confidencial-group {
  margin-top: 0.5rem;
}
.confidencial-group p {
  font-size: 0.875rem;
  color: #6d6d6d;
  margin-bottom: 0.5rem;
}
.radio-options {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6d6d6d;
  cursor: pointer;
}
.radio-circle {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid #c0c0c0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.radio-circle.active {
  border-color: #ff9797;
}
.radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ff9797;
  border-radius: 9999px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
}
.btn-prev {
  background: none;
  border: none;
  color: #b0b0b0;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: default;
}
.btn-prev.active {
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-prev.active:hover {
  opacity: 0.7;
}
.btn-next {
  background-color: #ff9797;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-next:hover {
  opacity: 0.9;
}

/* FOOTER */
.footer {
  background-color: #ff9797;
  color: white;
  padding: 1rem 0 1.5rem;
}
.footer-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
}
.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding-top: 3rem;
}
.footer-logo-img {
  height: 48px;
  width: auto;
  object-fit: contain;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: start;
}
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
}
.footer-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  font-size: 0.75rem;
  line-height: 1.4;
  font-weight: 400;
}
.footer-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.footer-item .v-icon {
  margin-top: 0.125rem;
  opacity: 1;
}
.footer-item span {
  opacity: 0.95;
}
.footer-bottom {
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: right;
  font-size: 0.75rem;
  opacity: 0.8;
  border-top: 1px solid #ffffff;
}
</style>