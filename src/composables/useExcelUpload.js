/**
 * useExcelUpload — Composable
 * Lógica de carga de archivos Excel y gestión de historial en localStorage.
 */

import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

export function useExcelUpload() {
  const fileInput     = ref(null)
  const headers       = ref([])
  const rows          = ref([])
  const lastUpload    = ref(null)
  const uploadHistory = ref([])

  const historyHeaders = [
    { title: 'Archivo',   key: 'fileName' },
    { title: 'Registros', key: 'totalRows' },
    { title: 'Fecha',     key: 'date' }
  ]

  const tableHeaders = computed(() =>
    headers.value.map(h => ({ title: h, key: h }))
  )

  const lastUploadFields = computed(() => [
    { label: 'Archivo',   value: lastUpload.value?.fileName },
    { label: 'Registros', value: lastUpload.value?.totalRows },
    { label: 'Fecha',     value: lastUpload.value?.date }
  ])

  onMounted(() => {
    const stored = localStorage.getItem('excelUploads')
    if (stored) {
      uploadHistory.value = JSON.parse(stored)
      lastUpload.value = uploadHistory.value[0] ?? null
    }
  })

  function onFileChange(payload) {
    const file = payload?.target?.files?.[0]
                ?? (payload instanceof File ? payload : null)
                ?? (Array.isArray(payload) ? payload[0] : null)

    if (!file) return
    if (!file.name.match(/\.(xls|xlsx)$/)) return alert('Archivo no válido')

    const reader = new FileReader()
    reader.onload = ({ target }) => {
      try {
        const workbook = XLSX.read(new Uint8Array(target.result), { type: 'array' })
        const json = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]], { header: 1 }
        )
        if (json.length <= 1) return alert('El Excel no tiene datos')

        headers.value = json[0]
        rows.value = json.slice(1).map(row =>
          Object.fromEntries(headers.value.map((h, i) => [h, row[i] ?? '']))
        )
        saveUpload(file.name, rows.value.length)
      } catch (err) {
        console.error(err)
        alert('Error leyendo el archivo')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function saveUpload(fileName, totalRows) {
    const record = { fileName, totalRows, date: new Date().toLocaleString() }
    uploadHistory.value.unshift(record)
    lastUpload.value = record
    localStorage.setItem('excelUploads', JSON.stringify(uploadHistory.value))
  }

  function clearData() {
    rows.value = []
    headers.value = []
  }

  return {
    fileInput,
    headers,
    rows,
    lastUpload,
    uploadHistory,
    historyHeaders,
    tableHeaders,
    lastUploadFields,
    onFileChange,
    clearData
  }
}
