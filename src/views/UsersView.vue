<template>
  <div class="users-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero-dash">
      <img :src="heroImage" alt="Gestión de Usuarios" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Administra los privilegios y los miembros.</p>
        <h1 class="hero-title">Gestión de Usuarios</h1>
      </div>
    </section>

    <!-- ── MAIN CONTENT ── -->
    <section class="py-8">
      <div class="container-max">

        <!-- Header & Add Button -->
        <div class="users-header">
          <div>
            <h2 class="section-title">Gestión de Usuarios</h2>
            <p class="section-subtitle">Administra los privilegios y el estado de los miembros.</p>
          </div>
          <button class="btn-pink" @click="openDialog()">Nuevos Usuarios</button>
        </div>

        <!-- Table Card -->
        <div class="card-box mt-6">

          <!-- Filters -->
          <div class="filters-row">
            <div class="search-box">
              <v-icon size="20" class="search-icon">mdi-magnify</v-icon>
              <input type="text" v-model="search" placeholder="Buscar por nombre o email" class="search-input" />
            </div>
            <div class="role-filter">
              <label class="filter-label">Filtrar por rol</label>
              <div class="select-wrapper">
                <select v-model="roleFilter" class="role-select">
                  <option value="">Todos</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Usuario">Usuario</option>
                </select>
                <v-icon size="16" class="select-icon">mdi-chevron-down</v-icon>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="users-table">
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
                      <div class="avatar-bubble">{{ user.name.charAt(0) }}</div>
                      <div>
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span :class="['role-badge', 'role-' + user.role.toLowerCase()]">{{ user.role }}</span></td>
                  <td class="text-gray">{{ user.phone }}</td>
                  <td class="text-gray">{{ user.location }}</td>
                  <td class="text-gray">{{ user.memberSince }}</td>
                  <td>
                    <div class="status-indicator" @click="toggleStatus(user.id)" style="cursor:pointer">
                      <span :class="['dot', user.active ? 'active' : 'inactive']"></span>
                      {{ user.active ? 'En línea' : 'Desconectado' }}
                    </div>
                  </td>
                  <td class="text-right actions-cell">
                    <button class="action-btn edit-btn"   @click="openDialog(user)"        title="Editar"><v-icon size="18">mdi-pencil</v-icon></button>
                    <button class="action-btn delete-btn" @click="openDeleteDialog(user)"  title="Eliminar"><v-icon size="18">mdi-delete</v-icon></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />

    <!-- DIALOG: NUEVO/EDITAR -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 font-weight-bold px-6 py-4" style="color:#555555; border-bottom:1px solid #f0f0f0;">
          {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </v-card-title>
        <v-card-text class="pt-6 px-6">
          <v-row>
            <v-col cols="12"><v-text-field v-model="editedItem.name"     label="Nombre"     variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12"><v-text-field v-model="editedItem.email"    label="Correo"     variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12"><v-select     v-model="editedItem.role"     :items="['Admin','Editor','Usuario']" label="Rol" variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12"><v-text-field v-model="editedItem.phone"    label="Teléfono"   variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12"><v-text-field v-model="editedItem.location" label="Ubicación"  variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.password" label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hint="Si no se asigna una contraseña se usará la por defecto: Guatemala123"
                persistent-hint variant="outlined" density="comfortable" color="#ff9797"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="text"  color="grey-darken-2" @click="closeDialog" class="text-none font-weight-medium">Cancelar</v-btn>
          <v-btn color="#ff9797" variant="flat"         @click="saveUser"    class="text-none font-weight-medium px-6 text-white">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG: ELIMINAR -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 font-weight-bold px-6 py-4" style="color:#555555; border-bottom:1px solid #f0f0f0;">
          Confirmar eliminación
        </v-card-title>
        <v-card-text class="px-6 pb-2 text-body-1">
          ¿Seguro que deseas eliminar al usuario <strong>{{ selectedUser?.name }}</strong>?
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn variant="text"     color="grey-darken-2" @click="deleteDialog = false" class="text-none font-weight-medium">Cancelar</v-btn>
          <v-btn color="red-darken-1" variant="flat"      @click="confirmDelete"        class="text-none font-weight-medium px-6">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUserStore } from '@/stores/users'
import heroImage from '@/assets/ninas embarazadas -39.png'

const userStore = useUserStore()

// ── State ──────────────────────────────────────────────
const search       = ref('')
const roleFilter   = ref('')
const dialog       = ref(false)
const isEditing    = ref(false)
const deleteDialog = ref(false)
const selectedUser = ref(null)
const showPassword = ref(false)

const defaultItem = { id: null, name: '', email: '', role: 'Usuario', phone: '', location: '', memberSince: '', active: true, password: 'Guatemala123' }
const editedItem  = ref({ ...defaultItem })

