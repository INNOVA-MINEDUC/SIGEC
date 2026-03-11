<template>
  <v-container>
    <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1 class="text-h5 mb-4">📥 Importar Excel – Datos del Ministerio de Salud</h1>

<v-card
  v-if="lastUpload"
  class="mb-6"
  elevation="5"
  width="50%"
>
  <v-card-text>

    <div class="d-flex align-center mb-4">
      <v-icon size="22" color="primary" class="mr-2">
        mdi-database-clock-outline
      </v-icon>

      <span class="text-subtitle-1 font-weight-medium">
        Última carga
      </span>
    </div>

    <v-row dense>
      <v-col cols="12" md="4">
        <div class="text-caption text-grey">Archivo</div>
        <div class="text-body-2">{{ lastUpload.fileName }}</div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="text-caption text-grey">Registros</div>
        <div class="text-body-2">{{ lastUpload.totalRows }}</div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="text-caption text-grey">Fecha</div>
        <div class="text-body-2">{{ lastUpload.date }}</div>
      </v-col>
    </v-row>

  </v-card-text>
</v-card>
    </div>



    <!-- Input -->
    <v-file-input
      label="Selecciona un archivo Excel"
      accept=".xlsx,.xls"
      prepend-icon="mdi-upload"
      @change="onFileChange"
      clearable
    />

    <!-- Resumen -->
    <v-alert
      v-if="rows.length"
      type="success"
      variant="tonal"
      class="mt-3"
    >
      ✅ Se cargaron {{ rows.length }} niños correctamente
    </v-alert>

    <!-- Tabla -->
    <v-data-table
      v-if="rows.length"
      :headers="headers.map(h => ({ title: h, key: h }))"
      :items="rows"
      class="mt-4 elevation-2"
      density="comfortable"
    />

    <!-- Botón limpiar -->
    <v-btn
      v-if="rows.length"
      class="mt-4"
      color="error"
      variant="outlined"
      @click="clearData"
    >
      Limpiar datos
    </v-btn>

    <!-- Historial -->
    <h2 class="text-h6 mt-8">📚 Historial de cargas</h2>

    <v-data-table
      v-if="uploadHistory.length"
      :headers="historyHeaders"
      :items="uploadHistory"
      density="compact"
    />

    <p v-else class="text-caption mt-2">No hay cargas registradas aún</p>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'

const headers = ref([])
const rows = ref([])

const lastUpload = ref(null)
const uploadHistory = ref([])

const historyHeaders = [
  { title: 'Archivo', key: 'fileName' },
  { title: 'Registros', key: 'totalRows' },
  { title: 'Fecha', key: 'date' }
]

// cargar historial al iniciar
onMounted(() => {
  const stored = localStorage.getItem('excelUploads')
  if (stored) {
    uploadHistory.value = JSON.parse(stored)
    lastUpload.value = uploadHistory.value[0] || null
  }
})

function onFileChange(payload) {
  let file = null

  if (payload?.target?.files) file = payload.target.files[0]
  else if (payload instanceof File) file = payload
  else if (Array.isArray(payload)) file = payload[0]

  if (!file) return

  if (!file.name.match(/\.(xls|xlsx)$/)) {
    alert('Archivo no válido')
    return
  }

  const reader = new FileReader()

  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      if (json.length <= 1) {
        alert('El Excel no tiene datos')
        return
      }

      headers.value = json[0]
      rows.value = json.slice(1).map(row => {
        const obj = {}
        headers.value.forEach((h, i) => {
          obj[h] = row[i] ?? ''
        })
        return obj
      })

      saveUpload(file.name, rows.value.length)

    } catch (err) {
      console.error(err)
      alert('Error leyendo el archivo')
    }
  }

  reader.readAsArrayBuffer(file)
}

function saveUpload(fileName, totalRows) {
  const record = {
    fileName,
    totalRows,
    date: new Date().toLocaleString()
  }

  uploadHistory.value.unshift(record)
  lastUpload.value = record

  localStorage.setItem(
    'excelUploads',
    JSON.stringify(uploadHistory.value)
  )
}

function clearData() {
  rows.value = []
  headers.value = []
}
</script>
