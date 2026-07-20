import ExcelJS from 'exceljs'
import path from 'path'
import { sequelize } from '../config/database.js'
import '../models/Relations.js'
import CasoEmbarazo from '../models/CasoEmbarazo.js'
import Nina from '../models/Nina.js'
import HistorialEducativo from '../models/HistorialEducativo.js'
import CentroEducativo from '../models/CentroEducativo.js'
import CargaArchivo from '../models/CargaArchivo.js'
import { validarUbicacion } from '../helpers/validarUbicacion.js'
import { normalizarNivel } from '../helpers/nivelEducativo.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

export const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

export const toTitleCase = (str) => {
  if (!str) return str
  return String(str).toLowerCase().replace(/(?:^|[\s\-\/])\S/g, c => c.toUpperCase())
}

const VACIOS = new Set(['no indica', 'sin dato', 'n/a', 'n.a.', 'nd', 'ninguno', '-', '--', 's/d', 'no aplica'])

export const clean = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).trim()
  if (str === '') return null
  if (VACIOS.has(normalizar(str))) return null
  return str
}

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

// El vocabulario de nivel educativo vive en helpers/nivelEducativo.js para que
// la carga masiva, el registro manual y los filtros del dashboard usen los
// mismos valores. Devuelve null cuando el texto no corresponde a ningún nivel
// conocido (antes se guardaba el texto crudo, generando valores como "PRMARIA").
export const mapEscolaridad = (raw) => normalizarNivel(raw)

export const COLS_OBLIGATORIAS = [
  { patron: 'nombre completo', label: 'Nombre completo' },
]
export const COLS_IMPORTANTES = [
  { patron: 'cui',                label: 'CUI' },
  { patron: 'departamento',       label: 'Departamento' },
  { patron: 'edad',               label: 'Edad' },
  { patron: 'fecha de nacimiento', label: 'Fecha de Nacimiento' },
]

// ── Generador de reporte Excel de fallos ───────────────────────────────────────

async function generarReporteFallos(fallidos, sinUbicacion, colsDetectadas, dirReporte, nombreBase) {
  const wb = new ExcelJS.Workbook()

  // ── Hoja 1: Registros NO insertados ─────────────────────────────────────────
  if (fallidos.length > 0) {
    const ws = wb.addWorksheet('No Insertados')

    const headerRow = ws.addRow([
      'N° Fila (Excel)',
      'Motivo del fallo',
      'Nombre Completo',
      'CUI',
      'Departamento (archivo)',
      'Municipio (archivo)',
      ...colsDetectadas,
    ])
    headerRow.eachCell(cell => {
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10233F' } }
      cell.font  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    })
    ws.getRow(1).height = 30

    for (const f of fallidos) {
      const vals = [
        f.filaNum,
        f.motivo,
        f.nombre ?? '',
        f.cui    ?? '',
        f.depto  ?? '',
        f.municipio ?? '',
        ...colsDetectadas.map(col => {
          const v = f.rawRow[col]
          if (v instanceof Date) return v.toISOString().split('T')[0]
          return v ?? ''
        }),
      ]
      const dataRow = ws.addRow(vals)
      // Colorear motivo según tipo
      const motivoCell = dataRow.getCell(2)
      if (f.tipo === 'duplicado') {
        motivoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } }
      } else if (f.tipo === 'error_bd') {
        motivoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }
      } else {
        motivoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E3E5' } }
      }
    }

    // Anchos de columna
    ws.getColumn(1).width = 14
    ws.getColumn(2).width = 45
    ws.getColumn(3).width = 35
    ws.getColumn(4).width = 18
    ws.getColumn(5).width = 22
    ws.getColumn(6).width = 22
    for (let c = 7; c <= 6 + colsDetectadas.length; c++) ws.getColumn(c).width = 18

    ws.autoFilter = { from: 'A1', to: { row: 1, column: 6 + colsDetectadas.length } }
  }

  // ── Hoja 2: Insertados pero sin ubicación resuelta ──────────────────────────
  if (sinUbicacion.length > 0) {
    const ws2 = wb.addWorksheet('Sin Ubicación')

    const h2 = ws2.addRow([
      'N° Fila (Excel)',
      'Problema de ubicación',
      'Nombre Completo',
      'CUI',
      'Departamento (archivo)',
      'Municipio (archivo)',
      'Fue insertado',
    ])
    h2.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    for (const u of sinUbicacion) {
      ws2.addRow([
        u.filaNum,
        u.problema,
        u.nombre ?? '',
        u.cui    ?? '',
        u.depto  ?? '',
        u.municipio ?? '',
        'Sí (sin filtro de departamental)',
      ])
    }

    ws2.getColumn(1).width = 14
    ws2.getColumn(2).width = 48
    ws2.getColumn(3).width = 35
    ws2.getColumn(4).width = 18
    ws2.getColumn(5).width = 22
    ws2.getColumn(6).width = 22
    ws2.getColumn(7).width = 30
  }

  // ── Guardar ──────────────────────────────────────────────────────────────────
  const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const base = path.basename(nombreBase, path.extname(nombreBase))
  const outPath = path.join(dirReporte, `reporte_fallos_${base}_${ts}.xlsx`)
  await wb.xlsx.writeFile(outPath)
  return outPath
}

