// Catálogos de estado de un caso, compartidos por el registro, la edición, los
// filtros y las cargas masivas. Deben coincidir con frontend/src/helpers/estadosCaso.js.

// ── Estado del caso (CasoEmbarazo.estado) ─────────────────────────────────────
// Opciones que se pueden asignar al registrar o editar un caso.
export const ESTADOS_CASO = [
  'Verificados en el SIRE',
  'sin Verificar en el SIRE',
  'Verificados en el Sistema de Quejas, Comentarios o Sugerencias',
  'Mayor de 14 años',
  'No existe registro',
]

// Estados que ya no se ofrecen pero pueden existir en registros anteriores.
// Se aceptan al editar solo si el caso ya los tenía, para no forzar un cambio.
export const ESTADOS_CASO_ANTERIORES = ['sin Quejas']

// ── Estado actual dentro del sistema educativo (HistorialEducativo.status_actual)
// Forma oficial de escritura. Las cargas masivas traían los valores en
// mayúsculas ("NO INSCRITA"); se guardan y muestran siempre así.
export const STATUS_ACTUAL = ['Inscrita', 'No inscrita', 'Retirada', 'Mayor de 14 años', 'No existe registro']

const sinTildes = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * Devuelve el estado actual con escritura uniforme sin cambiar su significado:
 * el valor oficial si coincide (sin importar mayúsculas ni tildes) y, si no,
 * el mismo texto con solo la primera letra en mayúscula ("Continúa estudiando").
 */
export function normalizarStatusActual(valor) {
  const texto = String(valor ?? '').replace(/\s+/g, ' ').trim()
  if (!texto) return null
  const oficial = STATUS_ACTUAL.find(s => sinTildes(s) === sinTildes(texto))
  if (oficial) return oficial
  const minusculas = texto.toLocaleLowerCase('es')
  return minusculas.charAt(0).toLocaleUpperCase('es') + minusculas.slice(1)
}
