import ExcelJS from 'exceljs'
import { sequelize } from '../config/database.js'
import '../models/Relations.js'
import CasoEmbarazo from '../models/CasoEmbarazo.js'
import Nina from '../models/Nina.js'
import HistorialEducativo from '../models/HistorialEducativo.js'
import CentroEducativo from '../models/CentroEducativo.js'
import CargaArchivo from '../models/CargaArchivo.js'
import { validarUbicacion } from '../helpers/validarUbicacion.js'
import { normalizarNivel } from '../helpers/nivelEducativo.js'
import { normalizar, clean, toTitleCase, getCellValue } from './cargaExcel.js'

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTACIÓN DE LA BASE DE QUEJAS ("Base unificado de quejas")

   Cada fila es una queja: datos del centro educativo, nombre y código personal
   de la niña, edad, pueblo, día/mes de ingreso, notificación, institución y
   número de queja. No trae CUI ni año.

   Para no duplicar niñas, cada fila se busca entre los casos existentes:
     1. Por CUI (si el archivo lo trae): debe coincidir también el nombre.
     2. Por código personal: debe coincidir el nombre (se toleran errores de
        dedo y el orden de los nombres). Mismo código con otro nombre es un
        conflicto y la fila no se toca.
     3. Por nombre: solo si no se contradicen CUI ni código personal.

   Si la niña ya existe:
     - y su caso no tiene queja → se le agrega (y pasa al estado de quejas);
     - y ya tiene esa misma queja → no se cambia nada;
     - y ya tiene OTRA queja → no se sobrescribe; se informa.
   Si no existe → se registra el caso completo.

   Un número de queja nunca se asigna a dos niñas: si ya pertenece a otro caso,
   la fila se informa como conflicto.

   Con `simular: true` todo se ejecuta dentro de una transacción que se revierte
   al final: sirve de vista previa con exactamente el mismo resultado.
   ═══════════════════════════════════════════════════════════════════════════ */

export const ESTADO_QUEJAS = 'Verificados en el Sistema de Quejas, Comentarios o Sugerencias'

// Encabezados reconocidos por campo (normalizados: sin tildes, mayúsculas ni
// puntuación). Los alias de una sola palabra solo valen como coincidencia
// exacta, para que "nombre" no tome "Nombre del Centro Educativo".
const COLUMNAS = {
  nombre:          ['nombre completo', 'nombre de la nina'],
  cui:             ['cui renap', 'cui'],
  codigo:          ['codigo personal', 'codigo de estudiante'],
  queja:           ['queja no', 'no de queja', 'numero de queja', 'no queja', 'queja'],
  edad:            ['edad', 'edad anos'],
  pueblo:          ['pueblo de pertenencia', 'pueblo'],
  dia:             ['dia'],
  mes:             ['mes'],
  anio:            ['ano'],
  notificacion:    ['no de notificacion', 'numero de notificacion', 'notificacion'],
  institucion:     ['institucion'],
  centro:          ['nombre del centro educativo', 'centro educativo'],
  udi:             ['codigo udi'],
  direccionCentro: ['direccion'],
  departamento:    ['departamento'],
  municipio:       ['zona o municipio', 'municipio'],
  sector:          ['sector'],
  area:            ['area'],
  nivel:           ['nivel'],
  jornada:         ['jornada'],
}

const normHeader = (s) => normalizar(s).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()

// Distancia de edición (para tolerar errores de dedo en nombres y catálogos)
const distancia = (a, b) => {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let previo = fila[0]
    fila[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = fila[j]
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, previo + (a[i - 1] === b[j - 1] ? 0 : 1))
      previo = tmp
    }
  }
  return fila[b.length]
}

const normNombre = (s) => normalizar(s).replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim()

// Mismo nombre: idéntico, con hasta 3 letras de diferencia, o las mismas
// palabras en otro orden.
const mismoNombre = (a, b) => {
  if (!a || !b) return false
  if (a === b || distancia(a, b) <= 3) return true
  return a.split(' ').sort().join(' ') === b.split(' ').sort().join(' ')
}

const normCodigo = (v) => { const s = clean(v); return s ? s.toUpperCase().replace(/\s+/g, '') : null }
const normCui    = (v) => { const s = clean(v); const d = s ? s.replace(/\D/g, '') : ''; return d.length === 13 ? d : null }
const normQueja  = (v) => {
  if (typeof v === 'number') return String(Math.trunc(v))
  const s = clean(v)
  return s ? s.replace(/\s+/g, '') : null
}

