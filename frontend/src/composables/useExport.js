import * as XLSX from 'xlsx-js-style'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '@/helpers/api'
import sigecLogoUrl from '@/assets/LOGO_SISEC.png'
import mineducLogoUrl from '@/assets/logo_mineduc.png'

// Registra la descarga en la bitácora de auditoría (no bloquea la exportación si falla)
function registrarDescarga(tipo, descripcion) {
  api.post('/auditoria/descarga', { tipo, descripcion }).catch(() => {})
}

// ── Paleta institucional (azul marino) ───────────────────────────────────────
const NAVY      = [31, 56, 100]   // #1F3864
const NAVY_DARK = [17, 32, 61]    // #11203D
const GOLD      = [197, 160, 89]  // acento dorado
const SLATE     = [90, 110, 140]
const STEEL     = [120, 150, 180]
const SAGE      = [110, 150, 120]
const PALETTE   = [GOLD, SLATE, STEEL, SAGE, [150, 120, 170], [180, 140, 100]]

// ── Carga una imagen (logo) como dataURL para usarla en jsPDF ────────────────
function loadImageData(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({ dataUrl: canvas.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// Dibuja la franja de encabezado institucional con logos en un PDF
function drawPdfHeader(doc, { sigec, mineduc, title, subtitle, barH = 22, logoH = 13, titleSize = 13 }) {
  const W = doc.internal.pageSize.getWidth()
  const PAD = 12

  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, barH, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(0, barH, W, 1, 'F')

  if (sigec) {
    const w = logoH * (sigec.w / sigec.h)
    doc.addImage(sigec.dataUrl, 'PNG', PAD, (barH - logoH) / 2, w, logoH)
  }
  if (mineduc) {
    const w = logoH * (mineduc.w / mineduc.h)
    doc.addImage(mineduc.dataUrl, 'PNG', W - PAD - w, (barH - logoH) / 2, w, logoH)
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(titleSize)
  doc.setFont('helvetica', 'bold')
  doc.text(title, W / 2, barH * 0.45, { align: 'center' })
  if (subtitle) {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, W / 2, barH * 0.8, { align: 'center' })
  }
}

// ── Columnas para Excel agrupadas por sección (Información General / Niña / Establecimiento / Situación Educativa)
const GRUPOS_EXCEL = [
  { label: 'Información General', cols: ['No. Caso', 'Fecha Ingreso', 'Estado', 'No. Notificación', 'Queja'] },
  { label: 'Datos de la Niña',     cols: ['CUI', 'Nombre Completo', 'Edad', 'Dirección', 'Departamento', 'Municipio', 'Pueblo', 'Comunidad Lingüística'] },
  { label: 'Establecimiento',      cols: ['Institución', 'Centro Educativo', 'Código UDI', 'Área', 'Jornada', 'Sector'] },
  { label: 'Situación Educativa',  cols: ['Grado', 'Nivel', 'Status Sistema', 'Resultado', 'Código Personal'] },
]

// Colores institucionales por sección (tonos de azul marino)
const GRUPO_COLORES = {
  'Información General': '203864',
  'Datos de la Niña':     '2E5395',
  'Establecimiento':      '4472C4',
  'Situación Educativa':  '1F3864',
}

// ── Convierte un caso a fila de datos, en el mismo orden que GRUPOS_EXCEL ────
function casoAFilaExcel(caso) {
  const nina   = caso.nina || {}
  const hist   = (nina.historialEducativo || [])[0] || {}
  const centro = hist.centroEducativo || {}
  const dept   = nina.municipio?.departamento?.nombre
              || caso.departamental?.departamento?.nombre || ''
  const mun    = nina.municipio?.nombre || ''
  return [
    // Información General
    caso.numero_caso     || '',
    caso.fecha_ingreso   || '',
    caso.estado          || '',
    caso.no_notificacion || '',
    caso.queja           || '',
    // Datos de la Niña
    nina.cui                           || '',
    nina.nombre_completo               || '',
    nina.edad                          || '',
    nina.direccion                     || '',
    dept,
    mun,
    nina.pueblo?.nombre                || '',
    nina.comunidadLinguistica?.nombre  || '',
    // Establecimiento
    caso.institucion     || '',
    centro.nombre        || '',
    centro.codigo_udi    || '',
    centro.area          || '',
    centro.jornada       || '',
    centro.sector        || '',
    // Situación Educativa
    hist.grado           || '',
    hist.nivel           || '',
    hist.status_actual   || '',
    hist.resultado       || '',
    hist.codigo_personal || '',
  ]
}

// ── Convierte un caso a fila de datos (orden plano, usado por el PDF) ───────
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
  const flatCols  = GRUPOS_EXCEL.flatMap(g => g.cols)
  const totalCols = flatCols.length
  const filas     = casos.map(casoAFilaExcel)

  // Fila de título + fila de grupos + fila de columnas + datos
  const tituloRow = [`Base de Datos de Casos de Embarazos en Niñas — SIGEC, MINEDUC Guatemala (Generado: ${new Date().toLocaleDateString('es-GT', { dateStyle: 'long' })})`]
  const grupoRow  = []
  GRUPOS_EXCEL.forEach(g => { grupoRow.push(g.label); for (let i = 1; i < g.cols.length; i++) grupoRow.push('') })

  const ws = XLSX.utils.aoa_to_sheet([tituloRow, grupoRow, flatCols, ...filas])

  // Combinar celdas: título (toda la fila) y cada grupo de encabezado
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }]
  let colIdx = 0
  GRUPOS_EXCEL.forEach(g => {
    if (g.cols.length > 1) {
      ws['!merges'].push({ s: { r: 1, c: colIdx }, e: { r: 1, c: colIdx + g.cols.length - 1 } })
    }
    colIdx += g.cols.length
  })

  // Estilo: fila de título
  for (let c = 0; c < totalCols; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })]
    if (cell) {
      cell.s = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '11203D' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      }
    }
  }

  // Estilo: fila de grupos (cada sección con su tono institucional)
  colIdx = 0
  GRUPOS_EXCEL.forEach(g => {
    for (let i = 0; i < g.cols.length; i++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 1, c: colIdx + i })]
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: GRUPO_COLORES[g.label] } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        }
      }
    }
    colIdx += g.cols.length
  })

  // Estilo: fila de encabezados de columna (azul institucional claro + texto azul marino)
  for (let c = 0; c < totalCols; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 2, c })]
    if (cell) {
      cell.s = {
        font: { bold: true, sz: 10, color: { rgb: '1F3864' } },
        fill: { fgColor: { rgb: 'D9E2F3' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          bottom: { style: 'thin', color: { rgb: '1F3864' } },
        },
      }
    }
  }

  // Ancho de columnas automático (más anchas para que el encabezado no se corte)
  ws['!cols'] = flatCols.map((h, i) => {
    const maxLen = Math.max(h.length, ...filas.map(r => String(r[i] ?? '').length))
    return { wch: Math.max(Math.min(maxLen + 4, 40), 14) }
  })

  ws['!rows'] = [{ hpt: 22 }, { hpt: 20 }, { hpt: 32 }] // títulos / grupos / encabezados

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Casos')

  // Hoja de resumen
  const totalCasos = casos.length
  const porEstado = {
    verificadosSire:   casos.filter(c => c.estado === 'Verificados en el SIRE').length,
    sinVerificarSire:  casos.filter(c => c.estado === 'sin Verificar en el SIRE').length,
    verificadosQuejas: casos.filter(c => c.estado === 'Verificados en el Sistema de Quejas, Comentarios o Sugerencias').length,
    sinQuejas:         casos.filter(c => c.estado === 'sin Quejas').length,
  }
  const resumenRows = [
    ['Reporte SIGEC — MINEDUC Guatemala'],
    [`Generado: ${new Date().toLocaleDateString('es-GT', { dateStyle: 'full' })}`],
    [],
    ['RESUMEN DE CASOS'],
    ['Total de casos',                                                 totalCasos],
    ['Verificados en el SIRE',                                         porEstado.verificadosSire],
    ['Sin Verificar en el SIRE',                                       porEstado.sinVerificarSire],
    ['Verificados en el Sistema de Quejas, Comentarios o Sugerencias',  porEstado.verificadosQuejas],
    ['Sin Quejas',                                                     porEstado.sinQuejas],
  ]
  const wsRes = XLSX.utils.aoa_to_sheet(resumenRows)
  wsRes['!cols'] = [{ wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen')

  const hoy = new Date().toLocaleDateString('es-GT').replace(/\//g, '-')
  XLSX.writeFile(wb, `${nombre}_${hoy}.xlsx`)

  registrarDescarga('excel', `Exportó "${nombre}" a Excel (${casos.length} casos)`)
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
export function exportarPDF(casos, nombre = 'SIGEC_Casos', resumenFiltros = '', { pixelarNombres = false } = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210
  const PAD = 12
  const hoy = new Date().toLocaleDateString('es-GT', { dateStyle: 'full' })
  const hoyCorto = new Date().toLocaleDateString('es-GT').replace(/\//g, '-')

  // ── Métricas ──────────────────────────────────────────────────────────────
  const total              = casos.length
  const verificadosSire    = casos.filter(c => c.estado === 'Verificados en el SIRE').length
  const sinVerificarSire   = casos.filter(c => c.estado === 'sin Verificar en el SIRE').length
  const verificadosQuejas  = casos.filter(c => c.estado === 'Verificados en el Sistema de Quejas, Comentarios o Sugerencias').length
  const sinQuejas          = casos.filter(c => c.estado === 'sin Quejas').length

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

  // Estado donut segments — paleta institucional (azul + gris)
  const estadoSegs = [
    { l: 'Verificados SIRE',     v: verificadosSire,   c: NAVY_DARK },
    { l: 'Sin Verificar SIRE',   v: sinVerificarSire,  c: STEEL },
    { l: 'Verificados Quejas',   v: verificadosQuejas, c: SLATE },
    { l: 'Sin Quejas',           v: sinQuejas,         c: NAVY },
  ]

  // ── PÁGINA 1: DASHBOARD DE GRÁFICAS ──────────────────────────────────────
  // Header
  doc.setFillColor(...NAVY)
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
    doc.setFillColor(240, 242, 247)
    doc.roundedRect(PAD, curY, W - PAD * 2, 7, 1, 1, 'F')
    doc.setFontSize(6.5)
    doc.setTextColor(...NAVY_DARK)
    doc.text(`Filtros aplicados: ${resumenFiltros}`, PAD + 2, curY + 4.5)
    curY += 10
  }

  // ── Stat boxes — paleta institucional (azul + gris) ────────────────────────
  const boxes = [
    { label: 'Total',                  value: total,             color: NAVY },
    { label: 'Verificados SIRE',       value: verificadosSire,   color: STEEL },
    { label: 'Sin Verificar SIRE',     value: sinVerificarSire,  color: SLATE  },
    { label: 'Verificados Quejas',     value: verificadosQuejas, color: NAVY_DARK },
    { label: 'Sin Quejas',             value: sinQuejas,         color: [170, 180, 195] },
  ]
  const boxW = 50, boxH = 20, boxGap = 3
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

  const donaR = 16
  const donaCX = COL1_X + COL1_W / 2
  const donaCY = curY + 6 + donaR
  drawDonut(doc, donaCX, donaCY, donaR, estadoSegs)

  // Total en el centro
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80)
  doc.text(String(total), donaCX, donaCY + 1.5, { align: 'center' })
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.text('total', donaCX, donaCY + 6, { align: 'center' })

  // Leyenda — debajo de la dona, sin solaparse
  let ly = donaCY + donaR + 6
  estadoSegs.forEach(seg => {
    const pct = total > 0 ? ((seg.v / total) * 100).toFixed(1) : '0.0'
    doc.setFillColor(...seg.c)
    doc.roundedRect(COL1_X + 8, ly, 4, 4, 0.5, 0.5, 'F')
    doc.setFontSize(6.5)
    doc.setTextColor(60)
    doc.setFont('helvetica', 'normal')
    doc.text(`${seg.l}: ${seg.v} (${pct}%)`, COL1_X + 14, ly + 3.2)
    ly += 6
  })

  // ── Columna 2: Mensual (barras verticales) ─────────────────────────────────
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60)
  doc.text('Casos por Mes', COL2_X, curY)
  drawVBars(doc, COL2_X, curY + 4, COL2_W, 50, porMes, NAVY)

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
    drawHBar(doc, COL3_X + 12, by, barMaxW, 7, fillW, STEEL)
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
      drawHBar(doc, COL2_X + 30, by, dBarMaxW, 6, fillW, NAVY)
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

    doc.setFillColor(...NAVY)
    doc.rect(0, 0, W, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Listado de Casos', PAD, 10)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${total} registros`, W - PAD, 10, { align: 'right' })

    const colsPDF = ['No. Caso', pixelarNombres ? 'Nombre (protegido)' : 'Nombre', 'Estado', 'Fecha Ingreso', 'Depto.', 'Municipio', 'Edad', 'Grado', 'Nivel', 'Centro Educativo', 'Queja']
    const idxPDF  = [0, 2, 3, 4, 8, 9, 12, 14, 15, 18, 5]
    const body    = casos.map(c => {
      const f = casoAFila(c)
      const row = idxPDF.map(i => f[i])
      if (pixelarNombres && row[1]) {
        const inicial = String(row[1]).charAt(0).toUpperCase()
        row[1] = `${inicial}. ████████████`
      }
      return row
    })

    autoTable(doc, {
      head: [colsPDF],
      body,
      startY: 18,
      styles: { fontSize: 6.5, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [240, 242, 247] },
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

  registrarDescarga('pdf', `Exportó "${nombre}" a PDF (${total} casos)`)
}

// ────────────────────────────────────────────────────────────────────────────
// AUDITORÍA — Etiquetas y formato
// ────────────────────────────────────────────────────────────────────────────
const ACCION_LABELS = {
  crear_caso:         'Caso creado',
  actualizar_caso:    'Caso actualizado',
  crear_usuario:      'Usuario creado',
  actualizar_usuario: 'Usuario actualizado',
  activar_usuario:    'Usuario activado',
  desactivar_usuario: 'Usuario desactivado',
  descargar_pdf:      'Descarga de PDF',
  descargar_excel:    'Descarga de Excel',
  carga_masiva:       'Carga masiva',
}

const accionLabel = (v) => ACCION_LABELS[v] || v

function formatFechaHora(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'medium' })
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORTAR AUDITORÍA — EXCEL
// ────────────────────────────────────────────────────────────────────────────
export function exportarAuditoriaExcel(registros, filtrosTexto = '') {
  const COLS = ['Fecha', 'Hora', 'Usuario', 'Correo', 'Acción', 'Descripción']

  const filas = registros.map(r => {
    const fecha = r.createdAt ? new Date(r.createdAt) : null
    return [
      fecha ? fecha.toLocaleDateString('es-GT') : '',
      fecha ? fecha.toLocaleTimeString('es-GT') : '',
      r.usuario?.name  || 'Sistema',
      r.usuario?.email || '',
      accionLabel(r.accion),
      r.descripcion || '',
    ]
  })

  const totalCols = COLS.length
  const tituloRow = [`SIGEC — Bitácora de Auditoría — Ministerio de Educación de Guatemala (Generado: ${new Date().toLocaleString('es-GT', { dateStyle: 'long', timeStyle: 'short' })})`]

  const ws = XLSX.utils.aoa_to_sheet([tituloRow, COLS, ...filas])

  // Combinar la fila de título a lo ancho de toda la tabla
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }]

  // Estilo: fila de título (azul marino oscuro)
  for (let c = 0; c < totalCols; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })]
    if (cell) {
      cell.s = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '11203D' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      }
    }
  }

  // Estilo: fila de encabezados (azul marino + letras blancas)
  for (let c = 0; c < totalCols; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 1, c })]
    if (cell) {
      cell.s = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1F3864' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      }
    }
  }

  // Ancho de columnas automático (más anchas para que el encabezado no se corte)
  ws['!cols'] = COLS.map((h, i) => {
    const maxLen = Math.max(h.length, ...filas.map(r => String(r[i] ?? '').length))
    return { wch: Math.max(Math.min(maxLen + 4, 60), 14) }
  })
  ws['!rows'] = [{ hpt: 22 }, { hpt: 32 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Auditoría')

  // Hoja de resumen
  const porAccion = {}
  registros.forEach(r => { porAccion[r.accion] = (porAccion[r.accion] || 0) + 1 })

  const resumenRows = [
    ['SIGEC — Bitácora de Auditoría'],
    ['Ministerio de Educación de Guatemala'],
    [`Generado: ${new Date().toLocaleString('es-GT', { dateStyle: 'full', timeStyle: 'short' })}`],
    [],
    ...(filtrosTexto ? [['Filtros aplicados', filtrosTexto], []] : []),
    ['RESUMEN'],
    ['Total de registros', registros.length],
    ...Object.entries(porAccion).map(([accion, cant]) => [accionLabel(accion), cant]),
  ]
  const wsRes = XLSX.utils.aoa_to_sheet(resumenRows)
  wsRes['!cols'] = [{ wch: 30 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen')

  const hoy = new Date().toLocaleDateString('es-GT').replace(/\//g, '-')
  XLSX.writeFile(wb, `SIGEC_Auditoria_${hoy}.xlsx`)

  registrarDescarga('excel', `Exportó la bitácora de auditoría a Excel (${registros.length} registros)${filtrosTexto ? ` — ${filtrosTexto}` : ''}`)
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORTAR AUDITORÍA — PDF
// ────────────────────────────────────────────────────────────────────────────
export async function exportarAuditoriaPDF(registros, filtrosTexto = '', usuario = null) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210
  const PAD = 12
  const hoy = new Date().toLocaleDateString('es-GT', { dateStyle: 'full' })
  const hoyCorto = new Date().toLocaleDateString('es-GT').replace(/\//g, '-')
  const ahora = new Date().toLocaleString('es-GT', { dateStyle: 'long', timeStyle: 'short' })
  const total = registros.length

  const [sigec, mineduc] = await Promise.all([
    loadImageData(sigecLogoUrl),
    loadImageData(mineducLogoUrl),
  ])

  // ── Métricas por acción ───────────────────────────────────────────────────
  const porAccion = {}
  registros.forEach(r => { porAccion[r.accion] = (porAccion[r.accion] || 0) + 1 })
  const resumenAcciones = Object.entries(porAccion)
    .sort((a, b) => b[1] - a[1])
    .map(([accion, cant]) => ({ l: accionLabel(accion), v: cant }))

  // ── Encabezado con logos ──────────────────────────────────────────────────
  drawPdfHeader(doc, {
    sigec, mineduc,
    title: 'SIGEC — Bitácora de Auditoría',
    subtitle: 'Ministerio de Educación de Guatemala',
  })

  let curY = 27

  // ── Bloque de información de generación/descarga ─────────────────────────
  const infoH = 16
  doc.setFillColor(240, 242, 247)
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.2)
  doc.roundedRect(PAD, curY, W - PAD * 2, infoH, 1, 1, 'FD')

  const colA = PAD + 3
  const colB = W / 2 + 5
  doc.setFontSize(7)
  doc.setTextColor(...NAVY_DARK)

  doc.setFont('helvetica', 'bold')
  doc.text('Documento generado:', colA, curY + 5.5)
  doc.setFont('helvetica', 'normal')
  doc.text(ahora, colA + 32, curY + 5.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Generado por:', colA, curY + 11)
  doc.setFont('helvetica', 'normal')
  doc.text(usuario ? `${usuario.name || ''}${usuario.email ? ` (${usuario.email})` : ''}`.trim() : 'No especificado', colA + 32, curY + 11)

  doc.setFont('helvetica', 'bold')
  doc.text('Total de registros:', colB, curY + 5.5)
  doc.setFont('helvetica', 'normal')
  doc.text(String(total), colB + 32, curY + 5.5)

  doc.setFont('helvetica', 'bold')
  doc.text('Filtros aplicados:', colB, curY + 11)
  doc.setFont('helvetica', 'normal')
  doc.text(filtrosTexto || 'Ninguno', colB + 32, curY + 11)

  curY += infoH + 6

  // ── Stat boxes: total + top acciones ────────────────────────────────────────
  const boxes = [
    { label: 'Total registros', value: total, color: NAVY },
    ...resumenAcciones.slice(0, 5).map((a, i) => ({
      label: a.l, value: a.v, color: PALETTE[i % PALETTE.length],
    })),
  ]
  const boxW = 42, boxH = 20, boxGap = 3
  const totalBoxW = boxes.length * boxW + (boxes.length - 1) * boxGap
  const bx0 = (W - totalBoxW) / 2
  boxes.forEach((b, i) => drawStatBox(doc, bx0 + i * (boxW + boxGap), curY, boxW, boxH, b.value, b.label, b.color))
  curY += boxH + 8

  // Línea divisoria formal
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.3)
  doc.line(PAD, curY, W - PAD, curY)

  // Pie de página 1
  doc.setFontSize(6)
  doc.setTextColor(140, 140, 140)
  doc.text(`SIGEC — MINEDUC  ·  Documento generado el ${hoy}  ·  Página 1`, W / 2, H - 5, { align: 'center' })

  // ── PÁGINA 2+: TABLA DE REGISTROS ────────────────────────────────────────────
  doc.addPage()

  drawPdfHeader(doc, {
    sigec, mineduc,
    title: 'Detalle de Acciones Registradas',
    subtitle: `${total} registros`,
    barH: 16,
    logoH: 10,
    titleSize: 10,
  })

  const colsPDF = ['Fecha', 'Usuario', 'Correo', 'Acción', 'Descripción']
  const body = registros.map(r => [
    formatFechaHora(r.createdAt),
    r.usuario?.name  || 'Sistema',
    r.usuario?.email || '',
    accionLabel(r.accion),
    r.descripcion || '',
  ])

  autoTable(doc, {
    head: [colsPDF],
    body,
    startY: 19,
    styles: { fontSize: 6.5, cellPadding: 1.5, overflow: 'linebreak', textColor: [50, 50, 50], lineColor: [225, 228, 235], lineWidth: 0.1 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [240, 242, 247] },
    margin: { left: PAD, right: PAD },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 38 },
      2: { cellWidth: 50 },
      3: { cellWidth: 35, fontStyle: 'bold', textColor: NAVY_DARK },
    },
    didDrawPage: ({ pageNumber }) => {
      doc.setFontSize(6)
      doc.setTextColor(140, 140, 140)
      doc.text(
        `SIGEC — MINEDUC  ·  Página ${pageNumber}  ·  ${hoy}`,
        W / 2, H - 5, { align: 'center' }
      )
    }
  })

  doc.save(`SIGEC_Auditoria_${hoyCorto}.pdf`)

  registrarDescarga('pdf', `Exportó la bitácora de auditoría a PDF (${total} registros)${filtrosTexto ? ` — ${filtrosTexto}` : ''}`)
}
