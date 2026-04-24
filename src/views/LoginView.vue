<template>
  <div class="login-wrapper">
    <!-- ALERTA SUPERIOR DERECHA -->
    <transition name="slide-fade">
      <v-alert
        v-if="errorMessage"
        class="alert-box"
        type="error"3
        elevation="6"
        border="start"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
    </transition>

    <div class="login-content">
      <img :src="logoMineduc" alt="Ministerio de Educación" class="logo" />

      <div class="card">
        <h2 class="card-title">Iniciar sesión</h2>

        <div class="input-group">
          <v-icon size="20" class="input-icon">mdi-email-outline</v-icon>
          <input type="email" v-model="email" placeholder="Correo electrónico" @keyup.enter="submitLogin" />
        </div>

        <div class="input-group">
          <v-icon size="20" class="input-icon">mdi-lock-outline</v-icon>
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Contraseña" @keyup.enter="submitLogin" />
          <v-icon size="20" class="eye-icon" @click="showPassword = !showPassword">
            {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
          </v-icon>
        </div>

        <button class="btn" @click="submitLogin">Iniciar Sesión</button>

        <a href="#" class="forgot">¿Olvidó su contraseña?</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import logoMineduc from '@/assets/mineduc.png'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

function submitLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    return errorMessage.value = 'Completa los campos'
  }

  const ok = auth.login(email.value, password.value)

  if (ok) {
    return router.push('/')
  } else {
    errorMessage.value = 'Credenciales incorrectas'
  }
}
</script>

<style scoped>
/* ALERTA TOP RIGHT */
.alert-box {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  z-index: 99999;
}

/* Transición suave */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* ========================================================== */

.login-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
  
  /* The background image */
  background: url("@/assets/Portada Niñas Embarazadas -46.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  padding: 0 20px;
  z-index: 10;
}

.logo {
  width: 220px;
  object-fit: contain;
  margin-bottom: 20px;
}

.card {
  background: #ffffff;
  width: 100%;
  padding: 40px 35px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  transition: border-color 0.2s, background-color 0.2s;
}

.input-group:focus-within {
  border-color: #ff9797;
  background: #ffffff;
}

.input-icon {
  color: #a0a0a0;
  margin-right: 12px;
}

.input-group input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: #333;
}

.input-group input::placeholder {
  color: #a0a0a0;
}

.eye-icon {
  color: #a0a0a0;
  cursor: pointer;
  margin-left: 8px;
}
.eye-icon:hover {
  color: #666;
}

.btn {
  width: 100%;
  padding: 12px;
  background: #ff9797;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 8px;
}

.btn:hover {
  opacity: 0.9;
}

.forgot {
  font-size: 12px;
  color: #728fb5;
  text-decoration: none;
  display: inline-block;
  margin-top: 16px;
  font-weight: 500;
}
.forgot:hover {
  color: #557294;
}
</style>
