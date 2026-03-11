// src/stores/auth.js
import { defineStore } from 'pinia'
import { useUserStore } from './users'

export const useAuthStore = defineStore('auth', {

  state: () => ({
    loggedIn: false,
    expiresAt: null,
    user: null
  }),

  actions: {

    login(email, password) {

      const userStore = useUserStore()

      // buscar usuario por email
      const user = userStore.users.find(
        u => u.email === email && u.password === password
      )

      if (!user) return false

      if (!user.active) {
        alert('Este usuario está desactivado')
        return false
      }

      const expiresAt = Date.now() + 24 * 60 * 60 * 1000

      this.loggedIn = true
      this.expiresAt = expiresAt
      this.user = user

      localStorage.setItem('auth', JSON.stringify({
        loggedIn: true,
        expiresAt,
        user
      }))

      return true
    },

    logout() {

      this.loggedIn = false
      this.expiresAt = null
      this.user = null

      localStorage.removeItem('auth')

    },

    restoreFromStorage() {

      const data = localStorage.getItem('auth')

      if (!data) return

      try {

        const parsed = JSON.parse(data)

        if (Date.now() > parsed.expiresAt) {
          localStorage.removeItem('auth')
          return
        }

        this.loggedIn = parsed.loggedIn === true
        this.expiresAt = parsed.expiresAt
        this.user = parsed.user || null

      } catch (e) {

        localStorage.removeItem('auth')

      }

    }

  }

})