// ── Procesador principal ───────────────────────────────────────────────────────

/**
 * Procesa un archivo Excel con el formato de reporte SIRE/MSPAS y crea los registros
 * correspondientes (Nina, CasoEmbarazo, HistorialEducativo, CentroEducativo).
 *
 * @param {Buffer} buffer          - Contenido del archivo Excel
 * @param {object} opts
 * @param {string} opts.nombreArchivo  - Nombre del archivo (para logs y reporte)
 * @param {number|null} opts.usuarioId - ID del usuario que carga (puede ser null en seeders)
 * @param {string|null} opts.reporteDir - Directorio donde guardar el Excel de fallos.
 *                                        Si es null no se genera el archivo.
 */
export async function procesarExcelCasos(buffer, {
  nombreArchivo = 'archivo.xlsx',
  usuarioId     = null,
  reporteDir    = null,
} = {}) {
  // 1. Parsear Excel
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    return { ok: false, message: 'El archivo no contiene hojas' }
  }

  // 2. Pre-cargar sets de deduplicación
  const existingNinas   = await Nina.findAll({ attributes: ['cui', 'nombre_completo'] })
  const existingCuis    = new Set(existingNinas.map(n => String(n.cui ?? '').trim()).filter(Boolean))
  const existingNombres = new Set(existingNinas.map(n => normalizar(String(n.nombre_completo ?? ''))).filter(Boolean))

  const existingCentros = await CentroEducativo.findAll({ attributes: ['id', 'codigo_udi'] })
  const centroPorUdi    = new Map(existingCentros.map(c => [normalizar(c.codigo_udi), c.id]))

  const maxCasoId  = Number((await CasoEmbarazo.max('id')) || 0)
  const yearSuffix = String(new Date().getFullYear()).slice(-3)
  const existingNumerosCaso = new Set(
    (await CasoEmbarazo.findAll({ attributes: ['numero_caso'] })).map(c => String(c.numero_caso ?? '').trim())
  )

  // 3. Detectar fila de cabeceras.
  //    El formato SIRE siempre tiene: filas 1-4 = título y grupos, fila 5 = headers, fila 6+ = datos.
  //    Valor por defecto: 5. Solo se sobrescribe si se detecta una fila >= 5 con ambas claves.
  let headerRowNum = 5
  for (let r = 5; r <= 10; r++) {
    let tieneNombre = false
    let tieneCui    = false
    worksheet.getRow(r).eachCell({ includeEmpty: false }, (cell) => {
      const v = normalizar(String(getCellValue(cell) ?? ''))
      if (v.includes('nombre completo')) tieneNombre = true
      if (v.includes('cui'))             tieneCui    = true
    })
    if (tieneNombre && tieneCui) { headerRowNum = r; break }
  }

  // Mapear número de columna → nombre normalizado (duplicados sufijados: "x", "x (2)", ...)
  const headersByCol = {}
  const headerCounts = {}
  worksheet.getRow(headerRowNum).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const base = normalizar(String(getCellValue(cell) ?? ''))
    if (!base) return
    headerCounts[base] = (headerCounts[base] || 0) + 1
    headersByCol[colNumber] = headerCounts[base] > 1 ? `${base} (${headerCounts[base]})` : base
  })

  const colsDetectadas = Object.values(headersByCol)
  console.log(`\n━━━ CARGA MASIVA: ${nombreArchivo} ━━━`)
  console.log(`   Fila de cabecera: ${headerRowNum} | Columnas: ${colsDetectadas.length}`)

  const faltanObligatorias = COLS_OBLIGATORIAS
    .filter(c => !colsDetectadas.some(h => h.includes(c.patron))).map(c => c.label)

  if (faltanObligatorias.length > 0) {
    return {
      ok: false,
      message: `El archivo no contiene las columnas obligatorias (${faltanObligatorias.join(', ')}).`,
    }
  }

  const faltanImportantes = COLS_IMPORTANTES
    .filter(c => !colsDetectadas.some(h => h.includes(c.patron))).map(c => c.label)
  if (faltanImportantes.length > 0)
    console.warn(`   Columnas importantes ausentes: ${faltanImportantes.join(', ')}`)

  // 4. Extraer todas las filas de datos
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
    console.log('\n   Primera fila (muestra de campos clave):')
    const camposClave = ['nombre completo', 'cui', 'direccion departamental de educacion',
                         'municipio de residencia', 'nivel', 'grado', 'no. de caso', 'no. de queja']
    for (const k of camposClave) {
      if (rawRows[0][k] !== undefined)
        console.log(`     ${k.padEnd(40)} →  ${String(rawRows[0][k] ?? '(vacío)').slice(0, 50)}`)
    }
  }

  const totalFilas = rawRows.length
  let nuevos     = 0
  let duplicados = 0

  // Arrays para el reporte de fallos
  const fallidos     = []  // registros que NO se insertaron
  const sinUbicacion = []  // registros insertados pero sin departamental/municipio

  // 5. Crear registro de carga
  const carga = await CargaArchivo.create({
    nombre_archivo:       nombreArchivo,
    total_registros:      totalFilas,
    registros_nuevos:     0,
    registros_duplicados: 0,
    fecha_carga:          new Date(),
    usuario_id:           usuarioId,
  })

  console.log(`\n   Procesando ${totalFilas} filas (carga_id=${carga.id})...\n`)

  // 6. Loop principal
  for (let i = 0; i < rawRows.length; i++) {
    const row     = rawRows[i]
    const filaNum = headerRowNum + 1 + i

    const get = (col) => row[normalizar(col)] ?? null
    const pick = (...patrones) => {
      for (const p of patrones) {
        const pn = normalizar(p)
        for (const [k, v] of Object.entries(row)) {
          if (k.includes(pn)) { const c = clean(v); if (c !== null) return v }
        }
      }
      return null
    }

    const cuiRaw         = clean(get('CUI RENAP')) || clean(get('cui')) || null
    const nombreCompleto = toTitleCase(clean(get('Nombre completo')))

    // Datos para el reporte (se capturan antes de cualquier skip)
    const deptoArchivo    = clean(pick('Dirección Departamental', 'Departamento'))
    const municipioArchivo = clean(pick('Municipio de Residencia', 'Municipio'))

    const registroBase = {
      filaNum,
      nombre:     nombreCompleto,
      cui:        cuiRaw,
      depto:      deptoArchivo,
      municipio:  municipioArchivo,
      rawRow:     row,
    }

    // ── Validaciones de omisión ─────────────────────────────────────────────
    if (!nombreCompleto) {
      duplicados++
      fallidos.push({ ...registroBase, tipo: 'sin_nombre', motivo: 'Fila sin nombre completo' })
      console.warn(`  [OMITIDA fila ${filaNum}] Sin nombre completo`)
      continue
    }

    if (cuiRaw && existingCuis.has(cuiRaw)) {
      duplicados++
      fallidos.push({ ...registroBase, tipo: 'duplicado', motivo: `Duplicado: CUI ${cuiRaw} ya existe en la BD` })
      console.warn(`  [OMITIDA fila ${filaNum}] Duplicado por CUI "${cuiRaw}"`)
      continue
    }

    if (!cuiRaw && existingNombres.has(normalizar(nombreCompleto))) {
      duplicados++
      fallidos.push({ ...registroBase, tipo: 'duplicado', motivo: `Duplicado: nombre "${nombreCompleto}" ya existe en la BD` })
      console.warn(`  [OMITIDA fila ${filaNum}] Duplicado por nombre "${nombreCompleto}"`)
      continue
    }

    // ── Resolución de ubicación (niña) ──────────────────────────────────────
    const cuiFinal    = cuiRaw ?? null
    const fechaNacStr = parseDate(pick('Fecha de Nacimiento', 'Fecha Nacimiento'))

    const { departamental_id, departamento_id, municipio_id } =
      await validarUbicacion(deptoArchivo, municipioArchivo)

    const problemasUbicacion = []
    if (!departamental_id) problemasUbicacion.push(`Departamento "${deptoArchivo}" no resolvió en la BD`)
    if (!municipio_id)     problemasUbicacion.push(`Municipio "${municipioArchivo}" no resolvió en la BD`)

    // ── Datos educativos ────────────────────────────────────────────────────
    const pueblo               = toTitleCase(clean(pick('Pueblo de pertenencia', 'Pueblo'))) || null
    const comunidad_linguistica = toTitleCase(clean(pick('Comunidad Linguistica', 'Comunidad Lingüística', 'Comunidad'))) || null
    const codigoPersonal       = clean(pick('Código personal', 'Codigo personal'))
    const statusActual         = clean(pick('Status actual', 'Estatus actual'))
    const grado                = clean(pick('Grado'))
    const resultado            = clean(pick('Resultado'))
    const anioRaw              = get('ano (2)') ?? pick('Ano Educativo')
    const anio                 = anioRaw ? parseInt(String(anioRaw), 10) || null : null
    const nivelEducativo       = mapEscolaridad(pick('Nivel') ?? get('Escolaridad') ?? get('escolaridad'))
    const codigoUdi            = clean(pick('Código UDI', 'Codigo UDI'))
    const centroNombre         = clean(pick('Nombre del Centro'))
    const centroDireccion      = clean(pick('Dirección (2)', 'Direccion (2)'))
    const sector               = clean(pick('Sector'))
    const jornada              = clean(pick('Jornada'))
    const area                 = clean(pick('Área', 'Area'))

    // Resolución de ubicación del centro educativo
    const centroDeptoNombre      = clean(get('departamento'))
    const centroMunicipioNombre  = clean(pick('Zona o Municipio'))
    const { municipio_id: centroMunicipioId } =
      await validarUbicacion(centroDeptoNombre, centroMunicipioNombre)
    if (codigoUdi && !centroMunicipioId)
      problemasUbicacion.push(`Municipio del centro "${centroDeptoNombre}/${centroMunicipioNombre}" no resolvió`)

    const numeroCasoArchivo = clean(get('no. de caso'))
    const queja             = clean(pick('No. de Queja', 'Numero de queja'))

    // ── Inserción en BD ─────────────────────────────────────────────────────
    const t = await sequelize.transaction()
    try {
      const edadRaw   = get('edad') ?? pick('Edad')
      const edad      = edadRaw ? parseInt(String(edadRaw), 10) || null : null
      const direccion = toTitleCase(clean(get('direccion')))

      const nina = await Nina.create({
        cui:                    cuiFinal,
        nombre_completo:        nombreCompleto,
        fecha_nacimiento:       fechaNacStr,
        edad,
        direccion,
        municipio_id,
        departamento_id,
        pueblo,
        comunidad_linguistica,
      }, { transaction: t })

      // Centro educativo
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
            sector, jornada, area,
          }, { transaction: t })
          centroEducativoId = centro.id
          centroPorUdi.set(udiNorm, centro.id)
        }
      }

      // Fecha de ingreso: construir desde Día/Mes/Año separados (cols 2/3/4 del SIRE)
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
        // Los casos que traen "No. de Queja" en el archivo se marcan dentro del
        // Sistema de Quejas; el resto se dan por verificados en el SIRE.
        estado:          queja
          ? 'Verificados en el Sistema de Quejas, Comentarios o Sugerencias'
          : 'Verificados en el SIRE',
        departamental_id,
      }, { transaction: t })

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

      // Registrar advertencias de ubicación para la hoja "Sin Ubicación"
      if (problemasUbicacion.length > 0) {
        sinUbicacion.push({
          filaNum,
          nombre:    nombreCompleto,
          cui:       cuiFinal,
          depto:     deptoArchivo,
          municipio: municipioArchivo,
          problema:  problemasUbicacion.join(' | '),
        })
        console.warn(`  [SIN UBI fila ${filaNum}] "${nombreCompleto}" insertado pero: ${problemasUbicacion.join(' | ')}`)
      } else {
        console.log(`  [OK   fila ${filaNum}] Caso ${numeroCaso} — "${nombreCompleto}" (${cuiFinal ?? 'sin CUI'}) nivel="${nivelEducativo ?? '-'}" depto_id=${departamental_id ?? 'null'}`)
      }

    } catch (err) {
      await t.rollback()
      duplicados++
      const esUnica = err.name === 'SequelizeUniqueConstraintError'
      const motivo  = esUnica
        ? `Restricción única en BD: CUI o nombre ya registrado (${err.fields?.join(', ') ?? ''})`
        : `Error de BD: ${err.message}`
      fallidos.push({ ...registroBase, tipo: 'error_bd', motivo })
      if (esUnica) {
        console.warn(`  [OMITIDA fila ${filaNum}] Restricción única — "${nombreCompleto}" (${cuiFinal})`)
      } else {
        console.error(`  [ERROR   fila ${filaNum}] ${err.message}`)
      }
    }
  }

  // 7. Resumen en consola
  console.log(`\n   ── Resultado ──`)
  console.log(`   Total filas    : ${totalFilas}`)
  console.log(`   Insertados     : ${nuevos}`)
  console.log(`   No insertados  : ${duplicados}  (${fallidos.length} con detalle de fallo)`)
  console.log(`   Sin ubicación  : ${sinUbicacion.length} (insertados pero con dept/mun no resuelto)`)

  if (fallidos.length > 0) {
    console.warn(`\n   ── No insertados (${fallidos.length}) ──`)
    fallidos.forEach(f => console.warn(`     [fila ${f.filaNum}] ${f.motivo}`))
  }
  if (sinUbicacion.length > 0) {
    console.warn(`\n   ── Sin ubicación (${sinUbicacion.length}) ──`)
    sinUbicacion.forEach(u => console.warn(`     [fila ${u.filaNum}] "${u.nombre}" | ${u.problema}`))
  }

  // 8. Generar Excel de reporte si se indicó un directorio
  let reportePath = null
  if (reporteDir && (fallidos.length > 0 || sinUbicacion.length > 0)) {
    try {
      reportePath = await generarReporteFallos(fallidos, sinUbicacion, colsDetectadas, reporteDir, nombreArchivo)
      console.log(`\n   ✔ Reporte de fallos generado: ${reportePath}`)
    } catch (e) {
      console.error(`   ✘ No se pudo generar el reporte: ${e.message}`)
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await carga.update({ registros_nuevos: nuevos, registros_duplicados: duplicados })

  return {
    ok:       true,
    message:  'Carga masiva completada',
    carga_id: carga.id,
    total:    totalFilas,
    nuevos,
    duplicados,
    reportePath,
    fallidos: fallidos.map(f => ({ fila: f.filaNum, motivo: f.motivo, nombre: f.nombre, cui: f.cui })),
    sinUbicacion: sinUbicacion.map(u => ({ fila: u.filaNum, nombre: u.nombre, problema: u.problema })),
    advertencias: faltanImportantes.length > 0
      ? [`El archivo no incluye: ${faltanImportantes.join(', ')}`] : [],
    _debug: { fila_cabecera: headerRowNum, columnas_detectadas: colsDetectadas },
  }
}
