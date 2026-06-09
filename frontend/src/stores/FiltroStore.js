import { defineStore } from 'pinia'

export const useFiltroStore = defineStore('filtros', {
  state: () => ({
    departamento: null,
    municipio: null
  }),

  actions: {
    setDepartamento(dep) {
      this.departamento = dep
      this.municipio = null
    },

    setMunicipio(dep, mun) {
      this.departamento = dep
      this.municipio = mun
    },

    clear() {
      this.departamento = null
      this.municipio = null
    }
  }
})