// Catálogos con valor canónico (el mismo que usa el formulario de registro)
const INSTITUCIONES = [
  ['ministerio publico', 'Ministerio Público'],
  ['procuraduria general', 'Procuraduría General de la Nación'],
  ['policia nacional civil', 'Policía Nacional Civil'],
]
const canonInstitucion = (v) => {
  const s = clean(v); if (!s) return null
  const n = normalizar(s)
  return INSTITUCIONES.find(([clave]) => n.includes(clave))?.[1] ?? toTitleCase(s)
}

const PUEBLOS = { maya: 'Maya', xinka: 'Xinka', xinca: 'Xinka', garifuna: 'Garífuna', ladino: 'Ladino', otros: 'Otros' }
const canonPueblo = (v) => { const s = clean(v); return s ? (PUEBLOS[normalizar(s)] ?? toTitleCase(s)) : null }

// Valor del catálogo más parecido (tolera 1–2 letras de diferencia: "RIRAL")
const masParecido = (v, opciones, tolerancia = 2) => {
  const s = clean(v); if (!s) return null
  const n = normalizar(s)
  const hallado = opciones.find(o => distancia(n, normalizar(o)) <= tolerancia)
  return hallado ?? toTitleCase(s)
}

// Nivel canónico; además corrige errores de dedo ("PRMARIA", "PRIMAARIA")
const canonNivel = (v) => {
  const directo = normalizarNivel(v)
  if (directo) return directo
  const n = normalizar(clean(v) ?? '')
  if (n.length >= 5 && distancia(n, 'primaria') <= 2) return 'Primaria'
  if (n.length >= 4 && distancia(n, 'basico') <= 2)   return 'Media (Básico)'
  return null
}

const fechaValida = (anio, mes, dia) => {
  if (!anio || !mes || !dia) return null
  const f = new Date(Date.UTC(anio, mes - 1, dia))
  if (f.getUTCFullYear() !== anio || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== dia) return null
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

const entero = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) ? n : null }

/**
 * @param {Buffer} buffer
 * @param {object} opts
 * @param {string} opts.nombreArchivo
 * @param {number|null} opts.usuarioId
 * @param {number} opts.anio        Año de las fechas Día/Mes cuando el archivo no trae "Año"
 * @param {boolean} opts.simular    true = vista previa (no guarda nada)
 */