// ── Computed ───────────────────────────────────────────
const filteredUsers = computed(() => {
  const s = search.value.toLowerCase()
  const r = roleFilter.value
  return userStore.users.filter(u =>
    (u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
    (!r || u.role === r)
  )
})

// ── Methods ────────────────────────────────────────────
function openDialog(item = null) {
  isEditing.value  = !!item
  editedItem.value = item ? { ...item } : { ...defaultItem }
  dialog.value     = true
}

function closeDialog() {
  dialog.value = false
  nextTick(() => { editedItem.value = { ...defaultItem } })
}

function saveUser() {
  if (isEditing.value) {
    userStore.updateUser(editedItem.value)
  } else {
    if (!editedItem.value.memberSince)
      editedItem.value.memberSince = new Date().toISOString().split('T')[0]
    userStore.createUser(editedItem.value)
  }
  closeDialog()
}

function openDeleteDialog(user) { selectedUser.value = user; deleteDialog.value = true }
function confirmDelete()        { if (selectedUser.value) userStore.deleteUser(selectedUser.value.id); deleteDialog.value = false; selectedUser.value = null }
function toggleStatus(id)       { userStore.toggleActive(id) }
</script>

<style scoped>
.users-page {
  background-color: #fcfcfc;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.container-max { max-width: 65rem; margin: 0 auto; padding: 0 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 4rem; }
.mt-6 { margin-top: 1.5rem; }

/* HERO */
.hero-dash { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg   { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(255,151,151,0) 0%, rgba(255,151,151,0.2) 40%, rgba(255,151,151,0.95) 100%);
}
.hero-content {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  padding-bottom: 3.5rem; padding-inline: 1.5rem; text-align: center;
}
.hero-top-text { color: white; font-size: 32px; font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: -0.25rem; line-height: 1.1; }
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; margin-bottom: 0; }

/* HEADER */
.users-header    { display: flex; justify-content: space-between; align-items: flex-end; }
.section-title   { font-size: 24px; font-weight: 700; color: #555555; margin-bottom: 0.25rem; line-height: 1.2; }
.section-subtitle { font-size: 14px; color: #ff9797; margin: 0; }
.btn-pink { background-color: #ff9797; color: white; font-weight: 600; font-size: 14px; padding: 0.6rem 1.5rem; border-radius: 9999px; border: none; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 2px 4px rgba(255,151,151,0.4); }
.btn-pink:hover { opacity: 0.9; }

/* CARD */
.card-box { background-color: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; overflow: hidden; }

/* FILTERS */
.filters-row { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f0f0f0; background-color: #fcfcfc; }
.search-box  { position: relative; display: flex; align-items: center; width: 100%; max-width: 350px; background-color: #f3f3f3; border-radius: 4px; padding: 0 0.75rem; height: 38px; }
.search-icon  { color: #a0a0a0; margin-right: 0.5rem; }
.search-input { border: none; background: transparent; width: 100%; font-size: 14px; color: #333; outline: none; }
.search-input::placeholder { color: #a0a0a0; }
.role-filter  { display: flex; align-items: center; gap: 0.5rem; position: relative; }
.filter-label { font-size: 12px; color: #888; position: absolute; top: -8px; left: 8px; background-color: #fcfcfc; padding: 0 4px; z-index: 1; }
.select-wrapper { position: relative; width: 180px; }
.role-select  { width: 100%; appearance: none; background-color: transparent; border: 1px solid #e0e0e0; border-radius: 4px; padding: 0.4rem 2rem 0.4rem 0.75rem; font-size: 14px; color: #333; outline: none; cursor: pointer; height: 38px; }
.select-icon  { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #a0a0a0; }

/* TABLE */
.table-responsive { width: 100%; overflow-x: auto; }
.users-table { width: 100%; border-collapse: collapse; text-align: left; }
.users-table th { background-color: #fcfcfc; color: #888888; font-size: 11px; font-weight: 600; text-transform: capitalize; padding: 0.8rem 1.5rem; white-space: nowrap; border-bottom: 1px solid #f0f0f0; }
.users-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.users-table tr:last-child td { border-bottom: none; }

/* USER INFO */
.user-info    { display: flex; align-items: center; gap: 1rem; }
.avatar-bubble { width: 36px; height: 36px; border-radius: 50%; background-color: #fff0f0; color: #ff7b7b; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.user-name    { font-weight: 700; color: #1a1a1a; font-size: 13px; line-height: 1.2; }
.user-email   { font-size: 12px; color: #a0a0a0; margin-top: 0.1rem; }

/* BADGES */
.role-badge   { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 11px; font-weight: 600; }
.role-admin   { background-color: #ff9797; color: #ffffff; }
.role-usuario { background-color: #f5f5f5; color: #6d6d6d; }
.role-editor  { background-color: #ffe4e4; color: #ff5c5c; }

.text-gray { color: #1a1a1a; font-size: 13px; font-weight: 500; }

/* STATUS */
.status-indicator { display: flex; align-items: center; gap: 0.4rem; font-size: 12px; font-weight: 600; color: #1a1a1a; }
.dot          { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot.active   { background-color: #10b981; }
.dot.inactive { background-color: #ef4444; }

/* ACTIONS */
.actions-cell { white-space: nowrap; }
.action-btn   { background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: background-color 0.2s; margin-left: 0.5rem; }
.edit-btn     { color: #ff9797; }
.edit-btn:hover   { background-color: #fff0f0; }
.delete-btn   { color: #ef4444; }
.delete-btn:hover { background-color: #fef2f2; }
.text-right   { text-align: right; }
</style>
