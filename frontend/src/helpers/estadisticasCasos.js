import { formatearNombreGeografico } from './formatoNombres'

// Agregados de casos compartidos por el dashboard (mapa, listados y gráficas)
// y por las exportaciones a Excel y PDF, para que la pantalla y los archivos
// cuenten exactamente igual a partir del mismo conjunto de casos filtrados.

const sinTildes = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Cada caso se cuenta una sola vez aunque llegara repetido en el arreglo
const casosUnicos = (casos = []) => {
  const vistos = new Set()
  return casos.filter((c) => {
    const clave = c?.id ?? c
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}

const compararNombre = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })

// Departamento al que se atribuye un caso (uno solo por caso): el del
// municipio de residencia de la niña; si no hay, el departamento de residencia
// guardado y, como último recurso, el de la dirección departamental del caso.
export const departamentoDeCaso = (c) =>
  c?.nina?.municipio?.departamento?.nombre ||
  c?.nina?.departamento?.nombre ||
  c?.departamental?.departamento?.nombre || null

/**
 * Casos agrupados por departamento, de mayor a menor (empates por nombre).
 * @returns {{ items: {nombre: string, total: number}[], sinDepartamento: number }}
 */
export function contarPorDepartamento(casos = []) {
  const grupos = new Map()
  let sinDepartamento = 0
  for (const c of casosUnicos(casos)) {
    const nombre = departamentoDeCaso(c)
    if (!nombre) { sinDepartamento++; continue }
    const clave = sinTildes(nombre)
    if (!grupos.has(clave)) grupos.set(clave, { nombre: formatearNombreGeografico(nombre), total: 0 })
    grupos.get(clave).total++
  }
  const items = [...grupos.values()].sort((a, b) => b.total - a.total || compararNombre(a.nombre, b.nombre))
  return { items, sinDepartamento }
}

/**
 * Casos agrupados por municipio de residencia de la niña, de mayor a menor
 * (empates por nombre del municipio y luego del departamento). Se agrupa por
 * el id del municipio: hay nombres repetidos en distintos departamentos.
 * @returns {{ items: {id: number|null, nombre: string, departamento: string, total: number}[], sinMunicipio: number }}
 */
export function contarPorMunicipio(casos = []) {
  const grupos = new Map()
  let sinMunicipio = 0
  for (const c of casosUnicos(casos)) {
    const m = c?.nina?.municipio
    if (!m?.nombre) { sinMunicipio++; continue }
    const clave = m.id ?? `${sinTildes(m.departamento?.nombre)}|${sinTildes(m.nombre)}`
    if (!grupos.has(clave)) {
      grupos.set(clave, {
        id: m.id ?? null,
        nombre: formatearNombreGeografico(m.nombre),
        departamento: formatearNombreGeografico(m.departamento?.nombre),
        total: 0,
      })
    }
    grupos.get(clave).total++
  }
  const items = [...grupos.values()].sort((a, b) =>
    b.total - a.total || compararNombre(a.nombre, b.nombre) || compararNombre(a.departamento, b.departamento))
  return { items, sinMunicipio }
}

// Rangos de la gráfica "Casos por edad" (de 14 años hacia abajo)
export const RANGOS_EDAD = [
  { label: '14 años',         min: 14, max: 14 },
  { label: '13 años',         min: 13, max: 13 },
  { label: '12 años',         min: 12, max: 12 },
  { label: '11 años',         min: 11, max: 11 },
  { label: '10 años',         min: 10, max: 10 },
  { label: '9 años',          min: 9,  max: 9  },
  { label: 'Menor de 9 años', min: 0,  max: 8  },
]

/** Cantidad de casos en cada rango de RANGOS_EDAD. */
export const contarPorEdad = (casos = []) =>
  RANGOS_EDAD.map((r) => ({
    label: r.label,
    total: casos.filter((c) => {
      const edad = Number(c?.nina?.edad)
      return c?.nina?.edad !== null && c?.nina?.edad !== '' && edad >= r.min && edad <= r.max
    }).length,
  }))

// Normaliza el status para comparar sin importar mayúsculas/acentos:
// en la BD se guardan en mayúsculas ("MAYOR DE 14 AÑOS", "NO EXISTE REGISTRO").
const STATUS_MAYOR_O_SIN_REGISTRO = new Set(['mayor de 14 anos', 'no existe registro', 'sin registro'])

// Coincide con cualquier historial de la niña (no solo el primero), igual que
// el conteo del servidor en Seguimiento.
export const esMayorOSinRegistro = (caso) =>
  (caso?.nina?.historialEducativo ?? []).some((h) => STATUS_MAYOR_O_SIN_REGISTRO.has(sinTildes(h.status_actual)))
