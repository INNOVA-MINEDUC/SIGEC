<template>
  <div>
    <!-- BUSCADOR + ACCIONES -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="query"
          label="Buscar por ID, nombre o escuela"
          prepend-inner-icon="mdi-magnify"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>

      <v-col cols="12" md="6" class="d-flex justify-end">
        <v-btn variant="outlined" class="mr-2" @click="refresh">
          Actualizar
        </v-btn>
        <v-btn color="primary" @click="openCreate">
          Nuevo reporte
        </v-btn>
      </v-col>
    </v-row>

    <!-- STATS -->
    <v-row>
      <v-col
        v-for="(value, key) in stats"
        :key="key"
        cols="12"
        md="3"
      >
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              {{ statLabel(key) }}
            </div>
            <div class="text-h5 font-weight-bold">
              {{ value }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABLA -->
    <v-card class="mt-6">
      <v-card-title class="d-flex justify-space-between">
        Casos recientes
        <v-select
          v-model="filter"
          :items="filters"
          density="compact"
          hide-details
          style="max-width: 200px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredCases"
        item-key="id"
      >
        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="statusColor(item.status)"
            variant="tonal"
          >
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <!-- <v-btn size="small" variant="text" @click="viewCase(item)">
            Ver
          </v-btn> -->
          <v-btn
            size="small"
            variant="text"
            color="primary"
            @click="openFollowUp(item)"
          >
            Seguimiento
          </v-btn>
        </template>

        <template #no-data>
          No se encontraron casos.
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()


/* STATE */
const query = ref('')
const filter = ref('all')

const cases = ref([
  { id: 'C-01A2B3', name: 'A. G.', school: 'Escuela Central', status: 'following' },
  { id: 'C-0F4D5E', name: 'M. R.', school: 'Esc. Las Flores', status: 'studying' },
  { id: 'C-9Z8Y7X', name: 'J. P.', school: 'Esc. San José', status: 'notStudying' },

  // --- 15 Casos Adicionales ---
  { id: 'C-5G6H7I', name: 'L. S.', school: 'Inst. Básico', status: 'following' },
  { id: 'C-8J9K0L', name: 'E. V.', school: 'Colegio Nuevo', status: 'studying' },
  { id: 'C-1M2N3O', name: 'D. Q.', school: 'Esc. Primaria', status: 'notStudying' },
  { id: 'C-4P5Q6R', name: 'F. H.', school: 'Inst. Técnico', status: 'studying' },
  { id: 'C-7S8T9U', name: 'G. B.', school: 'Esc. del Sol', status: 'following' },
  { id: 'C-2V3W4X', name: 'H. C.', school: 'Liceo Científico', status: 'studying' },
  { id: 'C-3Y4Z5A', name: 'I. K.', school: 'Esc. Modelo', status: 'notStudying' },
  { id: 'C-6B7C8D', name: 'K. L.', school: 'Colegio Bilingüe', status: 'following' },
  { id: 'C-9E0F1G', name: 'N. M.', school: 'Inst. Oriente', status: 'studying' },
  { id: 'C-2H3I4J', name: 'O. P.', school: 'Esc. Vespertina', status: 'notStudying' },
  { id: 'C-5K6L7M', name: 'R. T.', school: 'Esc. Rural', status: 'following' },
  { id: 'C-8N9O0P', name: 'S. U.', school: 'Colegio de Artes', status: 'studying' },
  { id: 'C-1Q2R3S', name: 'T. W.', school: 'Inst. de Computo', status: 'notStudying' },
  { id: 'C-4T5U6V', name: 'V. X.', school: 'Esc. del Norte', status: 'following' }
])

/* COMPUTED */
const stats = computed(() => ({
  total: cases.value.length,
  following: cases.value.filter(c => c.status === 'following').length,
  studying: cases.value.filter(c => c.status === 'studying').length,
  notStudying: cases.value.filter(c => c.status === 'notStudying').length,
}))

const filteredCases = computed(() => {
  let list = cases.value

  if (filter.value !== 'all') {
    list = list.filter(c => c.status === filter.value)
  }

  if (query.value.trim()) {
    const q = query.value.toLowerCase()
    list = list.filter(
      c =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.school.toLowerCase().includes(q)
    )
  }

  return list
})

/* TABLE CONFIG */
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Nombre', value: 'name' },
  { title: 'Escuela', value: 'school' },
  { title: 'Estado', value: 'status' },
  { title: 'Acciones', value: 'actions', sortable: false },
]

