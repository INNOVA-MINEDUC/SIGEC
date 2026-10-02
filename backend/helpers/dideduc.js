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
