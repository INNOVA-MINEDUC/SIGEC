// Revisión controlada de casos cuya DIDEDUC no corresponde al departamento del
// centro educativo (regla de negocio: DIDEDUC del caso = DIDEDUC del
// departamento del centro).
//
// Uso (desde backend/):
//   node scripts/revisarDideducCasos.js                  → solo reporte, no cambia nada
//   node scripts/revisarDideducCasos.js --csv=salida.csv → además guarda el detalle
//   node scripts/revisarDideducCasos.js --aplicar        → corrige SOLO los casos sin
//                                                          ambigüedad y lo registra en
//                                                          la bitácora de auditoría
//
// Los casos cuyo centro está en un departamento con varias DIDEDUC (Guatemala,
// Quiché) no se corrigen solos: se listan para revisarlos desde Registro, que
// ahora pide elegir la DIDEDUC del departamento del centro.
import { writeFileSync } from 'node:fs'
import { sequelize } from '../config/database.js'
import '../models/Relations.js'
import CasoEmbarazo from '../models/CasoEmbarazo.js'
import { dideducSegunCentro } from '../helpers/dideduc.js'
import { registrarAuditoria } from '../utils/auditoria.js'

const aplicar = process.argv.includes('--aplicar')
const csv = process.argv.find(a => a.startsWith('--csv='))?.slice(6)

const [filas] = await sequelize.query(`
  SELECT c.id, c.numero_caso, c.departamental_id,
         d.nombre  AS dideduc_actual,  d.departamento_id AS depto_dideduc,
         ce.codigo_udi, ce.municipio_id AS municipio_centro, mc.nombre AS municipio_centro_nombre,
         dc.nombre AS depto_centro
  FROM casos_embarazo c
  JOIN historial_educativo h ON h.nina_id = c.nina_id
  JOIN centros_educativos ce ON ce.id = h.centro_educativo_id
  JOIN municipios mc         ON mc.id = ce.municipio_id
  JOIN departamentos dc      ON dc.id = mc.departamento_id
  LEFT JOIN departamentales d ON d.id = c.departamental_id
  ORDER BY c.id`)

const corregibles = [], ambiguos = []
for (const f of filas) {
  const r = await dideducSegunCentro(f.municipio_centro, f.departamental_id)
  if (r.ambigua) ambiguos.push({ ...f, opciones: r.opciones.map(o => o.nombre).join(' / ') })
  else if (r.departamental_id !== (f.departamental_id ? Number(f.departamental_id) : null)) {
    corregibles.push({ ...f, propuesta_id: r.departamental_id, propuesta: r.opciones.find(o => o.id === r.departamental_id)?.nombre })
  }
}

console.log(`Casos con centro educativo revisados: ${filas.length}`)
console.log(`  DIDEDUC coherente con el centro:     ${filas.length - corregibles.length - ambiguos.length}`)
console.log(`  Corregibles sin ambigüedad:          ${corregibles.length}`)
console.log(`  Requieren revisión manual:           ${ambiguos.length}  (departamento con varias DIDEDUC)`)

const resumen = (lista) => Object.entries(lista.reduce((m, f) => {
  const k = `${f.dideduc_actual ?? '(sin DIDEDUC)'} → ${f.propuesta ?? f.opciones}`
  m[k] = (m[k] || 0) + 1
  return m
}, {})).sort((a, b) => b[1] - a[1])
if (corregibles.length) {
  console.log('\nCorrección propuesta (DIDEDUC actual → DIDEDUC del centro):')
  for (const [k, n] of resumen(corregibles)) console.log(`  ${String(n).padStart(4)}  ${k}`)
}
if (ambiguos.length) {
  console.log('\nRevisión manual (elegir una DIDEDUC del departamento del centro):')
  for (const f of ambiguos) console.log(`  caso ${f.numero_caso}: ${f.dideduc_actual ?? '(sin DIDEDUC)'}; centro en ${f.municipio_centro_nombre}, ${f.depto_centro} → ${f.opciones}`)
}

if (csv) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lineas = [['caso_id', 'numero_caso', 'dideduc_actual', 'codigo_udi', 'municipio_centro', 'departamento_centro', 'accion', 'dideduc_propuesta'].join(',')]
  for (const f of corregibles) lineas.push([f.id, f.numero_caso, f.dideduc_actual, f.codigo_udi, f.municipio_centro_nombre, f.depto_centro, 'corregir', f.propuesta].map(esc).join(','))
  for (const f of ambiguos)    lineas.push([f.id, f.numero_caso, f.dideduc_actual, f.codigo_udi, f.municipio_centro_nombre, f.depto_centro, 'revisar', f.opciones].map(esc).join(','))
  writeFileSync(csv, '﻿' + lineas.join('\r\n'))
  console.log(`\nDetalle guardado en ${csv}`)
}

if (!aplicar) {
  console.log('\nNo se modificó ningún registro. Para corregir los casos sin ambigüedad ejecute con --aplicar.')
} else if (corregibles.length) {
  await sequelize.transaction(async (t) => {
    for (const f of corregibles) {
      await CasoEmbarazo.update({ departamental_id: f.propuesta_id }, { where: { id: f.id }, transaction: t })
    }
  })
  for (const f of corregibles) {
    await registrarAuditoria({
      accion: 'actualizar_caso', entidad: 'CasoEmbarazo', entidad_id: f.id,
      descripcion: `Corrección de DIDEDUC del caso ${f.numero_caso}: ${f.dideduc_actual ?? '(sin DIDEDUC)'} → ${f.propuesta} (departamento del centro educativo)`,
    })
  }
  console.log(`\nCorregidos ${corregibles.length} casos (registrado en la bitácora de auditoría).`)
}

await sequelize.close()
