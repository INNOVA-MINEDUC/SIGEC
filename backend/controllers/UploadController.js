import ExcelJS from 'exceljs'
import { sequelize } from '../config/database.js'
import CasoEmbarazo from '../models/CasoEmbarazo.js'
import Nina from '../models/Nina.js'
import HistorialEducativo from '../models/HistorialEducativo.js'
import CargaArchivo from '../models/CargaArchivo.js'
import User from '../models/User.js'
import { registrarAuditoria } from '../utils/auditoria.js'
import { validarUbicacion } from '../helpers/validarUbicacion.js'
import { normalizarNivel } from '../helpers/nivelEducativo.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()


// Convierte texto a Title Case: "MARIA JOSE GARCIA" → "Maria Jose Garcia"
const toTitleCase = (str) => {
  if (!str) return str
  return String(str).toLowerCase().replace(/(?:^|[\s\-\/])\S/g, c => c.toUpperCase())
}

// Valores que equivalen a "sin dato" en los archivos MSPAS
const VACIOS = new Set(['no indica', 'sin dato', 'n/a', 'n.a.', 'nd', 'ninguno', '-', '--', 's/d', 'no aplica'])

const clean = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).trim()
  if (str === '') return null
  if (VACIOS.has(normalizar(str))) return null
  return str
}

