// src/stores/casos.js
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import axios from 'axios'

export const useCasosStore = defineStore('casos', () => {
  const casos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const filtros = reactive({
    codigoEstudiante: '',
    edad: '',
    edadMin: '',
    edadMax: '',
    grado: '',
    nivel: '',
    lengua: '',
    pueblo: '',
    centroEducativo: '',
    fechaCaso: '',
    departamento: '',
    municipio: '',
    estado: '',
    tieneQueja: '',
    dideduc: '',
    statusActual: '',
    resultado: '',
    area: ''
  })

  const fetchCasos = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await axios.get('http://localhost:3000/api/v1/caso')
      casos.value = data.data || []
    } catch (e) {
      error.value = e.message || 'Error cargando casos'
    } finally {
      loading.value = false
    }
  }

  const casosFiltrados = computed(() => {
    return casos.value.filter((caso) => {
      const nina = caso.nina
      const historial = nina?.historialEducativo || []

      if (filtros.departamento && String(nina?.municipio?.departamento?.id) !== String(filtros.departamento)) return false
      if (filtros.municipio && String(nina?.municipio?.id) !== String(filtros.municipio)) return false
      if (filtros.estado && String(caso.estado) !== String(filtros.estado)) return false
      if (filtros.dideduc && String(caso.direccion_departamental_educacion) !== String(filtros.dideduc)) return false
      if (filtros.fechaCaso && String(caso.fecha_ingreso) !== String(filtros.fechaCaso)) return false

      if (filtros.tieneQueja === 'si' && !(caso.queja && caso.queja.trim() !== '')) return false
      if (filtros.tieneQueja === 'no' && (caso.queja && caso.queja.trim() !== '')) return false

      if (filtros.codigoEstudiante) {
        const existe = historial.some(h =>
          String(h.codigo_personal ?? '') === String(filtros.codigoEstudiante)
        )
        if (!existe) return false
      }

      if (filtros.edad && String(nina?.edad) !== String(filtros.edad)) return false
      if (filtros.edadMin && Number(nina?.edad) < Number(filtros.edadMin)) return false
      if (filtros.edadMax && Number(nina?.edad) > Number(filtros.edadMax)) return false

      if (filtros.grado) {
        const existe = historial.some(h => String(h.grado) === String(filtros.grado))
        if (!existe) return false
      }

      if (filtros.nivel) {
        const existe = historial.some(h => String(h.nivel) === String(filtros.nivel))
        if (!existe) return false
      }

      if (filtros.statusActual) {
        const existe = historial.some(h => String(h.status_actual) === String(filtros.statusActual))
        if (!existe) return false
      }

      if (filtros.resultado) {
        const existe = historial.some(h => String(h.resultado) === String(filtros.resultado))
        if (!existe) return false
      }

      if (filtros.area) {
        const existe = historial.some(h => String(h.centroEducativo?.area) === String(filtros.area))
        if (!existe) return false
      }

      if (filtros.centroEducativo) {
        const existe = historial.some(h =>
          String(h.centroEducativo?.nombre ?? '').toLowerCase().includes(filtros.centroEducativo.toLowerCase())
        )
        if (!existe) return false
      }

      if (filtros.lengua && String(nina?.comunidadLinguistica?.id) !== String(filtros.lengua)) return false
      if (filtros.pueblo && String(nina?.pueblo?.id) !== String(filtros.pueblo)) return false

      return true
    })
  })

  const totalCasos = computed(() => casosFiltrados.value.length)
  const casosConQueja = computed(() => casosFiltrados.value.filter(c => c.queja && c.queja.trim() !== '').length)
  const casosPendientes = computed(() => casosFiltrados.value.filter(c => c.estado === 'pendiente').length)

  const casosPorEdad = (edad) => {
    return casosFiltrados.value.filter(c => Number(c.nina?.edad) === Number(edad))
  }

  const resetFiltros = () => {
    Object.keys(filtros).forEach((key) => (filtros[key] = ''))
  }

  return {
    casos,
    loading,
    error,
    filtros,
    fetchCasos,
    casosFiltrados,
    totalCasos,
    casosConQueja,
    casosPendientes,
    casosPorEdad,
    resetFiltros
  }
})