const filters = [
  { title: 'Todos', value: 'all' },
  { title: 'En seguimiento', value: 'following' },
  { title: 'Aún estudiando', value: 'studying' },
  { title: 'Fuera del sistema', value: 'notStudying' },
]

/* HELPERS */
function statLabel(k) {
  return {
    total: 'Casos totales',
    following: 'En seguimiento',
    studying: 'Aún estudiando',
    notStudying: 'Fuera del sistema',
  }[k]
}

function statusLabel(s) {
  return filters.find(f => f.value === s)?.title
}

function statusColor(s) {
  return s === 'following'
    ? 'blue'
    : s === 'studying'
    ? 'green'
    : 'red'
}

/* ACTIONS */
function viewCase(c) {
  alert(`Ver caso ${c.id}`)
}

function openFollowUp(c) {
  router.push('/seguimiento')
}

function openCreate() {
  alert('Abrir formulario de nuevo reporte')
}

function refresh() {
  alert('Datos actualizados')
}
</script>

<style scoped>
:root{
  --bg:#f4f6f8;
  --card:#ffffff;
  --muted:#6b7280;
  --accent:#0b5fff;
  --danger:#dc2626;
}
*{box-sizing:border-box}
body,html,#app{height:100%}
.app{display:flex;min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial}

.sidebar{width:260px;background:#0f1724;color:#fff;padding:20px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;gap:12px;align-items:center}
.logo{width:48px;height:48px;border-radius:8px;background:#081028;display:flex;align-items:center;justify-content:center;font-weight:700}
.brand h1{font-size:16px;margin:0}
.brand p{margin:0;font-size:12px;color:var(--muted)}

.nav{margin-top:28px;display:flex;flex-direction:column;gap:8px}
.nav a{padding:10px;border-radius:8px;cursor:pointer;color:#cbd5e1}
.nav a.active{background:#071022;color:#fff}

.sidebar-footer{font-size:12px;color:#94a3b8}

.main{flex:1;padding:20px;background:var(--bg)}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
.search input{padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;width:420px}
.actions{display:flex;gap:8px}
.btn{padding:8px 12px;border-radius:8px;border:0;cursor:pointer;background:var(--card);box-shadow:0 1px 0 rgba(0,0,0,0.04)}
.btn.ghost{background:transparent;border:1px solid #e6e9ef}
.btn.primary{background:var(--accent);color:#fff}
.btn.small{padding:6px 8px;font-size:13px}

.overview{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.card{background:var(--card);padding:16px;border-radius:10px;box-shadow:0 6px 16px rgba(11,16,30,0.04)}
.card-title{font-size:13px;color:var(--muted)}
.card-value{font-size:22px;font-weight:700;margin-top:6px}

.table-wrap{background:var(--card);padding:16px;border-radius:10px}
.table-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.filters select{padding:8px;border-radius:8px}
.cases{width:100%;border-collapse:collapse}
.cases th{text-align:left;padding:10px 8px;color:var(--muted);font-size:13px}
.cases td{padding:10px 8px;border-top:1px solid #eef2f6}
.pill{padding:6px 8px;border-radius:999px;font-size:12px}
.pill.following{background:#e8f0ff;color:#0b3fff}
.pill.studying{background:#effcee;color:#047857}
.pill.notStudying{background:#fff1f2;color:#b91c1c}
.empty{text-align:center;padding:18px;color:var(--muted)}

.modal{position:fixed;inset:0;background:rgba(2,6,23,0.45);display:flex;align-items:center;justify-content:center}
.modal-card{background:var(--card);width:520px;border-radius:10px;padding:16px}
.modal-card header{display:flex;justify-content:space-between;align-items:center}
.modal-card form{display:flex;flex-direction:column;gap:10px;margin-top:8px}
.modal-card label{font-size:13px;color:var(--muted)}
.modal-card input, .modal-card select{padding:10px;border-radius:8px;border:1px solid #e6e9ef}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
.close{background:transparent;border:0;font-size:18px;cursor:pointer}

@media (max-width:900px){
  .sidebar{display:none}
  .overview{grid-template-columns:repeat(2,1fr)}
  .search input{width:200px}
}
</style>