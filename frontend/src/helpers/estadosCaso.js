// Catálogos de estado de un caso, compartidos por Registro y Seguimiento para
// que ambos ofrezcan exactamente las mismas opciones. Deben coincidir con
// backend/helpers/estadosCaso.js.

// ── Estado del caso ──────────────────────────────────────────────────────────
export const ESTADOS_CASO = [
  'Verificados en el SIRE',
  'sin Verificar en el SIRE',
  'Verificados en el Sistema de Quejas, Comentarios o Sugerencias',
  'Mayor de 14 años',
  'No existe registro',
]

// Ya no se ofrece, pero puede venir en registros anteriores
export const ESTADOS_CASO_ANTERIORES = ['sin Quejas']

const sinTildes = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Colores de la etiqueta de cada estado (tonos institucionales)
const ESTILOS_ESTADO = {
  'verificados en el sire':          { backgroundColor: '#10233f', color: '#fff' },
  'sin verificar en el sire':        { backgroundColor: '#6d6d6d', color: '#fff' },
  'verificados en el sistema de quejas, comentarios o sugerencias': { backgroundColor: '#1F3864', color: '#fff' },
  'mayor de 14 anos':                { backgroundColor: '#2E5395', color: '#fff' },
  'no existe registro':              { backgroundColor: '#4472C4', color: '#fff' },
  'sin quejas':                      { backgroundColor: '#b0b0b0', color: '#fff' },
}

export const estiloEstadoCaso = (estado) =>
  ESTILOS_ESTADO[sinTildes(estado)] || { backgroundColor: '#f0f0f0', color: '#6d6d6d' }

// ── Estado actual dentro del sistema educativo ───────────────────────────────
export const STATUS_ACTUAL = ['Inscrita', 'No inscrita', 'Retirada', 'Mayor de 14 años', 'No existe registro']

/**
 * Escritura uniforme del estado actual, sin cambiar su significado: el valor
 * oficial si coincide (sin importar mayúsculas ni tildes: "NO INSCRITA" →
 * "No inscrita") y, si no, el mismo texto con solo la primera letra en
 * mayúscula ("CONTINÚA ESTUDIANDO" → "Continúa estudiando").
 */
export function formatearStatusActual(valor) {
  const texto = String(valor ?? '').replace(/\s+/g, ' ').trim()
  if (!texto) return ''
  const oficial = STATUS_ACTUAL.find(s => sinTildes(s) === sinTildes(texto))
  if (oficial) return oficial
  const minusculas = texto.toLocaleLowerCase('es')
  return minusculas.charAt(0).toLocaleUpperCase('es') + minusculas.slice(1)
}
