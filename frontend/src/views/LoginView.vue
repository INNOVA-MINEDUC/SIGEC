<template>
  <div class="login-page">

    <!-- Alerta de error -->
    <transition name="slide-fade">
      <v-alert
        v-if="errorMessage"
        class="alert-box"
        type="error"
        elevation="6"
        border="start"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
    </transition>

    <!-- Panel izquierdo: branding institucional -->
    <div class="brand-panel">
      <div class="brand-inner">
        <div class="brand-logos">
          <img src="/imgs/logo.png" alt="SIGEC" class="logo-sigec" />
          <div class="logo-divider"></div>
          <img :src="logoMineduc" alt="MINEDUC" class="logo-mineduc" />
        </div>
        <h1 class="brand-title">SIRCE</h1>
        <p class="brand-subtitle">Sistema de registros de<br />casos de embarazo</p>
        <div class="brand-tagline">
          <span class="brand-line"></span>
          <span>Ministerio de Educación de Guatemala</span>
          <span class="brand-line"></span>
        </div>
        <p class="brand-description">
          Plataforma para el registro, seguimiento y análisis de casos
          de embarazo en niñas en el sistema educativo nacional.
        </p>
      </div>
    </div>

    <!-- Panel derecho: formulario de login -->
    <div class="form-panel">
      <div class="form-inner">
        <div class="form-header">
          <div class="form-badge">MINEDUC · SIGEC</div>
          <h2 class="form-title">Iniciar sesión</h2>
          <p class="form-subtitle">Ingresa tus credenciales institucionales</p>
        </div>

        <div class="field-group">
          <label class="field-label">Correo electrónico</label>
          <div class="input-wrap">
            <v-icon size="18" class="field-icon">mdi-email-outline</v-icon>
            <input
              type="email"
              v-model="email"
              placeholder="usuario@mineduc.edu.gt"
              @keyup.enter="submitLogin"
              class="field-input"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">Contraseña</label>
          <div class="input-wrap">
            <v-icon size="18" class="field-icon">mdi-lock-outline</v-icon>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="••••••••"
              @keyup.enter="submitLogin"
              class="field-input"
            />
            <v-icon size="18" class="eye-icon" @click="showPassword = !showPassword">
              {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
            </v-icon>
          </div>
        </div>

        <button class="btn-login" @click="submitLogin">
          <v-icon size="18" class="mr-1">mdi-login</v-icon>
          Iniciar Sesión
        </button>

        <a href="#" class="forgot-link">¿Olvidó su contraseña?</a>

        <div class="form-footer">
          Sistema de uso exclusivo para personal autorizado de MINEDUC
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from "@/helpers/api"

import logoMineduc from '@/assets/mineduc.png'
import logoSigec   from '@/assets/LOGO_SISEC.png'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

async function submitLogin() {
  try {
    errorMessage.value = ''
    if (!email.value || !password.value) {
      errorMessage.value = 'Completa todos los campos'
      return
    }
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    auth.login(response.data)
    router.push('/')
  } catch (error) {
    console.error(error)
    if (error.response?.status === 401) {
      errorMessage.value = 'Credenciales incorrectas'
      return
    }
    errorMessage.value = error.response?.data?.message || 'Error al iniciar sesión'
  }
}
</script>

<style scoped>
/* ── ALERTA ─────────────────────────────────────────────────────────── */
.alert-box {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  z-index: 99999;
}
.slide-fade-enter-active,
.slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter-from,
.slide-fade-leave-to { opacity: 0; transform: translateX(40px); }

/* ── LAYOUT ─────────────────────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  font-family: system-ui, -apple-system, sans-serif;
}

/* ── PANEL IZQUIERDO ────────────────────────────────────────────────── */
.brand-panel {
  width: 45%;
  background: linear-gradient(145deg, #0a1929 0%, #10233f 45%, #1f3864 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.brand-panel::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 380px; height: 380px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}

.brand-panel::after {
  content: '';
  position: absolute;
  bottom: -80px; left: -80px;
  width: 280px; height: 280px;
  border-radius: 50%;
  background: rgba(255,255,255,0.03);
}

.brand-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 340px;
}

.brand-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 2rem;
}

.logo-sigec {
  height: 64px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo-mineduc {
  height: 52px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo-divider {
  width: 1px;
  height: 48px;
  background: rgba(255,255,255,0.3);
}

.brand-title {
  font-size: 3rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.08em;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.brand-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.brand-tagline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.75rem;
  white-space: nowrap;
}

.brand-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.2);
}

.brand-description {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
}

/* ── PANEL DERECHO ──────────────────────────────────────────────────── */
.form-panel {
  width: 55%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.form-inner {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 32px rgba(16, 35, 63, 0.08);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-badge {
  display: inline-block;
  background: #eef2f9;
  color: #10233f;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #10233f;
  margin-bottom: 0.4rem;
}

.form-subtitle {
  font-size: 0.82rem;
  color: #6d7a8d;
}

/* ── CAMPOS ─────────────────────────────────────────────────────────── */
.field-group {
  margin-bottom: 1.1rem;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #10233f;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.45rem;
}

.input-wrap {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1.5px solid #e4e9f0;
  border-radius: 10px;
  padding: 0 14px;
  transition: border-color 0.2s, background 0.2s;
}

.input-wrap:focus-within {
  border-color: #10233f;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(16, 35, 63, 0.1);
}

.field-icon {
  color: #8a95a5;
  flex-shrink: 0;
  margin-right: 10px;
}

.field-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #1a1a2e;
  padding: 0.75rem 0;
}

.field-input::placeholder { color: #b0b8c4; }

.eye-icon {
  color: #8a95a5;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  transition: color 0.2s;
}
.eye-icon:hover { color: #10233f; }

/* ── BOTÓN ──────────────────────────────────────────────────────────── */
.btn-login {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.85rem;
  background: linear-gradient(135deg, #10233f 0%, #1f3864 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: opacity 0.2s, transform 0.1s;
  letter-spacing: 0.03em;
}

.btn-login:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-login:active { transform: translateY(0); }

/* ── EXTRAS ─────────────────────────────────────────────────────────── */
.forgot-link {
  display: block;
  text-align: center;
  font-size: 0.78rem;
  color: #8a95a5;
  text-decoration: none;
  margin-top: 1rem;
  transition: color 0.2s;
  font-weight: 500;
}
.forgot-link:hover { color: #10233f; }

.form-footer {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #eef0f4;
  text-align: center;
  font-size: 0.7rem;
  color: #b0b8c4;
  line-height: 1.5;
}

/* ── RESPONSIVE ─────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .brand-panel { width: 100%; padding: 2rem 1.5rem; }
  .brand-title { font-size: 2rem; }
  .brand-description { display: none; }
  .form-panel { width: 100%; padding: 2rem 1rem; }
}
</style>
