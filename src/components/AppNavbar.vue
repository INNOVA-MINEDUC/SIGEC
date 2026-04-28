<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="logo-container">
        <img :src="logoSisec" alt="Logo SIGEC" class="header-logo-img" />
      </div>
      <div class="nav-links">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="nav-item"
          active-class="nav-item-active"
          :exact="link.to === '/'"
        >
          {{ link.name }}
        </router-link>
        <div class="divider"></div>
        <router-link to="/profile" class="nav-btn account-btn">
          <v-icon size="15" class="mr-1">mdi-account</v-icon>
          Mi Cuenta
        </router-link>
        <button class="nav-btn logout-btn" @click="logout">Cerrar Sesión</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoSisec from '@/assets/LOGO_SISEC.png'

const router = useRouter()
const auth = useAuthStore()

const navLinks = [
  { name: 'Inicio',         to: '/' },
  { name: 'Seguimiento',    to: '/seguimiento' },
  { name: 'Quejas',         to: '/complains' },
  { name: 'Dashboard',      to: '/dashboard' },
  { name: 'Importar Datos', to: '/charge-data' },
  { name: 'Usuarios',       to: '/users' }
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
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
.logout-btn:hover { opacity: 0.9; }
</style>
