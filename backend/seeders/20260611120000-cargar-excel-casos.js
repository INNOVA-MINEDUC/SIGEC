'use strict'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { procesarExcelCasos } from '../utils/cargaExcel.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RUTA_EXCEL = process.env.SEED_EXCEL_PATH
  || path.resolve(__dirname, '../seed-data/initial_data2.xlsx')

// El reporte de fallos se guarda en la misma carpeta que el Excel fuente
const DIR_REPORTE = path.dirname(RUTA_EXCEL)

export default {
  async up(_queryInterface, _Sequelize) {
    if (!fs.existsSync(RUTA_EXCEL)) {
      console.warn(`\n[seeder] No se encontró el archivo "${RUTA_EXCEL}".`)
      console.warn('   Colóquelo ahí (o defina SEED_EXCEL_PATH) y vuelva a ejecutar.\n')
      return
    }

    const buffer    = fs.readFileSync(RUTA_EXCEL)
    const resultado = await procesarExcelCasos(buffer, {
      nombreArchivo: path.basename(RUTA_EXCEL),
      reporteDir:    DIR_REPORTE,   // activa la generación del Excel de fallos
    })

    if (!resultado.ok) {
      console.error(`\n[seeder] ${resultado.message}\n`)
      return
    }

    console.log(
      `\n[seeder] Carga completada: ${resultado.nuevos} insertados, ` +
      `${resultado.duplicados} omitidos de ${resultado.total} filas.`
    )

    if (resultado.reportePath) {
      console.log(`[seeder] Reporte de fallos → ${resultado.reportePath}`)
      console.log(`         Hoja "No Insertados"  : ${resultado.fallidos.length} registros`)
      console.log(`         Hoja "Sin Ubicación"  : ${resultado.sinUbicacion.length} registros`)
    } else if (resultado.fallidos.length === 0 && resultado.sinUbicacion.length === 0) {
      console.log('[seeder] Sin fallos ni advertencias de ubicación — carga perfecta.')
    }

    console.log()
  },

  async down(_queryInterface, _Sequelize) {
    // No se revierte la carga masiva
  },
}
