import ExcelJS from 'exceljs'
import CargaArchivo from '../models/CargaArchivo.js'
import User from '../models/User.js'
import { registrarAuditoria } from '../utils/auditoria.js'
import { procesarExcelCasos } from '../utils/cargaExcel.js'

// ── Carga Masiva (usa el mismo procesador que los seeders de datos) ────────────

export const CargaMasiva = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No se envió ningún archivo' })
  }

  try {
    const resultado = await procesarExcelCasos(req.file.buffer, {
      nombreArchivo: req.file.originalname,
      usuarioId:     req.user?.id ?? null,
    })

    if (!resultado.ok) {
      return res.status(400).json(resultado)
    }

    registrarAuditoria({
      usuario_id:  req.user?.id,
      accion:      'carga_masiva',
      entidad:     'CargaArchivo',
      entidad_id:  resultado.carga_id,
      descripcion: `Realizó una carga masiva del archivo "${req.file.originalname}" (${resultado.nuevos} nuevos, ${resultado.duplicados} duplicados de ${resultado.total} filas)`,
    })

    return res.status(200).json(resultado)

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
