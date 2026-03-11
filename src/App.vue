<template>
  <v-app>
    <!-- APP BAR -->
    <v-app-bar
  v-if="logged"
  color="primary"
  elevation="1"
>
      <!-- Hamburguesa (móvil / tablet) -->
      <v-btn icon class="d-md-none" @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <!-- TÍTULO -->
      <h2
        class="font-weight-bold"
        style="margin-inline: 2rem; font-size: clamp(.9rem, 2.5vw, 1.5rem);"
      >
        SIGEC
      </h2>

      <v-spacer />

      <!-- MENÚ USUARIO (desktop) -->
      <v-menu location="bottom end" v-if="logged">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            density="comfortable"
            icon
            style="margin-right: 2rem;"
          >
            <v-avatar color="red" size="36">
              <span class="text-subtitle-2 font-weight-bold">BL</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item to="/profile" prepend-icon="mdi-account" title="Mi cuenta" />
          <v-list-item prepend-icon="mdi-export" title="Cerrar sesión" @click="logout" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- SIDEBAR (ÚNICO, RESPONSIVE) -->
    <v-navigation-drawer
      v-if="logged"
      v-model="drawer"
      :permanent="lgAndUp"
      :temporary="mdAndDown"
      :rail="lgAndUp && rail"
      width="260"
      rail-width="72"
      color="#0f1724"
      class=""
    >
      <!-- Brand -->
      <v-list>
        <v-list-item>
          <template #prepend>
            <v-avatar color="indigo-darken-2">M</v-avatar>
          </template>

          <v-list-item-title v-if="!rail" class="text-white font-weight-bold">
            MINEDUC
          </v-list-item-title>

          <v-list-item-subtitle v-if="!rail">
            Seguimiento - Casos
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider class="my-3" />

      <!-- Menu -->
      <v-list nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.key"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="!rail ? item.title : ''"
          color="primary"
          rounded="lg"
          @click="mdAndDown && (drawer = false)"
        />
      </v-list>

      <!-- Footer -->
      <template #append>
        <div class="pa-3 text-center">
          <div v-if="!rail" class="text-caption text-grey-lighten-1">
            Acceso restringido — Uso administrativo
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- MAIN -->
    <v-main class="bg-grey-lighten-5">
      <div class="main-header" v-if="logged">
        <!-- Toggle rail solo desktop -->
        <v-btn
          icon
          variant="plain"
          color="black"
          @click="toggleRail"
          class="d-none d-md-flex"
        >
          <v-icon>
            {{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
          </v-icon>
        </v-btn>

        <h4>{{ pageTitle }}</h4>
      </div>

      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from './stores/auth'

/* Auth */
const auth = useAuthStore()
const logged = computed(() => auth.loggedIn)
const router = useRouter()
const route = useRoute()

function logout() {
  auth.logout()
  drawer.value = false
  router.push('/login')
}

/* Responsive */
const { mdAndDown, lgAndUp } = useDisplay()

/* Sidebar state */
const drawer = ref(true)
const rail = ref(false)

/* Menu */
const menuItems = [
  { key: 'inicio', title: 'Inicio', icon: 'mdi-home-outline', to: '/' },
  { key: 'quejas', title: 'Quejas', icon: 'mdi-alert-circle-outline', to: '/complains' },
  { key: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  { key: 'importar', title: 'Importar Datos', icon: 'mdi-database-import-outline', to: '/charge-data' },
  { key: 'usuarios', title: 'Usuarios', icon: 'mdi-account-multiple-outline', to: '/users' },
]

const pageTitle = computed(() => {
  const current = menuItems.find(i => i.to === route.path)
  return current?.title ?? 'Registro de Casos'
})

function toggleRail() {
  rail.value = !rail.value
}
</script>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.main-header h4 {
  font-family: system-ui, sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: bold;
  color: #282727;
  margin-left: 1rem;
}
</style>
