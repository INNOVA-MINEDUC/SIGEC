import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Login se carga eager (es la primera página que ve el usuario)
import LoginView from './views/LoginView.vue'

// Las demás vistas se cargan lazy (code splitting)
const HomeView      = () => import('./views/HomeView.vue')
const DashboardView = () => import('./views/DashboardView.vue')
const ComplainView  = () => import('./views/ComplainView.vue')
const ShowDataView  = () => import('./views/ShowDataView.vue')
const ChargeData    = () => import('./views/ChargeData.vue')
const UsersView     = () => import('./views/UsersView.vue')
const ProfileView   = () => import('./views/ProfileView.vue')
const Seguimiento   = () => import('./views/Seguimiento.vue')

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
