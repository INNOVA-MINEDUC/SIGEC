import ExcelJS from 'exceljs'
import { sequelize } from '../config/database.js'
import '../models/Relations.js'
import CasoEmbarazo from '../models/CasoEmbarazo.js'
import Nina from '../models/Nina.js'
import HistorialEducativo from '../models/HistorialEducativo.js'
import CentroEducativo from '../models/CentroEducativo.js'
import CargaArchivo from '../models/CargaArchivo.js'
import { validarUbicacion } from '../helpers/validarUbicacion.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

// Colapsa saltos de línea/espacios múltiples (frecuentes en cabeceras con texto ajustado)
export const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()


// Convierte texto a Title Case: "MARIA JOSE GARCIA" → "Maria Jose Garcia"
export const toTitleCase = (str) => {
  if (!str) return str
  return String(str).toLowerCase().replace(/(?:^|[\s\-\/])\S/g, c => c.toUpperCase())
}

// Valores que equivalen a "sin dato" en los archivos MSPAS
const VACIOS = new Set(['no indica', 'sin dato', 'n/a', 'n.a.', 'nd', 'ninguno', '-', '--', 's/d', 'no aplica'])

export const clean = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).trim()
  if (str === '') return null
  if (VACIOS.has(normalizar(str))) return null
  return str
}

// ExcelJS puede devolver objetos para celdas con fórmulas o rich-text
export const getCellValue = (cell) => {
  const v = cell.value
  if (v === null || v === undefined) return null
  if (v instanceof Date) return v
  if (typeof v === 'object' && !Array.isArray(v)) {
    if ('result' in v) return v.result
    if ('richText' in v) return v.richText.map(rt => rt.text || '').join('')
    if ('text' in v) return v.text
    return null
  }
  return v
}

export const parseDate = (val) => {
  if (val === null || val === undefined) return null
  if (val instanceof Date && !isNaN(val)) return val.toISOString().split('T')[0]
  const str = clean(val)
  if (!str) return null
  const partes = str.split('/')
  if (partes.length === 3) {
    const [a, b, c] = partes
    const d = new Date(`${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`)
    if (!isNaN(d)) return d.toISOString().split('T')[0]
  }
  const d = new Date(str)
  if (!isNaN(d)) return d.toISOString().split('T')[0]
  return null
}

// Mapea el valor de Escolaridad/Nivel del archivo a los niveles del sistema
export const mapEscolaridad = (raw) => {
  if (!raw) return null
  const s = normalizar(raw)
  if (s.includes('preprimaria'))                             return 'Preprimaria'
  if (s.includes('primaria'))                                return 'Primaria'
  if (s.includes('diversificado'))                          return 'Media (Diversificado)'
  if (s.includes('basico') || s.includes('medio') ||
      s.includes('ciclo basico'))                           return 'Media (Básico)'
  return clean(raw) // pasar el valor original si no coincide con ningún patrón
}

// Columnas mínimas requeridas en el archivo
export const COLS_OBLIGATORIAS = [
  { patron: 'nombre completo', label: 'Nombre completo' },
]
export const COLS_IMPORTANTES = [
  { patron: 'cui renap',             label: 'CUI RENAP' },
  { patron: 'departamento',          label: 'Departamento' },
  { patron: 'fecha primer contacto', label: 'Fecha Primer Contacto' },
  { patron: 'edad',                  label: 'Edad Años' },
  { patron: 'fecha nacimiento',      label: 'Fecha Nacimiento' },
]

/**
 * Procesa un archivo Excel (buffer) con el formato de reporte MSPAS y crea/actualiza
 * los registros correspondientes (Nina, CasoEmbarazo, HistorialEducativo, CentroEducativo).
 *
 * Usado tanto por el endpoint de carga masiva (UploadController) como por el seeder
 * que carga la base de datos a partir de un archivo Excel.
 */
