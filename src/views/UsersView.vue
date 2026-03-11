<template>
  <div class="admin-container">

    <header class="main-header">
      <div class="header-content">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los privilegios y el estado de los miembros.</p>
      </div>

      <v-btn color="indigo" prepend-icon="mdi-plus" @click="openDialog()">
        Nuevo Usuario
      </v-btn>
    </header>

    <div class="card shadow-soft">

      <!-- filtros -->
      <v-row class="px-4 py-4" align="center">

        <v-col cols="12" md="6">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar por nombre o email"
            density="compact" variant="filled" hide-details clearable />
        </v-col>

        <v-col cols="12" md="4">
          <v-select v-model="roleFilter" :items="['Admin', 'Editor', 'Usuario']" label="Filtrar por rol"
            variant="outlined" density="compact" hide-details clearable />
        </v-col>

      </v-row>

      <!-- tabla -->
      <div class="table-responsive">

        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Ubicación</th>
              <th>Miembro desde</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="user in filteredUsers" :key="user.id">

              <td>
                <div class="user-info">
                  <div class="avatar">{{ user.name.charAt(0) }}</div>
                  <div>
                    <div class="name">{{ user.name }}</div>
                    <div class="email">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <td>
                <span :class="['badge', 'role-' + user.role.toLowerCase()]">
                  {{ user.role }}
                </span>
              </td>

              <td>{{ user.phone }}</td>
              <td>{{ user.location }}</td>
              <td>{{ user.memberSince }}</td>

              <td>
                <div class="status-indicator" @click="toggleStatus(user.id)" style="cursor:pointer">
                  <span :class="['dot', user.active ? 'active' : 'inactive']"></span>
                  {{ user.active ? 'En línea' : 'Desconectado' }}
                </div>
              </td>

              <td class="text-right">

                <v-tooltip text="Editar usuario" location="top">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-pencil" variant="text" color="indigo" @click="openDialog(user)" />
                  </template>
                </v-tooltip>


                <v-tooltip text="Eliminar usuario" location="top">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-delete" variant="text" color="red-darken-1"
                      @click="openDeleteDialog(user)" />
                  </template>
                </v-tooltip>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

    <!-- dialog usuario -->
    <v-dialog v-model="dialog" max-width="500px">

      <v-card>

        <v-card-title class="text-h5 bg-indigo text-white px-4 py-3">
          {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </v-card-title>

        <v-card-text class="pt-4">

          <v-container>

            <v-row>

              <v-col cols="12">
                <v-text-field v-model="editedItem.name" label="Nombre" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="editedItem.email" label="Correo" />
              </v-col>



              <v-col cols="12">
                <v-select v-model="editedItem.role" :items="['Admin', 'Editor', 'Usuario']" label="Rol" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="editedItem.phone" label="Teléfono" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="editedItem.location" label="Ubicación" />
              </v-col>



              <v-col cols="12">
                <v-text-field v-model="editedItem.password" label="Contraseña"
                  :type="showPassword ? 'text' : 'password'" prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  hint="Si no se asigna una contraseña se usará la contraseña por defecto: Guatemala123"
                  persistent-hint />
              </v-col>

            </v-row>

          </v-container>

        </v-card-text>

        <v-card-actions>

          <v-spacer />

          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>

          <v-btn color="indigo" @click="saveUser">Guardar</v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">

      <v-card>

        <v-card-title class="text-h6">
          Confirmar eliminación
        </v-card-title>

        <v-card-text>
          ¿Seguro que deseas eliminar al usuario
          <strong>{{ selectedUser?.name }}</strong>?
        </v-card-text>

        <v-card-actions>

          <v-spacer />

          <v-btn variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>

          <v-btn color="red" variant="flat" @click="confirmDelete">
            Eliminar
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

  </div>
</template>

<script setup>

import { ref, computed, nextTick } from 'vue'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()

const search = ref('')
const roleFilter = ref('')
const dialog = ref(false)
const isEditing = ref(false)

const deleteDialog = ref(false)
const selectedUser = ref(null)

const showPassword = ref(false)

const openDeleteDialog = (user) => {

  selectedUser.value = user
  deleteDialog.value = true

}

const confirmDelete = () => {

  if (selectedUser.value) {

    userStore.deleteUser(selectedUser.value.id)

  }

  deleteDialog.value = false
  selectedUser.value = null

}

const defaultItem = {
  id: null,
  name: '',
  email: '',
  role: 'Usuario',
  phone: '',
  location: '',
  memberSince: '',
  active: true,
  password: 'Guatemala123'
}

const editedItem = ref({ ...defaultItem })

// usuarios filtrados desde pinia
const filteredUsers = computed(() => {

  const s = search.value.toLowerCase()
  const r = roleFilter.value

  return userStore.users.filter(user => {

    const matchSearch =
      user.name.toLowerCase().includes(s) ||
      user.email.toLowerCase().includes(s)

    const matchRole = !r || user.role === r

    return matchSearch && matchRole

  })

})

const openDialog = (item = null) => {

  if (item) {

    isEditing.value = true
    editedItem.value = { ...item }

  } else {

    isEditing.value = false
    editedItem.value = { ...defaultItem }

  }

  dialog.value = true

}

const closeDialog = () => {

  dialog.value = false

  nextTick(() => {
    editedItem.value = { ...defaultItem }
  })

}

const saveUser = () => {

  if (isEditing.value) {

    // editar usuario
    userStore.updateUser(editedItem.value)

  } else {

    // crear usuario
    userStore.createUser(editedItem.value)

  }

  closeDialog()

}


const toggleStatus = (id) => {

  userStore.toggleActive(id)

}

</script>

<style scoped>
.admin-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f1f5f9;
  padding: 12px 20px;
  text-align: left;
  font-size: 12px;
  color: #64748b;
}

td {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 35px;
  height: 35px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
}

.name {
  font-weight: 600;
}

.email {
  color: #64748b;
  font-size: 13px;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.role-admin {
  background: #f3e8ff;
  color: #7e22ce;
}

.role-editor {
  background: #e0f2fe;
  color: #0369a1;
}

.role-usuario {
  background: #f1f5f9;
  color: #475569;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.active {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.dot.inactive {
  background: #94a3b8;
}
</style>
