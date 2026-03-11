import { defineStore } from 'pinia'
import { useFiltroStore } from './FiltroStore'

export const useCasosStore = defineStore('casos', {
  state: () => ({
    casos: [
      // ENERO
      { id: 1, departamento: 'Guatemala', municipio: 'Guatemala', estado: 'pendiente', fecha: '2025-01-03', age: 12 },
      { id: 2, departamento: 'Guatemala', municipio: 'Mixco', estado: 'presente', fecha: '2025-01-08', age: 15 },
      { id: 3, departamento: 'Sacatepéquez', municipio: 'Antigua Guatemala', estado: 'faltante', fecha: '2025-01-14', age: 17 },
      { id: 4, departamento: 'Guatemala', municipio: 'Villa Nueva', estado: 'ausente', fecha: '2025-01-22', age: 14 },
      { id: 5, departamento: 'Guatemala', municipio: 'Chinautla', estado: 'presente', fecha: '2025-01-29', age: 13 },

      // FEBRERO
      { id: 6, departamento: 'Guatemala', municipio: 'Villa Nueva', estado: 'ausente', fecha: '2025-02-02', age: 16 },
      { id: 7, departamento: 'Sacatepéquez', municipio: 'Ciudad Vieja', estado: 'pendiente', fecha: '2025-02-06', age: 12 },
      { id: 8, departamento: 'Guatemala', municipio: 'Mixco', estado: 'presente', fecha: '2025-02-12', age: 14 },
      { id: 9, departamento: 'Guatemala', municipio: 'San Miguel Petapa', estado: 'faltante', fecha: '2025-02-20', age: 17 },
      { id: 10, departamento: 'Sacatepéquez', municipio: 'Pastores', estado: 'presente', fecha: '2025-02-26', age: 15 },

      // MARZO
      { id: 11, departamento: 'Escuintla', municipio: 'Escuintla', estado: 'presente', fecha: '2025-03-02', age: 13 },
      { id: 12, departamento: 'Escuintla', municipio: 'Santa Lucía Cotzumalguapa', estado: 'faltante', fecha: '2025-03-07', age: 16 },
      { id: 13, departamento: 'Guatemala', municipio: 'Amatitlán', estado: 'pendiente', fecha: '2025-03-13', age: 14 },
      { id: 14, departamento: 'Guatemala', municipio: 'Villa Canales', estado: 'ausente', fecha: '2025-03-20', age: 17 },
      { id: 15, departamento: 'Escuintla', municipio: 'La Democracia', estado: 'presente', fecha: '2025-03-28', age: 12 },

      // ABRIL
      { id: 16, departamento: 'Quetzaltenango', municipio: 'Quetzaltenango', estado: 'ausente', fecha: '2025-04-03', age: 15 },
      { id: 17, departamento: 'Quetzaltenango', municipio: 'La Esperanza', estado: 'presente', fecha: '2025-04-08', age: 13 },
      { id: 18, departamento: 'Quetzaltenango', municipio: 'Salcajá', estado: 'pendiente', fecha: '2025-04-15', age: 16 },
      { id: 19, departamento: 'Totonicapán', municipio: 'Totonicapán', estado: 'faltante', fecha: '2025-04-21', age: 17 },

      // MAYO
      { id: 20, departamento: 'Alta Verapaz', municipio: 'Cobán', estado: 'pendiente', fecha: '2025-05-02', age: 14 },
      { id: 21, departamento: 'Alta Verapaz', municipio: 'San Pedro Carchá', estado: 'faltante', fecha: '2025-05-06', age: 12 },
      { id: 22, departamento: 'Guatemala', municipio: 'Santa Catarina Pinula', estado: 'presente', fecha: '2025-05-10', age: 16 },
      { id: 23, departamento: 'Alta Verapaz', municipio: 'Chisec', estado: 'ausente', fecha: '2025-05-19', age: 15 },
      { id: 24, departamento: 'Guatemala', municipio: 'Palencia', estado: 'presente', fecha: '2025-05-27', age: 17 },

      // JUNIO
      { id: 25, departamento: 'Petén', municipio: 'Flores', estado: 'ausente', fecha: '2025-06-03', age: 13 },
      { id: 26, departamento: 'Petén', municipio: 'San Benito', estado: 'pendiente', fecha: '2025-06-09', age: 15 },
      { id: 27, departamento: 'Petén', municipio: 'Santa Elena', estado: 'presente', fecha: '2025-06-14', age: 12 },
      { id: 28, departamento: 'Petén', municipio: 'Dolores', estado: 'faltante', fecha: '2025-06-23', age: 17 },

      // JULIO
      { id: 29, departamento: 'Izabal', municipio: 'Puerto Barrios', estado: 'presente', fecha: '2025-07-02', age: 16 },
      { id: 30, departamento: 'Izabal', municipio: 'Livingston', estado: 'faltante', fecha: '2025-07-08', age: 14 },
      { id: 31, departamento: 'Guatemala', municipio: 'Fraijanes', estado: 'pendiente', fecha: '2025-07-15', age: 12 },
      { id: 32, departamento: 'Izabal', municipio: 'Morales', estado: 'ausente', fecha: '2025-07-25', age: 17 },

      // AGOSTO
      { id: 33, departamento: 'Chimaltenango', municipio: 'Chimaltenango', estado: 'ausente', fecha: '2025-08-02', age: 15 },
      { id: 34, departamento: 'Chimaltenango', municipio: 'El Tejar', estado: 'presente', fecha: '2025-08-07', age: 13 },
      { id: 35, departamento: 'Chimaltenango', municipio: 'Patzicía', estado: 'pendiente', fecha: '2025-08-18', age: 16 },

      // SEPTIEMBRE
      { id: 36, departamento: 'Huehuetenango', municipio: 'Huehuetenango', estado: 'pendiente', fecha: '2025-09-03', age: 14 },
      { id: 37, departamento: 'Huehuetenango', municipio: 'Chiantla', estado: 'faltante', fecha: '2025-09-11', age: 17 },
      { id: 38, departamento: 'Guatemala', municipio: 'San José Pinula', estado: 'presente', fecha: '2025-09-19', age: 12 },
      { id: 39, departamento: 'Huehuetenango', municipio: 'Aguacatán', estado: 'ausente', fecha: '2025-09-27', age: 15 },

      // OCTUBRE
      { id: 40, departamento: 'Retalhuleu', municipio: 'Retalhuleu', estado: 'ausente', fecha: '2025-10-04', age: 13 },
      { id: 41, departamento: 'Retalhuleu', municipio: 'San Sebastián', estado: 'pendiente', fecha: '2025-10-11', age: 16 },
      { id: 42, departamento: 'Retalhuleu', municipio: 'Champerico', estado: 'presente', fecha: '2025-10-21', age: 17 },

      // NOVIEMBRE
      { id: 43, departamento: 'San Marcos', municipio: 'San Marcos', estado: 'presente', fecha: '2025-11-05', age: 14 },
      { id: 44, departamento: 'San Marcos', municipio: 'Malacatán', estado: 'faltante', fecha: '2025-11-12', age: 16 },
      { id: 45, departamento: 'San Marcos', municipio: 'Tacaná', estado: 'pendiente', fecha: '2025-11-24', age: 12 },

      // DICIEMBRE
      { id: 46, departamento: 'Jutiapa', municipio: 'Jutiapa', estado: 'pendiente', fecha: '2025-12-03', age: 15 },
      { id: 47, departamento: 'Jutiapa', municipio: 'El Progreso', estado: 'ausente', fecha: '2025-12-09', age: 17 },
      { id: 48, departamento: 'Guatemala', municipio: 'VillaCanales', estado: 'presente', fecha: '2025-12-18', age: 13 },
      { id: 49, departamento: 'Guatemala', municipio: 'San Raymundo', estado: 'faltante', fecha: '2025-12-27', age: 12 }
    ]

  }),

   getters: {
    /* ✅ BASE: datos filtrados por mapa */
    casosFiltradosBase: (state) => {
      return () => {
        const filtros = useFiltroStore()

        return state.casos.filter(c => {
          if (filtros.municipio) {
            return (
              c.departamento === filtros.departamento &&
              c.municipio === filtros.municipio
            )
          }

          if (filtros.departamento) {
            return c.departamento === filtros.departamento
          }

          return true
        })
      }
    },

    /* ✅ DERIVADOS (los que usan tus gráficas) */

    casosPorEdad: (state) => {
      return (age) => {
        return state.casosFiltradosBase().filter(c => c.age === age)
      }
    },

    casosPorMes: (state) => {
      return (mes) => {
        return state.casosFiltradosBase().filter(
          c => new Date(c.fecha).getMonth() + 1 === mes
        )
      }
    },

    casosPorEstado: (state) => {
      return (estado) => {
        return state.casosFiltradosBase().filter(
          c => c.estado === estado
        )
      }
    },

    casosPorDepartamento: (state) => {
      return (departamento) => {
        return state.casosFiltradosBase().filter(
          c => c.departamento === departamento
        )
      }
    }
  },

  actions: {
    /* ✅ si más adelante necesitas mutaciones */
    agregarCaso(caso) {
      this.casos.push(caso)
    },

    eliminarCaso(id) {
      this.casos = this.casos.filter(c => c.id !== id)
    }
  }
})
