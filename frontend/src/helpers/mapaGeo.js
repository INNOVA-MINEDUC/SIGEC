import guatemalaMunicipios from './Municipios2.json'

// Emparejamiento entre los nombres del catálogo (BD) y los polígonos del
// GeoJSON del mapa. Lo usan el mapa (para pintar y resaltar) y el dashboard
// (para convertir un clic en el mapa en el filtro correspondiente).

// Quita tildes y cualquier carácter que no sea letra/número/espacio: el GeoJSON
// trae caracteres invisibles (p. ej. guion suave en "San Agustí­n") que
// impedían emparejar nombres que a simple vista son iguales.
export const normGeo = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

// Nombres del catálogo (BD) que en el GeoJSON están escritos distinto
const ALIAS_MUNICIPIO_GEO = {
  'san ildefonso ixtahuacan':  'san idelfonso ixtahuacan',
  'san juan ermita':           'san juan la ermita',
  'santa lucia cotzumalguapa': 'santa lucia cotzulmalguapa',
  'santa maria de jesus':      'santa maria de jesis',
  'san pablo jocopilas':       'san pablo jocopila',
}

// Polígonos municipales agrupados por departamento (nombres normalizados)
const municipiosGeoPorDepto = new Map()
for (const f of guatemalaMunicipios.features) {
  const d = normGeo(f.properties?.departamen)
  if (!municipiosGeoPorDepto.has(d)) municipiosGeoPorDepto.set(d, [])
  municipiosGeoPorDepto.get(d).push(normGeo(f.properties?.municipio))
}

/**
 * Nombre (normalizado) del polígono que corresponde a un municipio del catálogo:
 * 1) igual, 2) alias, 3) un nombre contiene al otro dentro del mismo
 * departamento ("santa cruz barillas" ↔ "barillas") si hay un único candidato.
 */
export function poligonoDeMunicipio(nombreMunicipio, nombreDepartamento) {
  const nombre = normGeo(nombreMunicipio)
  if (!nombre) return null
  const lista = municipiosGeoPorDepto.get(normGeo(nombreDepartamento)) || []
  const m = ALIAS_MUNICIPIO_GEO[nombre] || nombre
  if (lista.includes(m)) return m
  const cand = lista.filter(g => ` ${m} `.includes(` ${g} `) || ` ${g} `.includes(` ${m} `))
  return cand.length === 1 ? cand[0] : nombre
}

/** Polígono del municipio de residencia de la niña de un caso. */
export const poligonoDeCaso = (c) =>
  poligonoDeMunicipio(c?.nina?.municipio?.nombre, c?.nina?.municipio?.departamento?.nombre)

/** Features municipales de un departamento, para cargarlas en el mapa. */
export const featuresMunicipiosDe = (nombreDepartamento) => {
  const d = normGeo(nombreDepartamento)
  return guatemalaMunicipios.features.filter(f => normGeo(f.properties?.departamen) === d)
}