export async function procesarBaseQuejas(buffer, {
  nombreArchivo = 'archivo.xlsx',
  usuarioId     = null,
  anio          = new Date().getFullYear(),
  simular       = false,
} = {}) {
  // 1. Leer el Excel y ubicar la fila de encabezados (la que trae "Nombre completo")
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const hoja = workbook.worksheets[0]
  if (!hoja) return { ok: false, message: 'El archivo no contiene hojas' }

  let filaEncabezado = null
  for (let r = 1; r <= 10 && !filaEncabezado; r++) {
    hoja.getRow(r).eachCell({ includeEmpty: false }, (cell) => {
      if (normHeader(getCellValue(cell) ?? '').includes('nombre completo')) filaEncabezado = r
    })
  }
  if (!filaEncabezado) {
    return { ok: false, message: 'No se encontró la fila de encabezados (debe incluir la columna "Nombre completo").' }
  }

  const encabezados = []   // [{ col, texto }]
  hoja.getRow(filaEncabezado).eachCell({ includeEmpty: false }, (cell, col) => {
    const texto = normHeader(getCellValue(cell) ?? '')
    if (texto) encabezados.push({ col, texto })
  })
  const columna = {}
  const usadas = new Set()
  for (const [campo, alias] of Object.entries(COLUMNAS)) {
    const exacta = encabezados.find(h => !usadas.has(h.col) && alias.includes(h.texto))
    const parcial = exacta ?? encabezados.find(h => !usadas.has(h.col) && alias.some(a => a.includes(' ') && h.texto.includes(a)))
    if (parcial) { columna[campo] = parcial.col; usadas.add(parcial.col) }
  }

  // Un archivo unificado puede repetir la fila de encabezados (al pegar bloques)
  const textoEncabezado = Object.fromEntries(encabezados.map(h => [h.col, h.texto]))
  const esEncabezadoRepetido = (fila) => Object.values(columna)
    .filter(col => normHeader(getCellValue(fila.getCell(col)) ?? '') === textoEncabezado[col]).length >= 2

  if (!columna.nombre || !columna.queja) {
    const faltan = [!columna.nombre && 'Nombre completo', !columna.queja && 'Número de queja'].filter(Boolean)
    return { ok: false, message: `El archivo no contiene las columnas obligatorias: ${faltan.join(', ')}.` }
  }
  const advertencias = []
  if (!columna.cui && !columna.codigo) {
    advertencias.push('El archivo no trae CUI ni código personal: las niñas solo se comparan por nombre.')
  } else if (!columna.cui) {
    advertencias.push('El archivo no trae CUI: las niñas se comparan por código personal y nombre.')
  }
  if (!columna.anio && columna.dia && columna.mes) {
    advertencias.push(`El archivo no trae año: las fechas de ingreso se registran en ${anio}.`)
  }

  // 2. Todo ocurre en una transacción; cada fila en su propio savepoint para
  //    que un error en una fila no afecte a las demás.
  const t = await sequelize.transaction()

  try {
    // 3. Índices de los casos existentes
    const casos = await CasoEmbarazo.findAll({
      attributes: ['id', 'numero_caso', 'queja'],
      include: [{
        model: Nina, as: 'nina', attributes: ['id', 'cui', 'nombre_completo'],
        include: [{ model: HistorialEducativo, as: 'historialEducativo', attributes: ['codigo_personal'] }],
      }],
      transaction: t,
    })

    const porCui = new Map(), porCodigo = new Map(), porNombre = new Map(), porQueja = new Map()
    const agregar = (mapa, clave, valor) => { if (clave) (mapa.get(clave) || mapa.set(clave, []).get(clave)).push(valor) }
    const indexar = (reg) => {
      if (reg.cui) porCui.set(reg.cui, reg)
      reg.codigos.forEach(c => agregar(porCodigo, c, reg))
      agregar(porNombre, reg.nombreN, reg)
      if (reg.queja) porQueja.set(reg.queja, reg)
    }
    for (const c of casos) {
      indexar({
        casoId:   c.id,
        numero:   c.numero_caso,
        queja:    normQueja(c.queja),
        nombre:   c.nina?.nombre_completo ?? '',
        nombreN:  normNombre(c.nina?.nombre_completo),
        cui:      normCui(c.nina?.cui),
        codigos:  new Set((c.nina?.historialEducativo ?? []).map(h => normCodigo(h.codigo_personal)).filter(Boolean)),
      })
    }

    const centros = await CentroEducativo.findAll({ attributes: ['id', 'codigo_udi'], transaction: t })
    const centroPorUdi = new Map(centros.map(c => [normalizar(c.codigo_udi), c.id]))

    const numerosUsados = new Set(casos.map(c => String(c.numero_caso ?? '').trim()))
    let siguienteId = Number((await CasoEmbarazo.max('id', { transaction: t })) || 0) + 1
    const sufijoAnio = String(new Date().getFullYear()).slice(-3)   // mismo formato que GenerarNumeroCaso
    const nuevoNumeroCaso = () => {
      let n
      do { n = `${String(siguienteId++).padStart(5, '0')}-${sufijoAnio}` } while (numerosUsados.has(n))
      numerosUsados.add(n)
      return n
    }

    // Busca el caso de la misma niña. Devuelve { registro } o { conflicto } o null.
    const buscarNina = ({ cui, codigo, nombreN }) => {
      if (cui && porCui.has(cui)) {
        const r = porCui.get(cui)
        return mismoNombre(r.nombreN, nombreN)
          ? { registro: r }
          : { conflicto: `El CUI ${cui} ya pertenece a "${r.nombre}" (caso ${r.numero}), con otro nombre.` }
      }
      if (codigo && porCodigo.has(codigo)) {
        const lista = porCodigo.get(codigo)
        const r = lista.find(x => mismoNombre(x.nombreN, nombreN))
        if (r) return { registro: r }
        return { conflicto: `El código personal ${codigo} ya pertenece a "${lista[0].nombre}" (caso ${lista[0].numero}), con otro nombre.` }
      }
      const homonimas = porNombre.get(nombreN) ?? []
      const compatibles = homonimas.filter(r =>
        !(cui && r.cui && r.cui !== cui) && !(codigo && r.codigos.size && !r.codigos.has(codigo)))
      if (compatibles.length === 1) return { registro: compatibles[0] }
      if (compatibles.length > 1) {
        return { conflicto: `Hay ${compatibles.length} casos con el mismo nombre (${compatibles.map(r => r.numero).join(', ')}); no se puede saber cuál es.` }
      }
      if (homonimas.length) {
        const r = homonimas[0]
        return { conflicto: `Ya existe "${r.nombre}" (caso ${r.numero}) con otro código personal/CUI; revise si es la misma niña.` }
      }
      return null
    }

    // 4. Registro de la carga (se revierte junto con todo en la vista previa)
    const carga = await CargaArchivo.create({
      nombre_archivo:       nombreArchivo,
      total_registros:      0,
      registros_nuevos:     0,
      registros_duplicados: 0,
      fecha_carga:          new Date(),
      usuario_id:           usuarioId,
    }, { transaction: t })

    const nuevos = [], quejaAgregada = [], sinCambios = [], otraQueja = [], conflictos = [], sinUbicacion = []
    let total = 0

    // 5. Filas
    for (let r = filaEncabezado + 1; r <= hoja.rowCount; r++) {
      const fila = hoja.getRow(r)
      const leer = (campo) => (columna[campo] ? getCellValue(fila.getCell(columna[campo])) : null)
      if (!Object.values(columna).some(col => clean(getCellValue(fila.getCell(col))) !== null)) continue
      if (esEncabezadoRepetido(fila)) continue
      total++

      const nombre  = toTitleCase(clean(leer('nombre'))?.replace(/\s+/g, ' '))
      const nombreN = normNombre(nombre)
      const cui     = normCui(leer('cui'))
      const codigo  = normCodigo(leer('codigo'))
      const queja   = normQueja(leer('queja'))
      const base    = { fila: r, nombre, codigo, queja }

      if (!nombre) { conflictos.push({ ...base, motivo: 'La fila no trae nombre completo.' }); continue }
      if (!queja)  { conflictos.push({ ...base, motivo: 'La fila no trae número de queja.' }); continue }

      const duenoQueja = porQueja.get(queja)
      const hallado = buscarNina({ cui, codigo, nombreN })

      if (hallado?.conflicto) { conflictos.push({ ...base, motivo: hallado.conflicto }); continue }

      // ── La niña ya existe ────────────────────────────────────────────────
      if (hallado?.registro) {
        const reg = hallado.registro
        if (reg.queja === queja) { sinCambios.push({ ...base, numero_caso: reg.numero }); continue }
        if (reg.queja) {
          // Si la queja del archivo está en el caso de otra niña, se avisa: puede
          // ser un error de una carga anterior que conviene revisar.
          const observacion = duenoQueja && duenoQueja !== reg
            ? `La queja ${queja} está registrada en el caso ${duenoQueja.numero} ("${duenoQueja.nombre}").`
            : null
          otraQueja.push({
            ...base,
            numero_caso: reg.numero,
            queja_actual: reg.queja,
            observacion,
            motivo: `El caso ya tiene la queja ${reg.queja}; no se sobrescribe.${observacion ? ` ${observacion}` : ''}`,
          })
          continue
        }
        if (duenoQueja) {
          conflictos.push({ ...base, numero_caso: reg.numero, motivo: `La queja ${queja} ya está registrada en el caso ${duenoQueja.numero} ("${duenoQueja.nombre}").` })
          continue
        }
        const sp = await sequelize.transaction({ transaction: t })
        try {
          await CasoEmbarazo.update({ queja, estado: ESTADO_QUEJAS }, { where: { id: reg.casoId }, transaction: sp })
          await sp.commit()
          reg.queja = queja
          porQueja.set(queja, reg)
          quejaAgregada.push({ ...base, numero_caso: reg.numero })
        } catch (err) {
          await sp.rollback()
          conflictos.push({ ...base, numero_caso: reg.numero, motivo: `Error al agregar la queja: ${err.message}` })
        }
        continue
      }

      // ── Niña nueva ───────────────────────────────────────────────────────
      if (duenoQueja) {
        conflictos.push({ ...base, motivo: `La queja ${queja} ya está registrada en el caso ${duenoQueja.numero} ("${duenoQueja.nombre}").` })
        continue
      }

      const departamento = clean(leer('departamento'))
      const municipio    = clean(leer('municipio'))
      const ubicacion    = await validarUbicacion(departamento, municipio)
      const problemas = []
      if (!ubicacion.departamental_id) problemas.push(`departamento "${departamento ?? ''}" no reconocido`)
      if (!ubicacion.municipio_id)     problemas.push(`municipio "${municipio ?? ''}" no reconocido`)

      const anioFila = entero(leer('anio')) || anio
      const fechaIngreso = fechaValida(anioFila, entero(leer('mes')), entero(leer('dia')))
      const edad = entero(leer('edad'))

      const sp = await sequelize.transaction({ transaction: t })
      try {
        const nina = await Nina.create({
          cui,
          nombre_completo: nombre,
          edad:            edad && edad >= 5 && edad <= 20 ? edad : null,
          // El archivo solo trae la ubicación del centro educativo; se usa
          // como ubicación de la niña (mismo criterio que la carga SIRE).
          municipio_id:    ubicacion.municipio_id,
          departamento_id: ubicacion.departamento_id,
          pueblo:          canonPueblo(leer('pueblo')),
        }, { transaction: sp })

        let centroId = null
        const udi = clean(leer('udi'))
        if (udi) {
          const udiN = normalizar(udi)
          centroId = centroPorUdi.get(udiN) ?? null
          if (!centroId && ubicacion.municipio_id) {
            const centro = await CentroEducativo.create({
              codigo_udi:   udi,
              nombre:       toTitleCase(clean(leer('centro'))) || udi,
              direccion:    toTitleCase(clean(leer('direccionCentro'))),
              municipio_id: ubicacion.municipio_id,
              sector:       masParecido(leer('sector'), ['Oficial', 'Privado', 'Cooperativa', 'Municipal']),
              jornada:      masParecido(leer('jornada'), ['Matutina', 'Vespertina', 'Nocturna', 'Doble', 'Fin de semana', 'Intermedia']),
              area:         masParecido(leer('area'), ['Urbana', 'Rural']),
            }, { transaction: sp })
            centroId = centro.id
          }
        }

        await HistorialEducativo.create({
          nina_id:             nina.id,
          centro_educativo_id: centroId,
          codigo_personal:     codigo,
          subsistema:          'Subsistema Escolar',
          nivel:               canonNivel(leer('nivel')),
        }, { transaction: sp })

        const numero = nuevoNumeroCaso()
        const caso = await CasoEmbarazo.create({
          numero_caso:      numero,
          nina_id:          nina.id,
          carga_archivo_id: carga.id,
          fecha_ingreso:    fechaIngreso,
          forma_deteccion:  'Sistema de Quejas',
          no_notificacion:  clean(leer('notificacion')),
          institucion:      canonInstitucion(leer('institucion')),
          queja,
          estado:           ESTADO_QUEJAS,
          departamental_id: ubicacion.departamental_id,
        }, { transaction: sp })

        await sp.commit()
        if (udi && centroId) centroPorUdi.set(normalizar(udi), centroId)

        // Para que una segunda fila de la misma niña en el archivo la encuentre
        indexar({
          casoId: caso.id, numero, queja, nombre, nombreN, cui,
          codigos: new Set(codigo ? [codigo] : []),
        })
        nuevos.push({ ...base, numero_caso: numero })
        if (problemas.length) sinUbicacion.push({ ...base, numero_caso: numero, motivo: problemas.join('; ') })
      } catch (err) {
        await sp.rollback()
        conflictos.push({ ...base, motivo: `No se pudo registrar: ${err.message}` })
      }
    }

    await carga.update({
      total_registros:      total,
      registros_nuevos:     nuevos.length,
      registros_duplicados: total - nuevos.length - quejaAgregada.length,
    }, { transaction: t })

    if (simular) await t.rollback()
    else await t.commit()

    return {
      ok: true,
      simulacion: simular,
      carga_id: simular ? null : carga.id,
      message: simular ? 'Vista previa: no se guardó ningún cambio' : 'Base de quejas importada',
      total,
      nuevos: nuevos.length,
      actualizados: quejaAgregada.length,
      sinCambios: sinCambios.length,
      otraQueja: otraQueja.length,
      conflictos: conflictos.length,
      quejaAgregadaDetalle: quejaAgregada,
      nuevosDetalle: nuevos,
      otraQuejaDetalle: otraQueja,
      conflictosDetalle: conflictos,
      sinUbicacion,
      advertencias,
    }
  } catch (error) {
    await t.rollback()
    throw error
  }
}
