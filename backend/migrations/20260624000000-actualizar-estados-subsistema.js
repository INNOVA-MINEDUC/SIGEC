'use strict'

export default {
  async up(queryInterface, Sequelize) {
    // El campo "estado" pasa de tres valores cortos (pendiente/faltante/completado)
    // a los cuatro estados institucionales solicitados, que son textos más largos.
    await queryInterface.changeColumn('casos_embarazo', 'estado', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'sin Verificar en el SIRE',
    })

    await queryInterface.sequelize.query(`
      UPDATE casos_embarazo SET estado = 'Verificados en el SIRE' WHERE estado = 'completado'
    `)
    await queryInterface.sequelize.query(`
      UPDATE casos_embarazo SET estado = 'sin Verificar en el SIRE' WHERE estado IN ('pendiente', 'faltante')
    `)

    // Nuevos campos para distinguir Subsistema Escolar vs. Extraescolar en el historial educativo.
    // Se agregan solo si no existen (la tabla pudo crearse antes vía sequelize.sync()).
    const columnas = await queryInterface.describeTable('historial_educativo')
    if (!columnas.subsistema) {
      await queryInterface.addColumn('historial_educativo', 'subsistema', {
        type: Sequelize.STRING(50),
        allowNull: true,
      })
    }
    if (!columnas.programa) {
      await queryInterface.addColumn('historial_educativo', 'programa', {
        type: Sequelize.STRING(255),
        allowNull: true,
      })
    }
    if (!columnas.etapa) {
      await queryInterface.addColumn('historial_educativo', 'etapa', {
        type: Sequelize.STRING(100),
        allowNull: true,
      })
    }
  },

  async down(queryInterface, Sequelize) {
    // Se quitan solo las columnas que realmente existen, para que el revert
    // no falle si la tabla ya no las tiene (estado inconsistente previo).
    const columnas = await queryInterface.describeTable('historial_educativo')
    for (const col of ['etapa', 'programa', 'subsistema']) {
      if (columnas[col]) {
        await queryInterface.removeColumn('historial_educativo', col)
      }
    }

    // Antes de reducir la columna a STRING(50) hay que revertir los valores
    // largos a los cortos originales; de lo contrario "Data too long".
    await queryInterface.sequelize.query(`
      UPDATE casos_embarazo SET estado = 'completado' WHERE estado LIKE 'Verificados%'
    `)
    await queryInterface.sequelize.query(`
      UPDATE casos_embarazo SET estado = 'pendiente' WHERE estado LIKE 'sin %'
    `)
    // Red de seguridad: cualquier valor que aún exceda 50 caracteres
    await queryInterface.sequelize.query(`
      UPDATE casos_embarazo SET estado = 'pendiente' WHERE CHAR_LENGTH(estado) > 50
    `)

    await queryInterface.changeColumn('casos_embarazo', 'estado', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'pendiente',
    })
  },
}
