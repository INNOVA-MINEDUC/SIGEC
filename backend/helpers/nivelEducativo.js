/**
 * Vocabulario ÚNICO de nivel educativo.
 *
 * Estos son los valores que se guardan en historial_educativo.nivel y los que
 * deben usar tanto la carga masiva como los filtros del dashboard y el registro
 * manual. Cualquier variante de escritura (mayúsculas, texto largo oficial,
 * typos) se normaliza a uno de estos cuatro.
 */
export const NIVELES_EDUCATIVOS = [
  'Preprimaria',
  'Primaria',
  'Media (Básico)',
  'Media (Diversificado)',
]

// Etiqueta larga institucional, para mostrar en la interfaz.
export const NIVEL_LABELS = {
  'Preprimaria':           'Nivel de Educación Preprimaria',
  'Primaria':              'Nivel de Educación Primaria',
  'Media (Básico)':        'Nivel de Educación Media (Ciclo Básico)',
  'Media (Diversificado)': 'Nivel de Educación Media (Ciclo Diversificado)',
}

const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

// Sinónimos conocidos → valor canónico. Alimentan la búsqueda difusa que
// rescata los valores mal escritos ("PRMARIA", "PRIMAARIA").
const SINONIMOS = [
  ['preprimaria',                                  'Preprimaria'],
  ['pre primaria',                                 'Preprimaria'],
  ['parvulos',                                     'Preprimaria'],
  ['nivel de educacion preprimaria',               'Preprimaria'],
  ['primaria',                                     'Primaria'],
  ['nivel de educacion primaria',                  'Primaria'],
  ['basico',                                       'Media (Básico)'],
  ['ciclo basico',                                 'Media (Básico)'],
  ['media basico',                                 'Media (Básico)'],
  ['medio basico',                                 'Media (Básico)'],
  ['nivel de educacion media ciclo basico',        'Media (Básico)'],
  ['diversificado',                                'Media (Diversificado)'],
  ['ciclo diversificado',                          'Media (Diversificado)'],
  ['media diversificado',                          'Media (Diversificado)'],
  ['nivel de educacion media ciclo diversificado', 'Media (Diversificado)'],
]

// Distancia de edición (Levenshtein). Se usa en vez de una búsqueda difusa
// porque el vocabulario es corto y aquí sí importa la precisión: "prmaria" está
// a 1 edición de "primaria" pero a 4 de "preprimaria", y un ranking difuso
// puede confundirlas al ser "primaria" subcadena de "preprimaria".
const distancia = (a, b) => {
  if (a === b) return 0
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const fila = [i]
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      fila[j] = Math.min(prev[j] + 1, fila[j - 1] + 1, prev[j - 1] + costo)
    }
    prev = fila
  }
  return prev[n]
}

/**
 * Convierte cualquier variante de nivel educativo al valor canónico.
 * Devuelve null si el texto no corresponde a ningún nivel conocido.
 */
export const normalizarNivel = (raw) => {
  const s = normalizarTexto(raw)
  if (!s) return null

  // 1. Coincidencia exacta con un canónico ya normalizado
  const exacto = NIVELES_EDUCATIVOS.find(n => normalizarTexto(n) === s)
  if (exacto) return exacto

  // 2. Reglas por contención. "preprimaria" contiene "primaria", por eso va
  //    primero; "diversificado" antes que "basico"/"media" por especificidad.
  if (s.includes('preprimaria') || s.includes('pre primaria') || s.includes('parvul')) return 'Preprimaria'
  if (s.includes('diversificado'))                                                     return 'Media (Diversificado)'
  if (s.includes('basico'))                                                            return 'Media (Básico)'
  if (s.includes('primaria'))                                                          return 'Primaria'
  if (s.includes('media') || s.includes('medio'))                                      return 'Media (Básico)'

  // 3. Último recurso: el sinónimo más cercano por distancia de edición, para
  //    rescatar errores de escritura ("PRMARIA", "PRIMAARIA"). El umbral es
  //    proporcional al largo, así "xyz basura" no cae en ningún nivel.
  let mejor = null
  for (const [texto, canonico] of SINONIMOS) {
    const d = distancia(s, texto)
    const umbral = Math.max(1, Math.floor(texto.length * 0.3))
    if (d <= umbral && (!mejor || d < mejor.d)) mejor = { d, canonico }
  }
  return mejor ? mejor.canonico : null
}

export const esNivelValido = (valor) => NIVELES_EDUCATIVOS.includes(valor)
