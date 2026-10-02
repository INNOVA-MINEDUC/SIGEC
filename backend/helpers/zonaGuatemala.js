import Municipio from '../models/Municipio.js'
import Departamento from '../models/Departamento.js'

const normalizar = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

// Zonas existentes de la Ciudad de Guatemala (no existen las zonas 20, 22 ni 23)
export const ZONAS_GUATEMALA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 24, 25]

/**
 * Devuelve la zona (de ZONAS_GUATEMALA) a guardar, o null. Solo es válida cuando el municipio
 * es Guatemala dentro del departamento de Guatemala; en cualquier otro caso se
 * descarta para no guardar zonas en ubicaciones a las que no corresponden.
 */
export async function normalizarZona(zona, municipioId, transaction = null) {
  const n = Number(zona)
  if (!municipioId || !Number.isInteger(n) || !ZONAS_GUATEMALA.includes(n)) return null
  const mun = await Municipio.findByPk(municipioId, {
    attributes: ['nombre'],
    include: [{ model: Departamento, as: 'departamento', attributes: ['nombre'] }],
    transaction,
  })
  if (!mun) return null
  return normalizar(mun.nombre) === 'guatemala' && normalizar(mun.departamento?.nombre) === 'guatemala' ? n : null
}
