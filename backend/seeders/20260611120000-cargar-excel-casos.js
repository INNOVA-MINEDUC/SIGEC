'use strict'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { procesarExcelCasos } from '../utils/cargaExcel.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ruta del archivo Excel a cargar. Puede sobreescribirse con la variable de entorno SEED_EXCEL_PATH.
const RUTA_EXCEL = process.env.SEED_EXCEL_PATH
  || path.resolve(__dirname, '../seed-data/initial_data2.xlsx')

export default {
  async up(_queryInterface, _Sequelize) {
    if (!fs.existsSync(RUTA_EXCEL)) {
      console.warn(`\n[seeder cargar-excel-casos] No se encontró el archivo "${RUTA_EXCEL}".`)
      console.warn('   Coloque el reporte MSPAS en esa ruta (o defina SEED_EXCEL_PATH) y vuelva a ejecutar el seeder.\n')
      return
    }

    const buffer    = fs.readFileSync(RUTA_EXCEL)
    const resultado = await procesarExcelCasos(buffer, { nombreArchivo: path.basename(RUTA_EXCEL) })

    if (!resultado.ok) {
      console.error(`\n[seeder cargar-excel-casos] ${resultado.message}\n`)
      return
    }

    console.log(`\n[seeder cargar-excel-casos] Carga completada: ${resultado.nuevos} nuevos, ${resultado.duplicados} duplicados/omitidos de ${resultado.total} filas.\n`)
  },

  async down(_queryInterface, _Sequelize) {
    // No se revierte: eliminar los registros cargados podría borrar datos legítimos
    // capturados o modificados después de la carga.
  },
}