export async function procesarExcelCasos(buffer, { nombreArchivo = 'archivo.xlsx', usuarioId = null } = {}) {
  // 1. Parsear Excel
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    return { ok: false, message: 'El archivo no contiene hojas' }
  }

  // 2. Identificadores existentes para deduplicación
  const existingNinas   = await Nina.findAll({ attributes: ['cui', 'nombre_completo'] })
  const existingCuis    = new Set(existingNinas.map(n => String(n.cui ?? '').trim()).filter(Boolean))
  const existingNombres = new Set(existingNinas.map(n => normalizar(String(n.nombre_completo ?? ''))).filter(Boolean))

  // 4.1 Centros educativos existentes (por código UDI)
  const existingCentros = await CentroEducativo.findAll({ attributes: ['id', 'codigo_udi'] })
  const centroPorUdi = new Map(existingCentros.map(c => [normalizar(c.codigo_udi), c.id]))

  // 5. Max ID actual de casos para numerar y números de caso existentes
  const maxCasoId  = Number((await CasoEmbarazo.max('id')) || 0)
  const yearSuffix = String(new Date().getFullYear()).slice(-3)
  const existingNumerosCaso = new Set(
    (await CasoEmbarazo.findAll({ attributes: ['numero_caso'] })).map(c => String(c.numero_caso ?? '').trim())
  )

  // 6. Auto-detectar fila de cabeceras buscando "nombre completo" en las primeras 8 filas.
  // El formato SIRE tiene títulos y agrupaciones en las filas superiores antes de los nombres reales.
  let headerRowNum = 1
  for (let r = 1; r <= 8; r++) {
    let found = false
    worksheet.getRow(r).eachCell({ includeEmpty: false }, (cell) => {
      const norm = normalizar(String(getCellValue(cell) ?? ''))
      if (norm.includes('nombre completo')) found = true
    })
    if (found) { headerRowNum = r; break }
  }

  // Mapear número de columna → nombre normalizado (las cabeceras repetidas se sufijan: "x", "x (2)", "x (3)"...)
  const headersByCol = {}
  const headerCounts = {}
  worksheet.getRow(headerRowNum).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const base = normalizar(String(getCellValue(cell) ?? ''))
    if (!base) return
    headerCounts[base] = (headerCounts[base] || 0) + 1
    const name = headerCounts[base] > 1 ? `${base} (${headerCounts[base]})` : base
    headersByCol[colNumber] = name
  })

  const colsDetectadas = Object.values(headersByCol)
  console.log(`\n━━━ CARGA MASIVA: ${nombreArchivo} ━━━`)
  console.log(`   Fila de cabecera detectada: ${headerRowNum}`)
  console.log(`   Columnas (${colsDetectadas.length}):`, colsDetectadas.join(' | '))

  // 6.1 Validar que el archivo tenga las columnas necesarias (evita cargas de archivos incorrectos)
  const faltanObligatorias = COLS_OBLIGATORIAS
    .filter(c => !colsDetectadas.some(h => h.includes(c.patron)))
    .map(c => c.label)

  if (faltanObligatorias.length > 0) {
    return {
      ok: false,
      message: `El archivo no contiene las columnas obligatorias (${faltanObligatorias.join(', ')}). Verifique que está subiendo el archivo correcto del reporte MSPAS.`,
    }
  }

  const faltanImportantes = COLS_IMPORTANTES
    .filter(c => !colsDetectadas.some(h => h.includes(c.patron)))
    .map(c => c.label)

  // 7. Extraer filas de datos
  const rawRows = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNum) return
    const rowData = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headersByCol[colNumber]
      if (key) rowData[key] = getCellValue(cell)
    })
    if (Object.keys(rowData).length > 0) rawRows.push(rowData)
  })

  if (rawRows.length > 0) {
    console.log('\n   Primera fila parseada (primeros 12 campos):')
    Object.entries(rawRows[0]).slice(0, 12).forEach(([k, v]) =>
      console.log(`     ${k.padEnd(30)} →  ${String(v ?? '(vacío)').slice(0, 60)}`)
    )
  }

  const totalFilas = rawRows.length
  let nuevos      = 0
  let duplicados  = 0
  const omitidos       = []
  const erroresMuestra = []

  // 8. Crear registro de carga ANTES del loop
  const carga = await CargaArchivo.create({
    nombre_archivo:       nombreArchivo,
    total_registros:      totalFilas,
    registros_nuevos:     0,
    registros_duplicados: 0,
    fecha_carga:          new Date(),
    usuario_id:           usuarioId,
  })

  console.log(`\n   Procesando ${totalFilas} filas de datos (carga_id=${carga.id})...\n`)

  // 9. Procesar fila a fila
  for (let i = 0; i < rawRows.length; i++) {
    const row     = rawRows[i]
    const filaNum = headerRowNum + 1 + i
    const get     = (col) => row[normalizar(col)] ?? null
    // Búsqueda flexible: encuentra el primer valor cuya cabecera contenga alguno de los patrones
    const pick = (...patrones) => {
      for (const p of patrones) {
        const pn = normalizar(p)
        for (const [k, v] of Object.entries(row)) {
          if (k.includes(pn)) {
            const c = clean(v)
            if (c !== null) return v
          }
        }
      }
      return null
    }

    const cuiRaw         = clean(get('CUI RENAP')) || clean(get('cui')) || null
    const nombreCompleto = toTitleCase(clean(get('Nombre completo')))

    // Sin nombre: omitir
    if (!nombreCompleto) {
      duplicados++
      if (omitidos.length < 20) omitidos.push(`SIN_NOMBRE | fila ${filaNum}`)
      console.warn(`  [OMITIDA fila ${filaNum}] Sin nombre completo`)
      continue
    }

    // Deduplicar por CUI (si existe) o por nombre
    if (cuiRaw && existingCuis.has(cuiRaw)) {
      duplicados++
      if (omitidos.length < 20) omitidos.push(`DUPLICADO_CUI | fila ${filaNum} | CUI: ${cuiRaw}`)
      console.warn(`  [OMITIDA fila ${filaNum}] Duplicado por CUI "${cuiRaw}"`)
      continue
    }
    if (!cuiRaw && existingNombres.has(normalizar(nombreCompleto))) {
      duplicados++
      if (omitidos.length < 20) omitidos.push(`DUPLICADO_NOMBRE | fila ${filaNum} | nombre: "${nombreCompleto}"`)
      console.warn(`  [OMITIDA fila ${filaNum}] Duplicado por nombre "${nombreCompleto}"`)
      continue
    }

    // Si no viene CUI se guarda null; nunca se inventan números
    const cuiFinal    = cuiRaw ?? null
    const fechaNacStr = parseDate(pick('Fecha de Nacimiento', 'Fecha Nacimiento'))

    // ── Resolución de departamental, departamento y municipio (de la niña) ──
    // Col 6 "Dirección Departamental de Educación" = departamento de la niña
    // Col 14 "Municipio de Residencia" = municipio de la niña
    const deptoNombre     = clean(pick('Dirección Departamental', 'Departamento'))
    const municipioNombre = clean(pick('Municipio de Residencia', 'Municipio'))
    const { departamental_id, departamento_id, municipio_id } =
      await validarUbicacion(deptoNombre, municipioNombre)
    if (!departamental_id) console.warn(`  [SIN DEPTO  fila ${filaNum}] "${deptoNombre}" no resolvió departamental`)
    if (!municipio_id)     console.warn(`  [SIN MUNI   fila ${filaNum}] "${municipioNombre}" no resolvió municipio`)

    // ── Pueblo y comunidad lingüística como texto ───────────────────────────
    const pueblo               = toTitleCase(clean(pick('Pueblo de pertenencia', 'Pueblo'))) || null
    const comunidad_linguistica = toTitleCase(
      clean(pick('Comunidad Linguistica', 'Comunidad Lingüística', 'Comunidad'))
    ) || null

    // ── Situación educativa / centro educativo ──────────────────────────────
    const codigoPersonal = clean(pick('Código personal', 'Codigo personal'))
    const statusActual   = clean(pick('Status actual', 'Estatus actual'))
    const grado          = clean(pick('Grado'))
    const resultado      = clean(pick('Resultado'))
    // "ano (2)" es col 24 (año educativo); "ano" es col 4 (año de ingreso)
    const anioRaw        = get('ano (2)') ?? pick('Ano Educativo')
    const anio           = anioRaw ? parseInt(String(anioRaw), 10) || null : null
    const nivelEducativo = mapEscolaridad(pick('Nivel') ?? get('Escolaridad') ?? get('escolaridad'))

    const codigoUdi       = clean(pick('Código UDI', 'Codigo UDI'))
    const centroNombre    = clean(pick('Nombre del Centro'))
    const centroDireccion = clean(pick('Dirección (2)', 'Direccion (2)'))
    const sector          = clean(pick('Sector'))
    const jornada         = clean(pick('Jornada'))
    const area            = clean(pick('Área', 'Area'))

    // Col 26 "Departamento" (exacto) = depto del centro educativo
    // Col 27 "Zona o Municipio" = municipio del centro
    const centroDeptoNombre     = clean(get('departamento'))
    const centroMunicipioNombre = clean(pick('Zona o Municipio'))
    const { municipio_id: centroMunicipioId } =
      await validarUbicacion(centroDeptoNombre, centroMunicipioNombre)
    if (codigoUdi && !centroMunicipioId)
      console.warn(`  [SIN CENTRO fila ${filaNum}] "${centroDeptoNombre}/${centroMunicipioNombre}" no resolvió municipio del centro`)

    // ── No. de caso y Queja son independientes ───────────────────────────────
    const numeroCasoArchivo = clean(get('no. de caso'))
    const queja             = clean(pick('No. de Queja', 'Numero de queja'))

    const t = await sequelize.transaction()
    try {
      const edadRaw = get('edad') ?? pick('Edad')
      const edad    = edadRaw ? parseInt(String(edadRaw), 10) || null : null
      const direccion = toTitleCase(clean(get('direccion')))

      const nina = await Nina.create({
        cui:                    cuiFinal,
        nombre_completo:        nombreCompleto,
        fecha_nacimiento:       fechaNacStr,
        edad,
        direccion,
        municipio_id,
        pueblo,
        comunidad_linguistica,
      }, { transaction: t })

      // Centro educativo: se crea/reutiliza solo si hay código UDI y municipio resuelto
      let centroEducativoId = null
      if (codigoUdi) {
        const udiNorm = normalizar(codigoUdi)
        if (centroPorUdi.has(udiNorm)) {
          centroEducativoId = centroPorUdi.get(udiNorm)
        } else if (centroMunicipioId) {
          const centro = await CentroEducativo.create({
            codigo_udi:   codigoUdi,
            nombre:       toTitleCase(centroNombre) || codigoUdi,
            direccion:    toTitleCase(centroDireccion),
            municipio_id: centroMunicipioId,
            sector,
            jornada,
            area,
          }, { transaction: t })
          centroEducativoId = centro.id
          centroPorUdi.set(udiNorm, centro.id)
        }
      }

      // fecha_ingreso: construir desde Día/Mes/Año (cols 2/3/4) — formato SIRE
      const diaIngreso = parseInt(String(get('dia') ?? ''), 10) || null
      const mesIngreso = parseInt(String(get('mes') ?? ''), 10) || null
      const anoIngreso = parseInt(String(get('ano') ?? ''), 10) || null
      const fechaContacto = (diaIngreso && mesIngreso && anoIngreso)
        ? `${anoIngreso}-${String(mesIngreso).padStart(2, '0')}-${String(diaIngreso).padStart(2, '0')}`
        : parseDate(pick('Fecha de ingreso', 'Fecha Primer Contacto'))
      const fechaConsulta  = parseDate(pick('Fecha Primera Consulta'))
      const noNotificacion = clean(pick('No. de notificacion', 'notificacion'))
      const institucion    = clean(get('institucion')) || clean(pick('Institucion'))
      const formaDeteccion = clean(pick('Forma de deteccion')) || 'MSPAS'

      let numeroCaso = numeroCasoArchivo
      if (!numeroCaso || existingNumerosCaso.has(numeroCaso)) {
        numeroCaso = `${String(maxCasoId + nuevos + 1).padStart(5, '0')}-${yearSuffix}`
      }

      await CasoEmbarazo.create({
        numero_caso:            numeroCaso,
        nina_id:                nina.id,
        carga_archivo_id:       carga.id,
        fecha_ingreso:          fechaContacto,
        fecha_primera_consulta: fechaConsulta,
        forma_deteccion:        formaDeteccion,
        no_notificacion:        noNotificacion,
        institucion,
        queja,
        estado:                 'sin Verificar en el SIRE',
        departamental_id,
      }, { transaction: t })

      // Crear historial educativo si hay datos de escolaridad/situación educativa
      if (nivelEducativo || codigoPersonal || statusActual || grado || resultado || anio || centroEducativoId) {
        await HistorialEducativo.create({
          nina_id:             nina.id,
          centro_educativo_id: centroEducativoId,
          codigo_personal:     codigoPersonal,
          status_actual:       statusActual,
          subsistema:          'Subsistema Escolar',
          grado,
          nivel:               nivelEducativo,
          resultado,
          anio,
        }, { transaction: t })
      }

      await t.commit()
      if (cuiFinal) existingCuis.add(cuiFinal)
      existingNombres.add(normalizar(nombreCompleto))
      existingNumerosCaso.add(numeroCaso)
      nuevos++
      const tag = cuiFinal ?? 'sin CUI'
      console.log(`  [OK fila ${filaNum}] Caso ${numeroCaso} — "${nombreCompleto}" (${tag}) nivel="${nivelEducativo ?? '-'}" mun_id=${municipio_id ?? 'null'} centro_id=${centroEducativoId ?? 'null'}`)

    } catch (err) {
      await t.rollback()
      const razon = err.name === 'SequelizeUniqueConstraintError'
        ? `UNIQUE_CONSTRAINT | fila ${filaNum} | CUI: ${cuiFinal} | nombre: "${nombreCompleto}"`
        : `DB_ERROR | fila ${filaNum} | ${err.message}`
      if (omitidos.length < 20) omitidos.push(razon)
      duplicados++
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.warn(`  [OMITIDA fila ${filaNum}] Restricción única — "${nombreCompleto}" (${cuiFinal})`)
      } else {
        console.error(`  [ERROR fila ${filaNum}] ${err.message}`)
        if (erroresMuestra.length < 5) erroresMuestra.push(`[fila ${filaNum}] ${err.message}`)
      }
    }
  }

  console.log(`\n   ── Resultado ──`)
  console.log(`   Total filas:  ${totalFilas}`)
  console.log(`   Nuevos:       ${nuevos}`)
  console.log(`   Duplicados/Omitidos: ${duplicados}`)
  if (omitidos.length) {
    console.warn(`\n   ── Registros no ingresados (${omitidos.length}) ──`)
    omitidos.forEach(r => console.warn(`     • ${r}`))
  }
  if (erroresMuestra.length) {
    console.error(`\n   ── Errores de BD (${erroresMuestra.length}) ──`)
    erroresMuestra.forEach(e => console.error(`     • ${e}`))
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 10. Actualizar conteos finales
  await carga.update({ registros_nuevos: nuevos, registros_duplicados: duplicados })

  return {
    ok:       true,
    message:  'Carga masiva completada',
    carga_id: carga.id,
    total:    totalFilas,
    nuevos,
    duplicados,
    advertencias: faltanImportantes.length > 0
      ? [`El archivo no incluye estas columnas: ${faltanImportantes.join(', ')}. Esos datos quedarán vacíos.`]
      : [],
    _debug: {
      fila_cabecera:       headerRowNum,
      columnas_detectadas: colsDetectadas,
      omitidos_muestra:    omitidos,
      errores_muestra:     erroresMuestra,
    },
  }
}
