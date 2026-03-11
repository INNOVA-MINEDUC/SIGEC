import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
// ... otras vistas
import { useAuthStore } from './stores/auth'
import ComplainView from './views/ComplainView.vue'
import ShowDataView from './views/ShowDataView.vue'
import ChargeData from './views/ChargeData.vue'
import UsersView from './views/UsersView.vue'
import ProfileView from './views/ProfileView.vue'
import Seguimiento from './views/Seguimiento.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'home', component: HomeView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/complains', name: 'complains', component: ComplainView },
  { path: '/show-data', name: 'showdata', component: ShowDataView },
  { path: '/charge-data', name: 'chargedata', component: ChargeData },
  { path: '/users', name: 'users', component: UsersView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/seguimiento', name: 'seguimiento', component: Seguimiento },
  
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// guard global: necesitamos crear la store dentro del guard (no al top level)
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  // restaurar estado desde localStorage si no inicializado
  if (auth.expiresAt === null && !auth.loggedIn) {
    auth.restoreFromStorage()
  }

  if (to.name !== 'login' && !auth.loggedIn) {
    return next({ name: 'login' })
  }
  if (to.name === 'login' && auth.loggedIn) {
    return next({ name: 'home' })
  }
  next()
})

export default router
