// src/stores/casos.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/helpers/api'

export const useCasosStore = defineStore('casos', () => {

  const casos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const seleccion = ref({
    tipo: 'all',
    departamentoNombre: null,
    municipioNombre: null
  })

  // Parámetros actualmente aplicados (para que el mapa y otros componentes sepan)
  const filtrosActivos = ref({})

  const fetchCasos = async (params = {}) => {
    loading.value = true
    error.value = null
    // Limpiar params vacíos
    const limpio = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    try {
      const { data } = await api.get('/caso', { params: limpio })
      casos.value = data.data ?? []
      filtrosActivos.value = limpio
    } catch (e) {
      error.value = e.message ?? 'Error cargando casos'
      casos.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchTodos = () => {
    seleccion.value = { tipo: 'all', departamentoNombre: null, municipioNombre: null }
    filtrosActivos.value = {}
    return fetchCasos()
  }

  const fetchPorDepartamento = (nombre) => {
    seleccion.value = { tipo: 'departamento', departamentoNombre: nombre, municipioNombre: null }
    return fetchCasos({ departamento: nombre })
  }

  const fetchPorMunicipio = (munNombre, deptNombre) => {
    seleccion.value = { tipo: 'municipio', departamentoNombre: deptNombre, municipioNombre: munNombre }
    return fetchCasos({ departamento: deptNombre, municipio: munNombre })
  }

  // Carga con todos los filtros del dashboard
  const fetchConFiltros = (filtros = {}) => {
    seleccion.value = { tipo: 'filtros', departamentoNombre: null, municipioNombre: null }
    return fetchCasos(filtros)
  }

  const total = computed(() => casos.value.length)

  const tituloSeleccion = computed(() => {
    const s = seleccion.value
    if (s.tipo === 'departamento') return `Depto. ${s.departamentoNombre}`
    if (s.tipo === 'municipio')    return `${s.municipioNombre}, ${s.departamentoNombre}`
    if (s.tipo === 'filtros')      return 'Filtros del dashboard'
    return 'Todo Guatemala'
  })

  // Casos filtrados por mes (1=Enero ... 12=Diciembre)
  const casosPorMes = (mes) =>
    casos.value.filter(c =>
      c.fecha_ingreso
        ? new Date(c.fecha_ingreso).getMonth() + 1 === mes
        : false
    )

  // Casos filtrados por estado: 'pendiente' | 'faltante' | 'completado'
  const casosPorEstado = (estado) =>
    casos.value.filter(c => c.estado === estado)

  return {
    casos,
    loading,
    error,
    seleccion,
    filtrosActivos,
    total,
    tituloSeleccion,
    fetchTodos,
    fetchPorDepartamento,
    fetchPorMunicipio,
    fetchConFiltros,
    casosPorMes,
    casosPorEstado
  }
})
