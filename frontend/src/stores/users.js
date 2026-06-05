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
    createUser(user) {

      const newUser = {
        ...user,
        id: Date.now(),
        password: user.password || 'Guatemala123',
        active: true,
        memberSince: new Date().toISOString().split('T')[0]
      }

      this.users.push(newUser)

      this.saveToLocalStorage()

    },

    // editar usuario
    updateUser(updatedUser) {

      const index = this.users.findIndex(
        user => user.id === updatedUser.id
      )

      if (index !== -1) {

        this.users[index] = {
          ...this.users[index],
          ...updatedUser
        }

        this.saveToLocalStorage()

      }

    },

    // eliminar usuario
    deleteUser(userId) {

      this.users = this.users.filter(
        user => user.id !== userId
      )

      this.saveToLocalStorage()

    },

    // activar / desactivar
    toggleActive(userId) {

      const user = this.users.find(
        user => user.id === userId
      )

      if (user) {

        user.active = !user.active

        this.saveToLocalStorage()

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