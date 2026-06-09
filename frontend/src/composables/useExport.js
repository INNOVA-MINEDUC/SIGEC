import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Columnas para Excel (todas) ──────────────────────────────────────────────
const COLS_EXCEL = [
  'No. Caso', 'CUI', 'Nombre Completo', 'Estado', 'Fecha Ingreso',
  'Queja', 'Institución', 'No. Notificación',
  'Departamento', 'Municipio', 'Pueblo', 'Comunidad Lingüística',
  'Edad', 'Dirección',
  'Grado', 'Nivel', 'Status Sistema', 'Resultado',
  'Centro Educativo', 'Código UDI', 'Código Personal',
  'Área', 'Jornada', 'Sector',
]

// ── Convierte un caso a fila de datos ────────────────────────────────────────
function casoAFila(caso) {
  const nina   = caso.nina || {}
  const hist   = (nina.historialEducativo || [])[0] || {}
  const centro = hist.centroEducativo || {}
  const dept   = nina.municipio?.departamento?.nombre
              || caso.departamental?.departamento?.nombre || ''
  const mun    = nina.municipio?.nombre || ''
  return [
    caso.numero_caso       || '',
    nina.cui               || '',
    nina.nombre_completo   || '',
    caso.estado            || '',
    caso.fecha_ingreso     || '',
    caso.queja             || '',
    caso.institucion       || '',
    caso.no_notificacion   || '',
    dept,
    mun,
    nina.pueblo?.nombre                  || '',
    nina.comunidadLinguistica?.nombre    || '',
    nina.edad              || '',
    nina.direccion         || '',
    hist.grado             || '',
    hist.nivel             || '',
    hist.status_actual     || '',
    hist.resultado         || '',
    centro.nombre          || '',
    centro.codigo_udi      || '',
    hist.codigo_personal   || '',
    centro.area            || '',
    centro.jornada         || '',
    centro.sector          || '',
  ]
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORTAR EXCEL
// ────────────────────────────────────────────────────────────────────────────
export function exportarExcel(casos, nombre = 'SIGEC_Casos') {
  const filas = casos.map(casoAFila)
  const ws = XLSX.utils.aoa_to_sheet([COLS_EXCEL, ...filas])

  // Encabezado con estilo (negrita + fondo rosa)
  const headerRange = XLSX.utils.decode_range(ws['!ref'])
  for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })]
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'FF9797' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      }
    }
  }

  // Ancho de columnas automático
  ws['!cols'] = COLS_EXCEL.map((h, i) => {
    const maxLen = Math.max(h.length, ...filas.map(r => String(r[i] ?? '').length))
    return { wch: Math.min(maxLen + 2, 40) }
  })

  ws['!rows'] = [{ hpt: 28 }] // altura fila encabezado

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Casos')

  // Hoja de resumen
  const totalCasos = casos.length
  const porEstado = {
    pendiente:  casos.filter(c => c.estado === 'pendiente').length,
    faltante:   casos.filter(c => c.estado === 'faltante').length,
    completado: casos.filter(c => c.estado === 'completado').length,
  }
  const resumenRows = [
    ['Reporte SIGEC — MINEDUC Guatemala'],
    [`Generado: ${new Date().toLocaleDateString('es-GT', { dateStyle: 'full' })}`],
    [],
    ['RESUMEN DE CASOS'],
    ['Total de casos',  totalCasos],
    ['Pendientes',      porEstado.pendiente],
    ['Faltantes',       porEstado.faltante],
    ['Completados',     porEstado.completado],
  ]
  const wsRes = XLSX.utils.aoa_to_sheet(resumenRows)
  wsRes['!cols'] = [{ wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen')

  const hoy = new Date().toLocaleDateString('es-GT').replace(/\//g, '-')
  XLSX.writeFile(wb, `${nombre}_${hoy}.xlsx`)
}

// ────────────────────────────────────────────────────────────────────────────
// HELPERS DE DIBUJO PARA jsPDF
// ────────────────────────────────────────────────────────────────────────────

// Barra horizontal de progreso
function drawHBar(doc, x, y, barMaxW, barH, fillW, fillColor, bgColor = [240, 240, 240]) {
  doc.setFillColor(...bgColor)
  doc.roundedRect(x, y, barMaxW, barH, 1, 1, 'F')
  if (fillW > 0) {
    doc.setFillColor(...fillColor)
    doc.roundedRect(x, y, fillW, barH, 1, 1, 'F')
  }
}

// Caja de estadística coloreada
function drawStatBox(doc, x, y, w, h, value, label, color) {
  doc.setFillColor(...color)
  doc.roundedRect(x, y, w, h, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(String(value), x + w / 2, y + h * 0.55, { align: 'center' })
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(label, x + w / 2, y + h * 0.82, { align: 'center' })
}

// Barras verticales (gráfica de columnas)
function drawVBars(doc, x, y, w, h, data, color, labelFontSize = 5.5) {
  if (!data.length) return
  const max = Math.max(...data.map(d => d.v), 1)
  const barW = (w - (data.length - 1) * 1.5) / data.length

  data.forEach((d, i) => {
    const bx = x + i * (barW + 1.5)
    const bh = (d.v / max) * (h - 10)
    // barra
    doc.setFillColor(...color)
    if (bh > 0) doc.roundedRect(bx, y + h - bh - 8, barW, bh, 0.5, 0.5, 'F')
    // valor encima
    if (d.v > 0) {
      doc.setFontSize(5)
      doc.setTextColor(80)
      doc.text(String(d.v), bx + barW / 2, y + h - bh - 9.5, { align: 'center' })
    }
    // etiqueta abajo
    doc.setFontSize(labelFontSize)
    doc.setTextColor(120)
    doc.text(d.l, bx + barW / 2, y + h, { align: 'center' })
  })
}

// Gráfica de dona — cada sector dibujado con doc.lines (arco aproximado por segmentos)
function drawDonut(doc, cx, cy, r, segments) {
  let angle = -Math.PI / 2
  const total = segments.reduce((s, d) => s + d.v, 0)
  if (total === 0) {
    doc.setFillColor(220, 220, 220)
    doc.circle(cx, cy, r, 'F')
    return
  }

  segments.forEach(seg => {
    const sweep = (seg.v / total) * 2 * Math.PI
    if (sweep < 0.001) { angle += sweep; return }

    const steps = Math.max(6, Math.ceil((sweep / (Math.PI * 2)) * 48))
    doc.setFillColor(...seg.c)

    // Primer segmento: centro → primer punto del arco (relativo al origen cx,cy)
    const lineSegs = [[r * Math.cos(angle), r * Math.sin(angle)]]
    for (let s = 1; s <= steps; s++) {
      const prevA = angle + (sweep * (s - 1)) / steps
      const curA  = angle + (sweep * s) / steps
      lineSegs.push([
        r * Math.cos(curA) - r * Math.cos(prevA),
        r * Math.sin(curA) - r * Math.sin(prevA),
      ])
    }
    // closed:true cierra la figura de vuelta a (cx, cy)
    doc.lines(lineSegs, cx, cy, [1, 1], 'F', true)
    angle += sweep
  })

  // Agujero central blanco para efecto dona
  doc.setFillColor(255, 255, 255)
  doc.circle(cx, cy, r * 0.55, 'F')
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORTAR PDF (con gráficas)
// ────────────────────────────────────────────────────────────────────────────
export function exportarPDF(casos, nombre = 'SIGEC_Casos', resumenFiltros = '') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210
  const PAD = 12
  const hoy = new Date().toLocaleDateString('es-GT', { dateStyle: 'full' })
  const hoyCorto = new Date().toLocaleDateString('es-GT').replace(/\//g, '-')

  // ── Métricas ──────────────────────────────────────────────────────────────
  const total      = casos.length
  const pendientes = casos.filter(c => c.estado === 'pendiente').length
  const faltantes  = casos.filter(c => c.estado === 'faltante').length
  const completados = casos.filter(c => c.estado === 'completado').length

  // Mensual
  const MESES_S = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const porMes = MESES_S.map((l, i) => ({
    l,
    v: casos.filter(c => c.fecha_ingreso && new Date(c.fecha_ingreso).getMonth() === i).length
  }))

  // Edad
  const edadRangos = [
    { l: '≤12',  min: 0,  max: 12 },
    { l: '13a',  min: 13, max: 13 },
    { l: '14a',  min: 14, max: 14 },
    { l: '15a',  min: 15, max: 15 },
    { l: '≥16',  min: 16, max: 99 },
  ].map(r => ({
    ...r,
    v: casos.filter(c => { const e = Number(c.nina?.edad); return e >= r.min && e <= r.max }).length
  }))

  // Departamentos top-8
  const deptCount = {}
  casos.forEach(c => {
    const d = c.nina?.municipio?.departamento?.nombre
            || c.departamental?.departamento?.nombre || 'N/A'
    deptCount[d] = (deptCount[d] || 0) + 1
  })
  const topDept = Object.entries(deptCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([l, v]) => ({ l: l.length > 14 ? l.slice(0, 12) + '…' : l, v }))

  // Estado donut segments
  const estadoSegs = [
    { l: 'Completados', v: completados, c: [100, 200, 120] },
    { l: 'Pendientes',  v: pendientes,  c: [255, 151, 151] },
    { l: 'Faltantes',   v: faltantes,   c: [255, 200, 100] },
  ]

  // ── PÁGINA 1: DASHBOARD DE GRÁFICAS ──────────────────────────────────────
  // Header
  doc.setFillColor(255, 151, 151)
  doc.rect(0, 0, W, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('SIGEC — Registro de Embarazos en Niñas en Edad Escolar', PAD, 10)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Ministerio de Educación de Guatemala', PAD, 15)
  doc.text(hoy, W - PAD, 15, { align: 'right' })

  let curY = 22
  if (resumenFiltros) {
    doc.setFillColor(255, 240, 240)
    doc.roundedRect(PAD, curY, W - PAD * 2, 7, 1, 1, 'F')
    doc.setFontSize(6.5)
    doc.setTextColor(180, 60, 60)
    doc.text(`Filtros aplicados: ${resumenFiltros}`, PAD + 2, curY + 4.5)
    curY += 10
  }

  // ── Stat boxes ─────────────────────────────────────────────────────────────
  const boxes = [
    { label: 'Total',       value: total,       color: [255, 151, 151] },
    { label: 'Pendientes',  value: pendientes,   color: [255, 180, 100] },
    { label: 'Faltantes',   value: faltantes,    color: [255, 200, 80]  },
    { label: 'Completados', value: completados,  color: [100, 195, 130] },
  ]
  const boxW = 62, boxH = 20, boxGap = 3
  const totalBoxW = boxes.length * boxW + (boxes.length - 1) * boxGap
  const bx0 = (W - totalBoxW) / 2
  boxes.forEach((b, i) => drawStatBox(doc, bx0 + i * (boxW + boxGap), curY, boxW, boxH, b.value, b.label, b.color))
  curY += boxH + 8

  // ── ZONA PRINCIPAL: 3 columnas ────────────────────────────────────────────
  const COL1_X = PAD
  const COL1_W = 75
  const COL2_X = PAD + COL1_W + 6
  const COL2_W = 100
  const COL3_X = PAD + COL1_W + COL2_W + 12
  const COL3_W = W - COL3_X - PAD

  // ── Columna 1: Dona de estado + leyenda ────────────────────────────────────
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text('Distribución por Estado', COL1_X, curY)

  const donaR = 18
  const donaCX = COL1_X + COL1_W / 2
  const donaCY = curY + 8 + donaR
  drawDonut(doc, donaCX, donaCY, donaR, estadoSegs)

  // Total en el centro
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80)
  doc.text(String(total), donaCX, donaCY + 3.5, { align: 'center' })
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.text('total', donaCX, donaCY + 8, { align: 'center' })

  // Leyenda
  let ly = curY + 5
  estadoSegs.forEach(seg => {
    const pct = total > 0 ? ((seg.v / total) * 100).toFixed(1) : '0.0'
    doc.setFillColor(...seg.c)
    doc.roundedRect(COL1_X, ly, 4, 4, 0.5, 0.5, 'F')
    doc.setFontSize(6.5)
    doc.setTextColor(60)
    doc.setFont('helvetica', 'normal')
    doc.text(`${seg.l}: ${seg.v} (${pct}%)`, COL1_X + 6, ly + 3.2)
    ly += 7
  })

  // ── Columna 2: Mensual (barras verticales) ─────────────────────────────────
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60)
  doc.text('Casos por Mes', COL2_X, curY)
  drawVBars(doc, COL2_X, curY + 4, COL2_W, 50, porMes, [255, 151, 151])

  // ── Columna 3: Edades (barras horizontales) ─────────────────────────────────
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60)
  doc.text('Por Edad', COL3_X, curY)

  const maxEdad = Math.max(...edadRangos.map(e => e.v), 1)
  edadRangos.forEach((item, i) => {
    const barMaxW = COL3_W - 30
    const fillW = Math.max((item.v / maxEdad) * barMaxW, item.v > 0 ? 2 : 0)
    const by = curY + 5 + i * 10

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text(item.l, COL3_X, by + 5.5)
    drawHBar(doc, COL3_X + 12, by, barMaxW, 7, fillW, [255, 200, 100])
    doc.setFontSize(6)
    doc.setTextColor(60)
    doc.text(String(item.v), COL3_X + 12 + barMaxW + 2, by + 5.5)
  })

  // ── Fila inferior: Top departamentos ──────────────────────────────────────
  const dY = curY + 58
  if (dY + 40 < H - 5) {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60)
    doc.text('Casos por Departamento (Top 8)', COL2_X, dY)

    const maxD = Math.max(...topDept.map(d => d.v), 1)
    const dBarMaxW = (COL2_W + COL3_W + 16) - 35
    topDept.forEach((item, i) => {
      const fillW = Math.max((item.v / maxD) * dBarMaxW, item.v > 0 ? 2 : 0)
      const by = dY + 4 + i * 7.5

      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60)
      doc.text(item.l, COL2_X, by + 5)
      drawHBar(doc, COL2_X + 30, by, dBarMaxW, 6, fillW, [173, 216, 230])
      doc.setFontSize(5.5)
      doc.setTextColor(60)
      doc.text(String(item.v), COL2_X + 30 + dBarMaxW + 2, by + 4.5)
    })
  }

  // Pie de página 1
  doc.setFontSize(6)
  doc.setTextColor(180)
  doc.text(`SIGEC — MINEDUC  ·  Generado ${hoy}  ·  Página 1`, W / 2, H - 5, { align: 'center' })

  // ── PÁGINA 2: TABLA DE DATOS ─────────────────────────────────────────────
  if (total > 0) {
    doc.addPage()

    doc.setFillColor(255, 151, 151)
    doc.rect(0, 0, W, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Listado de Casos', PAD, 10)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${total} registros`, W - PAD, 10, { align: 'right' })

    const colsPDF = ['No. Caso', 'Nombre', 'Estado', 'Fecha Ingreso', 'Depto.', 'Municipio', 'Edad', 'Grado', 'Nivel', 'Centro Educativo', 'Queja']
    const idxPDF  = [0, 2, 3, 4, 8, 9, 12, 14, 15, 18, 5]
    const body    = casos.map(c => { const f = casoAFila(c); return idxPDF.map(i => f[i]) })

    autoTable(doc, {
      head: [colsPDF],
      body,
      startY: 18,
      styles: { fontSize: 6.5, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [255, 151, 151], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [255, 248, 248] },
      margin: { left: PAD, right: PAD },
      columnStyles: {
        1: { cellWidth: 38 },
        4: { cellWidth: 22 },
        5: { cellWidth: 20 },
        9: { cellWidth: 32 },
      },
      didDrawPage: ({ pageNumber }) => {
        doc.setFontSize(6)
        doc.setTextColor(180)
        doc.text(
          `SIGEC — MINEDUC  ·  Página ${pageNumber}  ·  ${hoy}`,
          W / 2, H - 5, { align: 'center' }
        )
      }
    })
  }

  doc.save(`${nombre}_${hoyCorto}.pdf`)
}
