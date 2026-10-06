// Comunidades lingüísticas: lista canónica (la misma que muestra el frontend)
// y normalización de las variantes que llegan en los archivos o en datos
// anteriores ("K´iche´", "Q’anjob’al", "Akateka", "Pocomchi’"...).
// Mantener sincronizado con frontend/src/helpers/comunidadLinguistica.js
export const COMUNIDADES_LINGUISTICAS = [
  'Kaqchikel', "K'iche'", 'Español', "Achi'", 'Akateko', 'Awakateko',
  'Chalchiteko', "Ch'orti'", 'Chuj', 'Ixil', "Jakalteko / Popti'",
  'Mam', 'Mopan', 'Poqomam', "Poqomchi'", "Q'anjob'al", "Q'eqchi'",
  'Sakapulteko', 'Sipakapense', 'Tektiteko', "Tz'utujil", 'Uspanteko',
  'Garífuna', 'Xinka', 'Otros',
]

// Clave de comparación: sin tildes, sin apóstrofos de ningún tipo, sin espacios
const clave = (s) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z]/g, '')
    .replace(/teka$/, 'teko')               // Akateka → Akateko, Jakalteka → Jakalteko

// Nombres antiguos o alternativos → clave canónica
const ALIAS = {
  jakalteko: 'jakaltekopopti', popti: 'jakaltekopopti',
  pocomchi: 'poqomchi', pocomam: 'poqomam',
  quiche: 'kiche', kekchi: 'qeqchi', kanjobal: 'qanjobal', canjobal: 'qanjobal',
  cakchiquel: 'kaqchikel', kakchiquel: 'kaqchikel', tzutuhil: 'tzutujil',
  chorti: 'chorti', achi: 'achi', aguacateco: 'awakateko', castellano: 'espanol',
  garifuna: 'garifuna', xinca: 'xinka',
}

const PORCLAVE = new Map(COMUNIDADES_LINGUISTICAS.map(c => [clave(c), c]))

/** Devuelve el nombre canónico; si no se reconoce, el texto original recortado (o null). */
export function normalizarComunidad(valor) {
  const texto = String(valor ?? '').trim()
  if (!texto) return null
  const k = clave(texto)
  return PORCLAVE.get(ALIAS[k] ?? k) ?? texto
}
