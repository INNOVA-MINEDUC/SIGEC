<template>
  <v-container class="container" >
    <img src="/logo.png" alt="Logo" class="logo" />

    <div class="card">
      <h2>Iniciar sesión</h2>

      <div class="input-group">
        <span class="material-icons">mail</span>
        <input type="email" v-model="email" placeholder="Correo electrónico" />
      </div>

      <div class="input-group">
        <span class="material-icons">lock</span>
        <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Contraseña" />
        <span class="material-icons eye" @click="showPassword = !showPassword">
          {{ showPassword ? 'visibility_off' : 'visibility' }}
        </span>
      </div>

      <button class="btn" @click="submitLogin">Ingresar</button>

      <a href="#" class="forgot">¿Olvidó su contraseña?</a>
    </div>

    <!-- ALERTA SUPERIOR DERECHA -->
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

  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

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

.container {
  min-height: 90svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background-image: url("/login/img.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center; */

  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}

.logo {
  width: 200px;
  margin-bottom: 10px;
}

.card {
  background: #fff;
  width: 100%;
  max-width: 500px;
  padding: 35px;
  border-radius: 15px;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 25px;
  border: 1px solid #e5e5e5;
}

.input-group input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  width: 100%;
  color: #333;
}

.material-icons {
  color: #777;
  margin-right: 10px;
}

.eye {
  cursor: pointer;
}

.btn {
  width: 100%;
  padding: 12px;
  background: #a9c5ff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn:hover {
  background: #8cb3ff;
}

.forgot {
  font-size: 14px;
  color: #2c63ff;
  text-decoration: none;
  display: inline-block;
  margin-top: 12px;
}
</style>
