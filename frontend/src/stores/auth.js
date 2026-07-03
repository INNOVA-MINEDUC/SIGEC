import { defineStore } from 'pinia'
import api from '@/helpers/api'

export const useAuthStore = defineStore('auth', {

  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  getters: {
    loggedIn: (state) => !!state.token
  },

  actions: {

    login(data) {

      this.token = data.token
      this.user = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )
    },

    logout() {

      this.token = null
      this.user = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // Cierre de sesión explícito: registra el evento en la auditoría antes de limpiar el estado
    async logoutSession() {
      try {
        if (this.token) await api.post('/auth/logout')
      } catch (error) {
        console.error('Error registrando cierre de sesión:', error)
      } finally {
        this.logout()
      }
    }
  }
})