<template>
  <div class="users-page">
    <AppNavbar />

    <section class="hero-dash">
      <img src="/imgs/img8.jpg" alt="Gestión de Usuarios" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Administra los privilegios y los miembros.</p>
        <h1 class="hero-title">Gestión de usuarios</h1>
      </div>
    </section>

    <section class="py-8">
      <div class="container-max">

        <div class="users-header">
          <div>
            <h2 class="section-title">Gestión de usuarios</h2>
            <p class="section-subtitle">Administra los privilegios y el estado de los miembros.</p>
          </div>
          <button class="btn-pink" @click="openDialog()">Nuevo usuario</button>
        </div>

        <div class="card-box mt-6">

          <div class="filters-row">
            <div class="search-box">
              <v-icon size="20" class="search-icon">mdi-magnify</v-icon>
              <input type="text" v-model="search" placeholder="Buscar por nombre o email" class="search-input" />
            </div>
            <div class="role-filter">
              <label class="filter-label">Filtrar por rol</label>
              <div class="select-wrapper">
            <v-select
  v-model="roleFilter"
  :items="roles"
  label="Filtrar por rol"
  variant="outlined"
  density="compact"
  clearable
/>
                <v-icon size="16" class="select-icon">mdi-chevron-down</v-icon>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="users-table">
              <thead>
                <tr >
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td class="col-usuario">
                    <div class="user-info">
                      <div class="avatar-bubble">{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</div>
                      <div>
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="col-rol">
                    <span :class="['role-badge', 'role-' + (user.role?.toLowerCase() || 'user')]">
                      {{ ROLE_LABELS[user.role?.toLowerCase()] || user.role || 'Usuario' }}
                    </span>
                    <div v-if="user.departamento" class="user-depto">
                      {{ formatearNombreGeografico(user.departamento) }}
                    </div>
                  </td>
                  <td class="col-estado">
                    <div class="status-indicator" @click="openToggleDialog(user)" style="cursor:pointer">
                      <span :class="['dot', user.active ? 'active' : 'inactive']"></span>
                      {{ user.active ? 'Activo' : 'Inactivo' }}
                    </div>
                  </td>
                  <td class="text-right actions-cell">
                    <button class="action-btn edit-btn" @click="openDialog(user)" title="Editar"><v-icon size="18">mdi-pencil</v-icon></button>
                  </td>
                </tr>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted celda-vacia">No se encontraron usuarios.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />

    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 font-weight-bold px-6 py-4" style="color:#555555; border-bottom:1px solid #f0f0f0;">
          {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </v-card-title>
        <v-card-text class="pt-6 px-6">
          <v-row>
            <v-col cols="12"><v-text-field v-model="editedItem.name"     label="Nombre"     variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12"><v-text-field v-model="editedItem.email"    label="Correo"     variant="outlined" density="comfortable" color="#ff9797" /></v-col>
            <v-col cols="12">
              <v-select
                v-model="editedItem.roleId"
                :items="rolesDisponibles"
                item-title="title"
                item-value="value"
                label="Rol"
                variant="outlined"
                density="comfortable"
                color="#10233f"
  base-color="#10233f"
              />
            </v-col>
            <v-col v-if="requiereDepartamento" cols="12">
              <v-select
                v-model="editedItem.departamentoId"
                :items="departamentosDisponibles"
                item-title="title"
                item-value="value"
                label="Departamento asignado"
                hint="El perfil Consulta solo verá los casos de este departamento"
                persistent-hint
                variant="outlined"
                density="comfortable"
                color="#10233f"
                base-color="#10233f"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.password" label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hint="Si no se asigna una contraseña se usará la por defecto: Guatemala123"
                persistent-hint variant="outlined" density="comfortable" 
                color="#10233f"
  base-color="#10233f"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <p v-if="errorGuardar" class="error-guardar" role="alert">{{ errorGuardar }}</p>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="text"  color="grey-darken-2" @click="closeDialog" class="text-none font-weight-medium">Cancelar</v-btn>
          <v-btn color="#10233f" variant="flat"         @click="saveUser"   class="text-none font-weight-medium px-6 text-white">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="toggleDialog" max-width="420">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 font-weight-bold px-6 py-4" style="color:#555555; border-bottom:1px solid #f0f0f0;">
          {{ selectedUser?.active ? 'Inactivar usuario' : 'Activar usuario' }}
        </v-card-title>
        <v-card-text class="px-6 pb-2 text-body-1">
          <span v-if="selectedUser?.active">
            ¿Deseas inactivar a <strong>{{ selectedUser?.name }}</strong>?
            El usuario no podrá iniciar sesión mientras esté inactivo.
          </span>
          <span v-else>
            ¿Deseas activar nuevamente a <strong>{{ selectedUser?.name }}</strong>?
          </span>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn variant="text" color="grey-darken-2" @click="toggleDialog = false" class="text-none font-weight-medium">Cancelar</v-btn>
          <v-btn
            :color="selectedUser?.active ? 'orange-darken-2' : 'green-darken-1'"
            variant="flat"
            @click="confirmToggle"
            class="text-none font-weight-medium px-6"
          >
            {{ selectedUser?.active ? 'Inactivar' : 'Activar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUserStore } from '@/stores/users'
import api from '@/helpers/api'
import { ROLE_LABELS, tieneAlcanceDepartamental } from '@/helpers/permisos'
import { formatearNombreGeografico } from '@/helpers/formatoNombres'
import heroImage from '@/assets/ninas embarazadas -39.png'

// Filtro de la tabla: todos los perfiles conocidos
const roles = [
  { title: 'Todos', value: '' },
  ...Object.entries(ROLE_LABELS).map(([value, title]) => ({ title, value })),
]

// Perfiles asignables, desde el catálogo de roles del backend
const catalogoRoles = ref([])
const rolesDisponibles = computed(() =>
  catalogoRoles.value.map(r => ({ title: ROLE_LABELS[r.name] || r.name, value: r.id, name: r.name }))
)

// Departamentos para el alcance del perfil "Consulta"
const departamentosDisponibles = ref([])

const errorGuardar = ref('')

const userStore = useUserStore()

// ── State ──────────────────────────────────────────────
const search       = ref('')
const roleFilter   = ref('')
const dialog       = ref(false)
const isEditing    = ref(false)
const toggleDialog = ref(false)
const selectedUser = ref(null)
const showPassword = ref(false)

const defaultItem = {
  id: null,
  name: '',
  email: '',
  roleId: 2,
  departamentoId: null,
  password: '',
  isActive: true
}
const editedItem = ref({ ...defaultItem })

// ── Computed ───────────────────────────────────────────
const filteredUsers = computed(() => {
  const s = search.value.toLowerCase()
  const r = roleFilter.value // 'admin' o 'user'
  
  // Validamos que userStore.users sea un array antes de filtrar
  const usersList = userStore.users || []
  
  return usersList.filter(u => {
    const matchesSearch = (u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s))
    const matchesRole = !r || u.role?.toLowerCase() === r
    return matchesSearch && matchesRole
  })
})

// El perfil "Consulta" necesita un departamento asignado
const requiereDepartamento = computed(() => {
  const rol = rolesDisponibles.value.find(r => r.value === editedItem.value.roleId)
  return tieneAlcanceDepartamental(rol?.name)
})

// ── Methods ────────────────────────────────────────────
function openDialog(item = null) {
  errorGuardar.value = ''
  isEditing.value  = !!item
  editedItem.value = item ? { ...item } : { ...defaultItem }
  dialog.value     = true
}

function closeDialog() {
  dialog.value = false
  nextTick(() => { editedItem.value = { ...defaultItem } })
}

async function saveUser() {
  errorGuardar.value = ''
  if (requiereDepartamento.value && !editedItem.value.departamentoId) {
    errorGuardar.value = 'Seleccione el departamento al que tendrá acceso el perfil Consulta.'
    return
  }
  // Los demás perfiles no llevan departamento (el backend también lo limpia)
  const datos = { ...editedItem.value, departamentoId: requiereDepartamento.value ? editedItem.value.departamentoId : null }
  try {
    if (isEditing.value) {
      await userStore.updateUser(datos)
    } else {
      await userStore.createUser(datos)
    }
    closeDialog()
  } catch (error) {
    errorGuardar.value = error.response?.data?.message || 'No se pudo guardar el usuario.'
  }
}

function openToggleDialog(user) { selectedUser.value = user; toggleDialog.value = true }
async function confirmToggle() {
  if (selectedUser.value) {
    try {
      await userStore.toggleActive(selectedUser.value.id)
    } catch {
      // error ya logueado en el store
    }
  }
  toggleDialog.value = false
  selectedUser.value = null
}



onMounted(async () => {
  userStore.fetchUsers()
  try {
    const [rRoles, rDept] = await Promise.all([api.get('/roles'), api.get('/dept')])
    catalogoRoles.value = rRoles.data || []
    departamentosDisponibles.value = (rDept.data.data || []).map(d => ({
      title: formatearNombreGeografico(d.nombre),
      value: d.id,
    }))
  } catch (error) {
    console.error('Error cargando roles o departamentos:', error)
  }
})
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
.hero-dash { position: relative; width: 100%; overflow: hidden; height: clamp(260px, 45vw, 500px); }
.hero-bg   { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.hero-overlay {
  position: absolute; inset: 0;
background: linear-gradient(to bottom,
      rgba(16, 35, 63, 0) 0%,
      rgba(16, 35, 63, 0.2) 40%,
      rgba(16, 35, 63, 0.95) 100%);
}
.hero-content {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  padding-bottom: clamp(1.75rem, 5vw, 3.5rem); padding-inline: 1.5rem; text-align: center;
}
.hero-top-text { color: white; font-size: clamp(1.25rem, 3.5vw, 2rem); font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: -0.25rem; line-height: 1.1; }
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: clamp(2rem, 7vw, 4rem); font-weight: 700; line-height: 1.15; margin-bottom: 0; }

/* HEADER */
.users-header    { display: flex; justify-content: space-between; align-items: flex-end; background-color: #10233f; padding: 2rem; border-radius: 20px;}
.section-title   { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 0.25rem; line-height: 1.2; }
.section-subtitle { font-size: 14px; color: #17c4e8; margin: 0; }
.btn-pink { background-color: #10233f; color: white; font-weight: 600; font-size: 14px; padding: 0.6rem 1.5rem; border-radius: 9999px; border: none; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 2px 4px rgb(23, 196, 232); }
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
.users-table th { background-color: #10233f; color: #fff; font-size: 13px; font-weight: 600; text-transform: capitalize; padding: 0.8rem 1.5rem; white-space: nowrap; border-bottom: 1px solid #f0f0f0; }
.users-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.users-table tr:last-child td { border-bottom: none; }

/* USER INFO */
.user-info    { display: flex; align-items: center; gap: 1rem; }
.avatar-bubble { width: 36px; height: 36px; border-radius: 50%; background-color: #bccee8; color: #10233f; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.user-name    { font-weight: 700; color: #1a1a1a; font-size: 13px; line-height: 1.2; }
.user-email   { font-size: 12px; color: #a0a0a0; margin-top: 0.1rem; }

/* BADGES */
.role-badge   { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 11px; font-weight: 600; }
.role-admin     { background-color: #10233f; color: #ffffff; }
.role-moderator { background-color: #ff9797; color: #ffffff; }
.role-user      { background-color: #f5f5f5; color: #6d6d6d; }
.role-consulta         { background-color: #e0f6fb; color: #0b6f86; }
.role-consulta_general { background-color: #17c4e8; color: #10233f; }
.user-depto    { margin-top: 0.25rem; font-size: 11px; color: #6a8299; }
.error-guardar { margin: 0 1.5rem 0.75rem; font-size: 0.8rem; color: #b71c1c; }

.text-gray { color: #1a1a1a; font-size: 13px; font-weight: 500; }

/* STATUS */
.status-indicator { display: flex; align-items: center; gap: 0.4rem; font-size: 12px; font-weight: 600; color: #1a1a1a; }
.dot          { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot.active   { background-color: #10b981; }
.dot.inactive { background-color: #ef4444; }

/* ACTIONS */
.actions-cell { white-space: nowrap; }
.action-btn   { background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: background-color 0.2s; margin-left: 0.5rem; }
.edit-btn     { color: #17c4e8; }
.edit-btn:hover   { background-color: #d8f0fc; }
.delete-btn   { color: #ef4444; }
.delete-btn:hover { background-color: #fef2f2; }
.text-right   { text-align: right; }
.text-center { text-align: center; }

/* ── RESPONSIVE ────────────────────────────────────────────────────────── */
/* Tablet: encabezado y filtros se acomodan en varias líneas */
@media (max-width: 768px) {
  .container-max { padding: 0 1rem; }
  .users-header { flex-wrap: wrap; align-items: center; gap: 1rem; padding: 1.5rem; border-radius: 16px; }
  .filters-row { flex-wrap: wrap; gap: 1.25rem; padding: 1.25rem 1rem; }
  .search-box { max-width: none; flex: 1 1 260px; height: 44px; }
  .role-filter { flex: 1 1 200px; }
  .select-wrapper { width: 100%; }
}

/* Teléfono: cada usuario es una tarjeta (datos arriba; rol, estado y editar abajo) */
@media (max-width: 600px) {
  .section-title { font-size: 20px; }
  .btn-pink { width: 100%; padding: 0.8rem 1.5rem; }

  .users-table thead { display: none; }
  .users-table,
  .users-table tbody { display: block; }
  .users-table tr {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "usuario usuario"
      "rol     acciones"
      "estado  acciones";
    gap: 0.5rem 1rem;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .users-table tr:last-child { border-bottom: none; }
  .users-table td { padding: 0; border-bottom: none; }
  .users-table .col-usuario { grid-area: usuario; }
  .users-table .col-rol     { grid-area: rol; }
  .users-table .col-estado  { grid-area: estado; }
  .users-table .actions-cell { grid-area: acciones; }
  .users-table .celda-vacia { grid-column: 1 / -1; }
  .user-email { overflow-wrap: anywhere; }
  .status-indicator { padding: 0.25rem 0; }
  .edit-btn { width: 44px; height: 44px; margin: 0; border: 1px solid #d8f0fc; border-radius: 0.5rem; }
}
</style>