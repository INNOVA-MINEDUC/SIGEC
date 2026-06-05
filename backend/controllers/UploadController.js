import ExcelJS from 'exceljs'

export const uploadExcel = async (req, res) => {

  try {

    // VALIDAR SI SE ENVIÓ ARCHIVO
    if (!req.file) {

      return res.status(400).json({
        ok: false,
        message: 'No se envió ningún archivo'
      })
    }

    // MOSTRAR INFORMACIÓN DEL ARCHIVO
    console.log('\n========== ARCHIVO RECIBIDO ==========')

    console.log({
      nombre: req.file.originalname,
      tipo: req.file.mimetype,
      tamaño: `${req.file.size} bytes`
    })

    console.log('======================================\n')

    // CREAR WORKBOOK
    const workbook = new ExcelJS.Workbook()

    // CARGAR EXCEL
    await workbook.xlsx.load(req.file.buffer)

    // OBTENER PRIMERA HOJA
    const worksheet = workbook.worksheets[0]

    // VALIDAR HOJA
    if (!worksheet) {

      return res.status(400).json({
        ok: false,
        message: 'El archivo no contiene hojas'
      })
    }

    // MOSTRAR NOMBRE DE LA HOJA
    console.log('\n========== HOJA ==========')

    console.log(`Nombre hoja: ${worksheet.name}`)

    console.log('==========================\n')

    // MOSTRAR HEADERS RAW
    console.log('\n========== HEADERS RAW ==========')

    console.log(worksheet.getRow(1).values)

    console.log('=================================\n')

    // OBTENER HEADERS
    const headers = []

    worksheet.getRow(1).eachCell((cell, colNumber) => {

      headers.push(cell.value)

    })

    // MOSTRAR COLUMNAS
    console.log('\n========== COLUMNAS ==========')

    headers.forEach((header, index) => {

      console.log(`Columna ${index + 1}: ${header}`)

    })

    console.log('==============================\n')

    // LEER FILAS
    const rows = []

    worksheet.eachRow((row, rowNumber) => {

      // SALTAR HEADERS
      if (rowNumber === 1) return

      const rowData = {}

      row.eachCell((cell, colNumber) => {

        const header = headers[colNumber - 1]

        rowData[header] = cell.value

      })

      rows.push(rowData)

    })

    // MOSTRAR DATOS
    console.log('\n========== DATOS ==========')

    console.table(rows)

    console.log('===========================\n')

    // RESUMEN
    console.log('\n========== RESUMEN ==========')

    console.log({
      archivo: req.file.originalname,
      hojas: workbook.worksheets.length,
      totalColumnas: headers.length,
      totalFilas: rows.length
    })

    console.log('=============================\n')

    // RESPUESTA
    return res.status(200).json({

      ok: true,

      message: 'Excel procesado correctamente',

      fileName: req.file.originalname,

      sheetName: worksheet.name,

      totalRows: rows.length,

      totalColumns: headers.length,

      columns: headers,

      data: rows

    })

  } catch (error) {

    console.error('\n========== ERROR PROCESANDO EXCEL ==========\n')

    console.error(error)

    console.log('\n============================================\n')

    return res.status(500).json({
      ok: false,
      message: 'Error procesando el archivo Excel',
      error: error.message
    })
  }
}