// ExcelJS puede devolver objetos para celdas con fórmulas o rich-text
const getCellValue = (cell) => {
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

const parseDate = (val) => {
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

// Mapea el valor de Escolaridad del archivo al vocabulario único del sistema
// (helpers/nivelEducativo.js), compartido con la carga masiva y el dashboard.
const mapEscolaridad = (raw) => normalizarNivel(raw)

// ── Carga Masiva ───────────────────────────────────────────────────────────────

export const CargaMasiva = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No se envió ningún archivo' })
  }

  try {
    // 1. Parsear Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(req.file.buffer)
    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return res.status(400).json({ ok: false, message: 'El archivo no contiene hojas' })
    }

    // 2. Identificadores existentes para deduplicación
    const existingNinas   = await Nina.findAll({ attributes: ['cui', 'nombre_completo'] })
    const existingCuis    = new Set(existingNinas.map(n => String(n.cui ?? '').trim()).filter(Boolean))
    const existingNombres = new Set(existingNinas.map(n => normalizar(String(n.nombre_completo ?? ''))).filter(Boolean))

    // 5. Max ID actual de casos para numerar
    const maxCasoId  = Number((await CasoEmbarazo.max('id')) || 0)
    const yearSuffix = String(new Date().getFullYear()).slice(-3)

    // 6. Detectar fila de cabeceras (algunos reportes MSPAS tienen título en fila 1)
    let headerRowNum = 1
    for (let r = 1; r <= 5; r++) {
      let found = false
      worksheet.getRow(r).eachCell((cell) => {
        const norm = normalizar(String(cell.value ?? ''))
        if (norm.includes('cui renap') || norm.includes('nombre completo')) found = true
      })
      if (found) { headerRowNum = r; break }
    }

    // Mapear número de columna → nombre normalizado
    const headersByCol = {}
    worksheet.getRow(headerRowNum).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const name = normalizar(String(getCellValue(cell) ?? ''))
      if (name) headersByCol[colNumber] = name
    })

    const colsDetectadas = Object.values(headersByCol)
    console.log(`\n━━━ CARGA MASIVA: ${req.file.originalname} ━━━`)
    console.log(`   Fila de cabecera detectada: ${headerRowNum}`)
    console.log(`   Columnas (${colsDetectadas.length}):`, colsDetectadas.join(' | '))

    // 6.1 Validar que el archivo tenga las columnas necesarias (evita cargas de archivos incorrectos)
    const COLS_OBLIGATORIAS = [
      { patron: 'nombre completo', label: 'Nombre completo' },
    ]
    const COLS_IMPORTANTES = [
      { patron: 'cui renap',             label: 'CUI RENAP' },
      { patron: 'departamento',          label: 'Departamento' },
      { patron: 'fecha primer contacto', label: 'Fecha Primer Contacto' },
      { patron: 'edad',                  label: 'Edad Años' },
      { patron: 'fecha nacimiento',      label: 'Fecha Nacimiento' },
    ]

    const faltanObligatorias = COLS_OBLIGATORIAS
      .filter(c => !colsDetectadas.some(h => h.includes(c.patron)))
      .map(c => c.label)

    if (faltanObligatorias.length > 0) {
      return res.status(400).json({
        ok: false,
        message: `El archivo no contiene las columnas obligatorias (${faltanObligatorias.join(', ')}). Verifique que está subiendo el archivo correcto del reporte MSPAS.`,
      })
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
      console.log('\n   Primera fila parseada (primeros 8 campos):')
      Object.entries(rawRows[0]).slice(0, 8).forEach(([k, v]) =>
        console.log(`     ${k.padEnd(30)} →  ${String(v ?? '(vacío)').slice(0, 60)}`)
      )
    }

    const totalFilas = rawRows.length
    let nuevos      = 0
    let duplicados  = 0
    const omitidos      = []   // TODAS las filas no insertadas, con el motivo exacto
    const sinUbicacion  = []   // filas SÍ insertadas pero sin departamento/municipio resuelto
    const erroresMuestra = []

    // 8. Crear registro de carga ANTES del loop
    const carga = await CargaArchivo.create({
      nombre_archivo:       req.file.originalname,
      total_registros:      totalFilas,
      registros_nuevos:     0,
      registros_duplicados: 0,
      fecha_carga:          new Date(),
      usuario_id:           req.user?.id ?? null,
    })

    console.log(`\n   Procesando ${totalFilas} filas de datos (carga_id=${carga.id})...\n`)

    // 9. Procesar fila a fila
    for (let i = 0; i < rawRows.length; i++) {
      const row    = rawRows[i]
      const filaNum = headerRowNum + 1 + i
      const get    = (col) => row[normalizar(col)] ?? null

      const cuiRaw         = clean(get('CUI RENAP')) || clean(get('cui')) || null
      const nombreCompleto = toTitleCase(clean(get('Nombre completo')))

      // Sin nombre: omitir
      if (!nombreCompleto) {
        duplicados++
        omitidos.push({ fila: filaNum, tipo: 'SIN_NOMBRE', motivo: 'Fila sin nombre completo', nombre: null, cui: cuiRaw })
        console.warn(`  [OMITIDA fila ${filaNum}] Sin nombre completo`)
        continue
      }

      // Deduplicar por CUI (si existe) o por nombre
      if (cuiRaw && existingCuis.has(cuiRaw)) {
        duplicados++
        omitidos.push({ fila: filaNum, tipo: 'DUPLICADO_CUI', motivo: `CUI "${cuiRaw}" ya existe en la BD`, nombre: nombreCompleto, cui: cuiRaw })
        console.warn(`  [OMITIDA fila ${filaNum}] Duplicado por CUI "${cuiRaw}"`)
        continue
      }
      if (!cuiRaw && existingNombres.has(normalizar(nombreCompleto))) {
        duplicados++
        omitidos.push({ fila: filaNum, tipo: 'DUPLICADO_NOMBRE', motivo: `Nombre "${nombreCompleto}" ya existe en la BD`, nombre: nombreCompleto, cui: cuiRaw })
        console.warn(`  [OMITIDA fila ${filaNum}] Duplicado por nombre "${nombreCompleto}"`)
        continue
      }

      // Si no viene CUI se guarda null; nunca se inventan números
      const cuiFinal    = cuiRaw ?? null
      const fechaNacStr = parseDate(get('Fecha Nacimiento'))

      // ── Resolución de departamental, departamento y municipio ───────────────
      const deptoNombre     = clean(get('Departamento'))
      const municipioNombre = clean(get('Municipio')) || clean(get('municipio'))
      const { departamental_id, departamento_id, municipio_id } =
        await validarUbicacion(deptoNombre, municipioNombre)

      // ── Pueblo y comunidad lingüística como texto ───────────────────────────
      const pueblo               = toTitleCase(clean(get('Pueblo')))               || null
      const comunidad_linguistica = toTitleCase(clean(get('Comunidad Linguistica')) ||
                                    clean(get('Comunidad Lingüística'))) || null

      // ── Escolaridad → nivel ─────────────────────────────────────────────────
      const nivelEducativo = mapEscolaridad(get('Escolaridad') ?? get('escolaridad'))

      const t = await sequelize.transaction()
      try {
        const edadRaw = get('Edad Años')
        const edad    = edadRaw ? parseInt(String(edadRaw), 10) || null : null
        const direccion = toTitleCase(clean(get('Dirección')))

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

        const fechaContacto  = parseDate(get('Fecha Primer Contacto'))
        const noNotificacion = clean(get('Numero de notificación'))
        const institucion    = clean(get('Institución'))
        const numeroCaso     = `${String(maxCasoId + nuevos + 1).padStart(5, '0')}-${yearSuffix}`

        await CasoEmbarazo.create({
          numero_caso:            numeroCaso,
          nina_id:                nina.id,
          carga_archivo_id:       carga.id,
          fecha_ingreso:          fechaContacto,
          fecha_primera_consulta: fechaContacto,
          forma_deteccion:        'MSPAS',
          no_notificacion:        noNotificacion,
          institucion,
          queja:                  null,
          estado:                 'sin Verificar en el SIRE',
          departamental_id,
        }, { transaction: t })

        // Crear historial educativo si hay nivel de escolaridad
        if (nivelEducativo) {
          await HistorialEducativo.create({
            nina_id:             nina.id,
            centro_educativo_id: null,
            nivel:               nivelEducativo,
          }, { transaction: t })
        }

        await t.commit()
        if (cuiFinal) existingCuis.add(cuiFinal)
        existingNombres.add(normalizar(nombreCompleto))
        nuevos++
        const tag = cuiFinal ?? 'sin CUI'
        console.log(`  [OK fila ${filaNum}] Caso ${numeroCaso} — "${nombreCompleto}" (${tag}) nivel="${nivelEducativo ?? '-'}" mun_id=${municipio_id ?? 'null'}`)

        if (!departamental_id || !municipio_id) {
          const problema = [
            !departamental_id ? `Departamento "${deptoNombre ?? '(vacío)'}" no resolvió en la BD` : null,
            !municipio_id     ? `Municipio "${municipioNombre ?? '(vacío)'}" no resolvió en la BD`   : null,
          ].filter(Boolean).join(' | ')
          sinUbicacion.push({ fila: filaNum, nombre: nombreCompleto, cui: cuiFinal, depto: deptoNombre, municipio: municipioNombre, problema })
          console.warn(`  [SIN UBICACIÓN fila ${filaNum}] "${nombreCompleto}" | ${problema}`)
        }

      } catch (err) {
        await t.rollback()
        duplicados++
        if (err.name === 'SequelizeUniqueConstraintError') {
          omitidos.push({ fila: filaNum, tipo: 'UNIQUE_CONSTRAINT', motivo: 'Restricción única en BD (CUI o nombre ya registrado)', nombre: nombreCompleto, cui: cuiFinal })
          console.warn(`  [OMITIDA fila ${filaNum}] Restricción única — "${nombreCompleto}" (${cuiFinal})`)
        } else {
          omitidos.push({ fila: filaNum, tipo: 'DB_ERROR', motivo: err.message, nombre: nombreCompleto, cui: cuiFinal })
          console.error(`  [ERROR fila ${filaNum}] ${err.message}`)
          if (erroresMuestra.length < 5) erroresMuestra.push(`[fila ${filaNum}] ${err.message}`)
        }
      }
    }

    console.log(`\n   ── Resultado ──`)
    console.log(`   Total filas:  ${totalFilas}`)
    console.log(`   Nuevos:       ${nuevos}`)
    console.log(`   Duplicados:   ${duplicados}`)

    if (omitidos.length) {
      console.log(`\n   Filas NO ingresadas (${omitidos.length}):`)
      console.table(omitidos.map(o => ({ fila: o.fila, tipo: o.tipo, nombre: o.nombre, cui: o.cui, motivo: o.motivo })))
    }
    if (sinUbicacion.length) {
      console.log(`\n   Filas ingresadas SIN ubicación resuelta (${sinUbicacion.length}):`)
      console.table(sinUbicacion.map(u => ({ fila: u.fila, nombre: u.nombre, cui: u.cui, depto: u.depto, municipio: u.municipio, problema: u.problema })))
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // 10. Actualizar conteos finales
    await carga.update({ registros_nuevos: nuevos, registros_duplicados: duplicados })

    registrarAuditoria({
      usuario_id:  req.user?.id,
      accion:      'carga_masiva',
      entidad:     'CargaArchivo',
      entidad_id:  carga.id,
      descripcion: `Realizó una carga masiva del archivo "${req.file.originalname}" (${nuevos} nuevos, ${duplicados} duplicados de ${totalFilas} filas)`,
    })

    return res.status(200).json({
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
        omitidos_muestra:    omitidos.slice(0, 20),
        sin_ubicacion_muestra: sinUbicacion.slice(0, 20),
        errores_muestra:     erroresMuestra,
      },
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      ok:      false,
      message: 'Error en la carga masiva',
      error:   error.message,
    })
  }
}

// ── Historial de cargas ────────────────────────────────────────────────────────

export const ObtenerHistorial = async (req, res) => {
  try {
    const historial = await CargaArchivo.findAll({
      order:  [['createdAt', 'DESC']],
      limit:  50,
      include: [{
        model:      User,
        as:         'usuario',
        attributes: ['id', 'name', 'email'],
        required:   false,
      }],
    })
    return res.json({ ok: true, data: historial })
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error obteniendo historial', error: error.message })
  }
}

// ── Parse only (sin guardar en BD) ────────────────────────────────────────────

export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No se envió ningún archivo' })
    }
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(req.file.buffer)
    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return res.status(400).json({ ok: false, message: 'El archivo no contiene hojas' })
    }
    const headers = []
    worksheet.getRow(1).eachCell((cell) => { headers.push(cell.value) })
    const rows = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const rowData = {}
      row.eachCell((cell, colNumber) => { rowData[headers[colNumber - 1]] = cell.value })
      rows.push(rowData)
    })
    return res.status(200).json({
      ok: true, fileName: req.file.originalname,
      sheetName: worksheet.name, totalRows: rows.length,
      totalColumns: headers.length, columns: headers, data: rows,
    })
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error procesando Excel', error: error.message })
  }
}
