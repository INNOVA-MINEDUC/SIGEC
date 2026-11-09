import Departamental from '../models/Departamental.js'
import Municipio from '../models/Municipio.js'

// Regla de negocio: todo caso cuyo municipio sea Ixcán pertenece a la DIDEDUC
// "Quiché Norte" (Ixcán pertenece al departamento de Quiché).
export const NOMBRE_DIDEDUC_QUICHE_NORTE = 'Dideduc Quiché Norte'

const normalizar = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export const esIxcan = (nombreMunicipio) => normalizar(nombreMunicipio) === 'ixcan'

let quicheNorteId = null
export async function obtenerQuicheNorteId(transaction = null) {
  if (quicheNorteId) return quicheNorteId
  const d = await Departamental.findOne({
    where: { nombre: NOMBRE_DIDEDUC_QUICHE_NORTE },
    attributes: ['id'],
    transaction,
  })
  quicheNorteId = d?.id ?? null
  return quicheNorteId
}

/**
 * Aplica la regla Ixcán → Quiché Norte. Si el municipio es Ixcán devuelve el id
 * de la DIDEDUC Quiché Norte; en cualquier otro caso devuelve `departamentalActual`.
 */
export async function aplicarReglaDideduc(municipioId, departamentalActual, transaction = null) {
  if (!municipioId) return departamentalActual
  const mun = await Municipio.findByPk(municipioId, { attributes: ['nombre'], transaction })
  if (!mun || !esIxcan(mun.nombre)) return departamentalActual
  return (await obtenerQuicheNorteId(transaction)) ?? departamentalActual
}

/**
 * Regla de negocio: la DIDEDUC del caso corresponde al departamento al que
 * pertenece el centro educativo (municipio del centro → departamento → DIDEDUC).
 *
 * - Sin municipio del centro no hay con qué comparar: se conserva la actual.
 * - Centro en Ixcán → DIDEDUC Quiché Norte.
 * - Si la DIDEDUC actual es del departamento del centro, se conserva (permite
 *   elegir entre Guatemala Norte/Sur/Oriente/Occidente, o Quiché/Quiché Norte).
 * - Si no lo es y el departamento tiene una sola DIDEDUC, se usa esa.
 * - Si el departamento tiene varias, no se puede deducir: `ambigua` con las
 *   opciones válidas para que quien llama decida (pedirla o usar una por defecto).
 *
 * @returns {{ departamental_id, ajustada: boolean, ambigua: boolean, opciones: {id, nombre}[], departamento_id }}
 */
export async function dideducSegunCentro(municipioCentroId, departamentalActual, transaction = null) {
  const actual = departamentalActual ? Number(departamentalActual) : null
  const sinCambio = { departamental_id: actual, ajustada: false, ambigua: false, opciones: [], departamento_id: null }
  if (!municipioCentroId) return sinCambio

  const mun = await Municipio.findByPk(municipioCentroId, { attributes: ['nombre', 'departamento_id'], transaction })
  if (!mun) return sinCambio

  const opciones = (await Departamental.findAll({
    where: { departamento_id: mun.departamento_id },
    attributes: ['id', 'nombre'],
    order: [['id', 'ASC']],
    transaction,
  })).map(d => ({ id: d.id, nombre: d.nombre }))
  const base = { opciones, departamento_id: mun.departamento_id, ambigua: false }

  if (esIxcan(mun.nombre)) {
    const quicheNorte = await obtenerQuicheNorteId(transaction)
    if (quicheNorte) return { ...base, departamental_id: quicheNorte, ajustada: quicheNorte !== actual }
  }
  if (opciones.some(o => o.id === actual)) return { ...base, departamental_id: actual, ajustada: false }
  if (opciones.length === 1) return { ...base, departamental_id: opciones[0].id, ajustada: true }
  return { ...base, departamental_id: actual, ajustada: false, ambigua: opciones.length > 1 }
}
