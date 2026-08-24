import Fuse from 'fuse.js'
import { fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'fs'
import Departamental from '../models/Departamental.js'
import Departamento from '../models/Departamento.js'
import Municipio from '../models/Municipio.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

// Catálogo de alias (apodos/abreviaturas como "sn"/"sta") curado a mano,
// usado únicamente para enriquecer la búsqueda difusa de municipios.
const aliasPorNombre = new Map(
  JSON.parse(readFileSync(path.resolve(__dirname, './data.json'), 'utf-8'))
    .map(item => [normalizar(item.nombre), (item.alias ?? []).map(normalizar)])
)

// El departamento tiene pocos candidatos (22) y a veces viene como nombre de
// oficina ("Guatemala Norte") en vez del nombre puro: umbral más permisivo.
// El municipio tiene 340 candidatos a nivel nacional (alto riesgo de choques
// entre nombres parecidos de distintos departamentos): umbral más estricto.
const FUSE_OPTIONS_DEPTO = { threshold: 0.4, includeScore: true, ignoreLocation: true }
const FUSE_OPTIONS_MUNICIPIO = { threshold: 0.3, includeScore: true, ignoreLocation: true }

// Score máximo aceptable para tomar el mejor candidato como válido.
// Por encima de este valor se prefiere dejar el campo sin resolver
// (en vez de asignar una ubicación incorrecta con baja confianza).
const SCORE_MAX_ACEPTABLE = 0.5

// La capital viene escrita de muchas formas ("Ciudad Capital", "Ciudad de
// Guatemala", incluso el typo "Ciudad Capita") y sus centros educativos se
// registran por zona ("Zona 1".."Zona 25"). Todas corresponden al municipio y
// departamento de Guatemala.
const CAPITAL_RE = /ciudad\s+capit|ciudad\s+de\s+guatemala|guatemala\s+ciudad/
const ZONA_RE    = /^zona\s*\d+/

// Longitud mínima del nombre de un municipio para el fallback por contención
// (evita casar nombres cortos como "jocotan" por accidente dentro de otro texto).
const MIN_LEN_CONTENCION = 6

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Singleton: se inicializa solo una vez por proceso
let fuseDepto = null
let fuseMunicipios  = null   // Fuse GLOBAL: todos los municipios del país, sin filtrar por departamento
let municipiosBase = null    // Lista base de municipios (sin alias) para el fallback por contención
let departamentalPorDepto = null // Map<departamento_id, departamental_id>

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

  fuseDepto = new Fuse(deptoEntries, { keys: ['nombreBusqueda'], ...FUSE_OPTIONS_DEPTO })

  departamentalPorDepto = new Map()
  for (const d of deptoEntries) {
    if (!departamentalPorDepto.has(d.departamento_id)) {
      departamentalPorDepto.set(d.departamento_id, d.departamental_id)
    }
  }

  // Índice ÚNICO y GLOBAL de municipios: no se restringe por departamento,
  // porque el departamento que trae el Excel puede venir mal y no debe
  // impedir que un municipio bien escrito (o con alias conocido) se resuelva.
  //
  // Cada nombre/alias se agrega como una FILA independiente (comparación
  // 1 a 1 contra el texto buscado) en vez de meter los alias en un arreglo
  // dentro de un mismo campo: si se usa un campo tipo arreglo, Fuse combina
  // los puntajes de todas sus cadenas, y un municipio con muchos alias
  // termina "ganando" solo por tener más oportunidades de calzar por azar,
  // sin que ninguna sea realmente una buena coincidencia.
  const municipiosList = await Municipio.findAll({
    attributes: ['id', 'nombre', 'departamento_id'],
  })

  const filasMunicipios = []
  municipiosBase = []
  for (const m of municipiosList) {
    const nombreBusqueda = normalizar(m.nombre)
    const base = { nombre: m.nombre, municipio_id: m.id, departamento_id: m.departamento_id }
    filasMunicipios.push({ ...base, texto: nombreBusqueda })
    if (nombreBusqueda.length >= MIN_LEN_CONTENCION) {
      municipiosBase.push({ ...base, texto: nombreBusqueda })
    }
    for (const alias of aliasPorNombre.get(nombreBusqueda) ?? []) {
      if (alias && alias !== nombreBusqueda) filasMunicipios.push({ ...base, texto: alias })
    }
  }

  fuseMunicipios = new Fuse(filasMunicipios, { keys: ['texto'], ...FUSE_OPTIONS_MUNICIPIO })
}

