<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="logo-container">
        <img src="/imgs/logo.png" alt="Logo SIGEC" class="header-logo-img" />
      </div>

      <!-- Tablet y teléfono: los enlaces se abren desde este botón -->
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuAbierto"
        aria-controls="nav-links"
        :aria-label="menuAbierto ? 'Cerrar menú' : 'Abrir menú'"
        @click="menuAbierto = !menuAbierto"
      >
        <v-icon size="26">{{ menuAbierto ? 'mdi-close' : 'mdi-menu' }}</v-icon>
      </button>

      <div id="nav-links" class="nav-links" :class="{ abierto: menuAbierto }">
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
        <!-- <router-link to="/profile" class="nav-btn account-btn">
          <v-icon size="15" class="mr-1">mdi-account</v-icon>
          Mi Cuenta
        </router-link> -->
        <button class="nav-btn logout-btn" @click="logout">Cerrar Sesión</button>
      </div>
    </div>
    <!-- Fondo del menú desplegable: un toque fuera lo cierra -->
    <div v-if="menuAbierto" class="menu-backdrop" @click="menuAbierto = false"></div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { puedeEditarCasos } from '@/helpers/permisos'
import logoSisec from '@/assets/LOGO_SISEC.png'

const auth = useAuthStore()

const BASE_LINKS = [
  { name: 'Inicio',      to: '/' },
  { name: 'Seguimiento', to: '/seguimiento' },
  { name: 'Registro',      to: '/complains' },
  { name: 'Dashboard',   to: '/dashboard' },
]

const ADMIN_LINKS = [
  { name: 'Importar Datos', to: '/charge-data' },
  { name: 'Usuarios',       to: '/users' },
  { name: 'Auditoría',      to: '/auditoria' },
]

const navLinks = computed(() => {
  // "Registro" solo para perfiles que pueden registrar/editar casos
  const base = puedeEditarCasos(auth.user?.role)
    ? BASE_LINKS
    : BASE_LINKS.filter(link => link.to !== '/complains')
  if (auth.user?.role === 'admin') return [...base, ...ADMIN_LINKS]
  return base
})

// Menú desplegable (tablet y teléfono): se cierra al navegar o con Escape
const menuAbierto = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuAbierto.value = false })

const cerrarConEscape = (e) => { if (e.key === 'Escape') menuAbierto.value = false }
onMounted(() => window.addEventListener('keydown', cerrarConEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', cerrarConEscape))

async function logout() {
  // Se espera a logoutSession para que quede registrado el cierre en auditoría
  // antes de salir.
  await auth.logoutSession()

  // Redirección dura (no router.push): fuerza una recarga completa para que no
  // sobreviva nada del estado en memoria —stores de Pinia, datos ya cargados—
  // de la sesión anterior. Se usa replace para que el botón "atrás" no regrese
  // a una vista autenticada.
  window.location.replace(`${import.meta.env.BASE_URL}login`)
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
  color: #10233f;
  border-bottom-color: #f472b6;
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
  background-color: #10233f;
  color: white;
  margin-left: 0.25rem;
  padding: 0.375rem 1rem;
  transition: opacity 0.2s;
}
.logout-btn:hover { opacity: 0.9; }

/* ── Menú desplegable (tablet y teléfono) ─────────────────────────────── */
.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: #10233f;
  cursor: pointer;
}
.menu-toggle:hover { background-color: #f1f4f8; }
.menu-toggle:focus-visible { outline: 2px solid #17c4e8; outline-offset: 2px; }
.menu-backdrop { display: none; }

/* Con todos los enlaces de administrador la barra no cabe por debajo de
   ~1100px: los enlaces pasan a un panel que se despliega bajo la barra. */
@media (max-width: 1100px) {
  .nav-container { position: relative; padding: 0 1rem; }
  .header-logo-img { height: 38px; }
  .menu-toggle { display: inline-flex; }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 2;
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
    padding: 0.75rem 1rem 1rem;
    background-color: white;
    border-top: 1px solid #eef0f4;
    box-shadow: 0 12px 24px rgba(16, 35, 63, 0.12);
    max-height: calc(100dvh - 4rem);
    overflow-y: auto;
  }
  .nav-links.abierto { display: flex; animation: menuEntrada 0.18s ease-out; }

  /* Enlaces con área táctil cómoda (≥ 44px) */
  .nav-item {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border-bottom: none;
    border-left: 3px solid transparent;
    border-radius: 0.375rem;
  }
  .nav-item:hover { background-color: #f6f8fb; }
  .nav-item-active { background-color: #fdf2f8; border-left-color: #f472b6; }
  .divider { width: 100%; height: 1px; margin: 0.25rem 0; }
  .logout-btn { justify-content: center; margin: 0.25rem 0 0; padding: 0.75rem 1rem; font-size: 1rem; }

  .menu-backdrop {
    display: block;
    position: fixed;
    inset: 4rem 0 0 0;
    z-index: 1;
    background: rgba(16, 35, 63, 0.35);
  }
}

@keyframes menuEntrada {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
