import { createRouter, createWebHistory } from 'vue-router'

import api from '@/helpers/api'

import { useAuthStore } from '@/stores/auth'

// Views
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import ComplainView from './views/ComplainView.vue'
import ShowDataView from './views/ShowDataView.vue'
import ChargeData from './views/ChargeData.vue'
import UsersView from './views/UsersView.vue'
import ProfileView from './views/ProfileView.vue'
import Seguimiento from './views/Seguimiento.vue'

// Routes
const routes = [

  // PUBLIC
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      public: true
    }
  },

  // PRIVATE
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/complains',
    name: 'complains',
    component: ComplainView,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/show-data',
    name: 'showdata',
    component: ShowDataView,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/charge-data',
    name: 'chargedata',
    component: ChargeData,
    meta: {
      requiresAuth: true
    }
  },

  // {
  //   path: '/profile',
  //   name: 'profile',
  //   component: ProfileView,
  //   meta: {
  //     requiresAuth: true
  //   }
  // },

  {
    path: '/seguimiento',
    name: 'seguimiento',
    component: Seguimiento,
    meta: {
      requiresAuth: true
    }
  },

  // ADMIN ONLY
  {
    path: '/users',
    name: 'users',
    component: UsersView,
    meta: {
      requiresAuth: true,
      // role: 'admin'
    }
  }
]

// Router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global Guard
router.beforeEach(async (to, from, next) => {

  const auth = useAuthStore()
  if (to.meta.public) {

    // si ya inició sesión
    if (auth.token && to.name === 'login') {
      return next('/')
    }

    return next()
  }

  if (!auth.token) {

    auth.logout()

    return next('/login')
  }

  try {

    const response = await api.get(
      '/auth/validate-token',
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    )

    auth.user = response.data

    if (
      to.meta.role &&
      response.data.role !== to.meta.role
    ) {

      return next('/')
    }

    next()

  } catch (error) {

    console.error(error)

    auth.logout()

    return next('/login')
  }
})

export default router