// Fallback por contención: cuando la búsqueda difusa no resuelve, se busca un
// municipio cuyo nombre completo aparezca como palabra dentro del texto (p. ej.
// "Chichicastenango" dentro de "Santo Tomas Chichicastenango"). Se exige límite
// de palabra y se prefiere el nombre más largo (el más específico).
const municipioPorContencion = (textoNorm) => {
  if (!textoNorm) return null
  let mejor = null
  for (const m of municipiosBase) {
    const re = new RegExp(`(^|\\s)${escapeRegex(m.texto)}(\\s|$)`)
    if (re.test(textoNorm) && (!mejor || m.texto.length > mejor.texto.length)) {
      mejor = m
    }
  }
  return mejor
}

// Devuelve el mejor resultado de una búsqueda Fuse, o null si no hay ninguno
// con score suficientemente confiable (score más bajo = mejor coincidencia).
const mejorCandidato = (resultados) => {
  if (!resultados.length) return null
  const mejor = resultados[0]
  if (typeof mejor.score === 'number' && mejor.score > SCORE_MAX_ACEPTABLE) return null
  return mejor.item
}

/**
 * Valida y resuelve departamento + municipio usando búsqueda difusa contra la BD.
 *
 * El municipio se busca primero en un índice GLOBAL (todos los municipios del
 * país, con alias), sin importar qué departamento venga en el Excel. Si el
 * municipio resuelve con confianza, el departamento se deriva de ESE municipio
 * (corrigiendo el departamento del Excel si no coincide). Solo si el municipio
 * no se puede determinar se recurre al departamento tal como viene escrito.
 *
 * @param {string|null} departamentoNombre  - Nombre tal como viene en el Excel
 * @param {string|null} municipioNombre     - Nombre tal como viene en el Excel
 * @returns {{ departamental_id, departamento_id, municipio_id }}
 */
export async function validarUbicacion(departamentoNombre, municipioNombre) {
  await init()

  let depNorm = normalizar(departamentoNombre)
  let munNorm = normalizar(municipioNombre)

  // 0. Capital: "Ciudad Capital"/"Ciudad de Guatemala" y las zonas de la ciudad
  //    ("Zona 3") corresponden al municipio y departamento de Guatemala.
  const esCapital = CAPITAL_RE.test(depNorm) || CAPITAL_RE.test(munNorm)
  const esZonaCapital = ZONA_RE.test(munNorm) && (esCapital || depNorm.includes('guatemala'))
  if (esCapital || esZonaCapital) {
    depNorm = 'guatemala'
    munNorm = 'guatemala'
  }

  // 1. Intentar resolver el municipio en el catálogo global (con alias), y si la
  //    búsqueda difusa no basta, por contención de nombre dentro del texto.
  if (munNorm) {
    const municipio = mejorCandidato(fuseMunicipios.search(munNorm)) || municipioPorContencion(munNorm)
    if (municipio) {
      return {
        departamental_id: departamentalPorDepto.get(municipio.departamento_id) ?? null,
        departamento_id:  municipio.departamento_id,
        municipio_id:     municipio.municipio_id,
      }
    }
  }

  // 2. El municipio no resolvió (o no vino) — recurrir al departamento
  if (!depNorm) {
    return { departamental_id: null, departamento_id: null, municipio_id: null }
  }

  const depto = mejorCandidato(fuseDepto.search(depNorm))
  if (!depto) {
    return { departamental_id: null, departamento_id: null, municipio_id: null }
  }

  return {
    departamental_id: depto.departamental_id,
    departamento_id:  depto.departamento_id,
    municipio_id:     null,
  }
}
