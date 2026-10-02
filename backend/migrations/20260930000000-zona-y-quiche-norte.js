'use strict'

// 1) Agrega la columna "zona" (zona de la Ciudad de Guatemala) a ninas y
//    centros_educativos. Solo se usa cuando departamento = municipio = Guatemala.
// 2) Crea la DIDEDUC "Quiché Norte" y reasigna a ella los casos cuyo municipio
//    (de residencia de la niña) es Ixcán.
const NOMBRE = 'Dideduc Quiché Norte'

export default {
  async up(queryInterface, Sequelize) {
    for (const tabla of ['ninas', 'centros_educativos']) {
      const cols = await queryInterface.describeTable(tabla)
      if (!cols.zona) {
        await queryInterface.addColumn(tabla, 'zona', { type: Sequelize.TINYINT, allowNull: true })
      }
    }

    const [quiche] = await queryInterface.sequelize.query(
      `SELECT id FROM departamentos WHERE LOWER(nombre) IN ('quiché','quiche') LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    if (!quiche) throw new Error('Departamento Quiché no encontrado')

    await queryInterface.sequelize.query(
      `INSERT INTO departamentales (departamento_id, nombre, createdAt, updatedAt)
       SELECT :depto, :nombre, NOW(), NOW() FROM DUAL
       WHERE NOT EXISTS (SELECT 1 FROM departamentales WHERE nombre = :nombre)`,
      { replacements: { depto: quiche.id, nombre: NOMBRE } }
    )

    await queryInterface.sequelize.query(
      `UPDATE casos_embarazo c
         JOIN ninas n      ON n.id = c.nina_id
         JOIN municipios m ON m.id = n.municipio_id
         JOIN departamentales d ON d.nombre = :nombre
          SET c.departamental_id = d.id
        WHERE LOWER(m.nombre) IN ('ixcán','ixcan')`,
      { replacements: { nombre: NOMBRE } }
    )
  },

  async down(queryInterface) {
    // Devuelve los casos de Quiché Norte a la DIDEDUC Quiché antes de borrarla.
    await queryInterface.sequelize.query(
      `UPDATE casos_embarazo c
         JOIN departamentales qn ON qn.id = c.departamental_id AND qn.nombre = :nombre
         JOIN departamentales q  ON q.nombre = 'Dideduc Quiché'
          SET c.departamental_id = q.id`,
      { replacements: { nombre: NOMBRE } }
    )
    await queryInterface.sequelize.query(`DELETE FROM departamentales WHERE nombre = :nombre`, { replacements: { nombre: NOMBRE } })
    for (const tabla of ['ninas', 'centros_educativos']) {
      const cols = await queryInterface.describeTable(tabla)
      if (cols.zona) await queryInterface.removeColumn(tabla, 'zona')
    }
  },
}
