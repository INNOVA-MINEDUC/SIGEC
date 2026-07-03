import Fuse from 'fuse.js'
import Departamental from '../models/Departamental.js'
import Departamento from '../models/Departamento.js'
import Municipio from '../models/Municipio.js'

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

// Singleton: se inicializa solo una vez por proceso
let fuseDepto = null
let fuseMunPorDepto = null  // Map<departamento_id, Fuse>

async function init() {
  if (fuseDepto) return

  const departamentales = await Departamental.findAll({
    include: [{ model: Departamento, as: 'departamento' }],
  })

  const deptoEntries = departamentales
    .filter(d => d.departamento)
    .map(d => ({
      nombre:           d.departamento.nombre,
      nombreBusqueda:   normalizar(d.departamento.nombre),
      departamental_id: d.id,
      departamento_id:  d.departamento_id,
    }))

  fuseDepto = new Fuse(deptoEntries, {
    keys:          ['nombreBusqueda'],
    threshold:     0.35,
    includeScore:  true,
  })

  const municipiosList = await Municipio.findAll({
    attributes: ['id', 'nombre', 'departamento_id'],
  })

  fuseMunPorDepto = new Map()
  for (const depto of deptoEntries) {
    const munis = municipiosList
      .filter(m => m.departamento_id === depto.departamento_id)
      .map(m => ({
        nombre:         m.nombre,
        nombreBusqueda: normalizar(m.nombre),
        municipio_id:   m.id,
      }))

    fuseMunPorDepto.set(
      depto.departamento_id,
      new Fuse(munis, {
        keys:         ['nombreBusqueda'],
        threshold:    0.35,
        includeScore: true,
      })
    )
  }
}

/**
 * Valida y resuelve departamento + municipio usando búsqueda difusa contra la BD.
 * Replica el algoritmo de frontend/src/helpers/filter.js pero devuelve IDs reales.
 *
 * @param {string|null} departamentoNombre  - Nombre tal como viene en el Excel
 * @param {string|null} municipioNombre     - Nombre tal como viene en el Excel
 * @returns {{ departamental_id, departamento_id, municipio_id }}
 */
export async function validarUbicacion(departamentoNombre, municipioNombre) {
  await init()

  if (!departamentoNombre) {
    return { departamental_id: null, departamento_id: null, municipio_id: null }
  }

  // 1. Resolver departamento con Fuse
  const resDepto = fuseDepto.search(normalizar(departamentoNombre))
  if (!resDepto.length) {
    return { departamental_id: null, departamento_id: null, municipio_id: null }
  }
  const depto = resDepto[0].item

  // 2. Resolver municipio SOLO dentro de ese departamento
  let municipio_id = null
  if (municipioNombre && fuseMunPorDepto.has(depto.departamento_id)) {
    const fuseMun = fuseMunPorDepto.get(depto.departamento_id)
    const resMun  = fuseMun.search(normalizar(municipioNombre))
    if (resMun.length) municipio_id = resMun[0].item.municipio_id
  }

  return {
    departamental_id: depto.departamental_id,
    departamento_id:  depto.departamento_id,
    municipio_id,
  }
}
