import { defineStore } from 'pinia'
import api from '@/helpers/api'

export const useUserStore = defineStore('user', {

  state: () => ({

    // usuario logueado
    currentUserId: Number(localStorage.getItem('currentUserId')) || null,

users: [],

  }),

  getters: {

    // usuario autenticado
    currentUser: (state) => {
      return state.users.find(
        user => Number(user.id) === Number(state.currentUserId)
      )
    },

    // saber si hay sesión
    isAuthenticated: (state) => state.currentUserId !== null,

    admins: (state) =>
      state.users.filter(user => user.role === 'Admin'),

    activeUsers: (state) =>
      state.users.filter(user => user.active)

  },

  actions: {

    async fetchUsers() {

  try {

    const response = await api.get('/users')

    this.users = response.data.map(user => ({

      id: user.id,

      name: user.name,

      email: user.email,

      role: user.role?.name || 'Sin rol',

      roleId: user.roleId,

      active: user.isActive,

      memberSince: user.createdAt?.split('T')[0],

      phone: user.phone || '',

      location: user.location || '',

    }))

  } catch (error) {

    console.error(error)

  }

},

    // guardar datos en localStorage
    saveToLocalStorage() {

      localStorage.setItem('users', JSON.stringify(this.users))
      localStorage.setItem('currentUserId', this.currentUserId)

    },

    // login
    login(email, password) {

      const user = this.users.find(
        u => u.email === email && u.password === password
      )

      if (!user) {
        return {
          success: false,
          message: 'Credenciales incorrectas'
        }
      }

      if (!user.active) {
        return {
          success: false,
          message: 'Usuario desactivado'
        }
      }

      this.currentUserId = Number(user.id)

      this.saveToLocalStorage()

      return {
        success: true,
        user
      }

    },

    // logout
    logout() {

      this.currentUserId = null

      localStorage.removeItem('currentUserId')

    },

    // crear usuario
    async createUser(userData) {
      try {
        const payload = {
          name:     userData.name,
          email:    userData.email,
          roleId:   userData.roleId,
          password: userData.password || 'Guatemala123',
        }
        await api.post('/users', payload)
        await this.fetchUsers()
      } catch (error) {
        console.error('Error al crear usuario:', error)
        throw error
      }
    },

    // editar usuario
    async updateUser(updatedUser) {
      try {
        const payload = {
          name:   updatedUser.name,
          email:  updatedUser.email,
          roleId: updatedUser.roleId,
        }
        if (updatedUser.password) payload.password = updatedUser.password
        await api.put(`/users/${updatedUser.id}`, payload)
        await this.fetchUsers()
      } catch (error) {
        console.error('Error al actualizar usuario:', error)
        throw error
      }
    },

    // activar / desactivar
    async toggleActive(userId) {
      try {
        const res = await api.patch(`/users/${userId}/toggle-active`)
        const updated = this.users.find(u => u.id === userId)
        if (updated) updated.active = res.data.isActive
      } catch (error) {
        console.error('Error al cambiar estado del usuario:', error)
        throw error
      }
    },

    // cambiar contraseña
    changePassword(userId, newPassword) {

      const user = this.users.find(
        u => u.id === userId
      )

      if (user) {

        user.password = newPassword

        this.saveToLocalStorage()

      }

    },

    // reset password
    resetPassword(userId) {

      const user = this.users.find(
        u => u.id === userId
      )

      if (user) {

        user.password = '123456'

        this.saveToLocalStorage()

        alert(`Contraseña de ${user.name} reiniciada a: 123456`)

      }

    }

  }

})