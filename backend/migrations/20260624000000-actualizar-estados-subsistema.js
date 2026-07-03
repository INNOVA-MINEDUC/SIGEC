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

    // Nuevos campos para distinguir Subsistema Escolar vs. Extraescolar en el historial educativo
    await queryInterface.addColumn('historial_educativo', 'subsistema', {
      type: Sequelize.STRING(50),
      allowNull: true,
    })
    await queryInterface.addColumn('historial_educativo', 'programa', {
      type: Sequelize.STRING(255),
      allowNull: true,
    })
    await queryInterface.addColumn('historial_educativo', 'etapa', {
      type: Sequelize.STRING(100),
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('historial_educativo', 'etapa')
    await queryInterface.removeColumn('historial_educativo', 'programa')
    await queryInterface.removeColumn('historial_educativo', 'subsistema')

    await queryInterface.changeColumn('casos_embarazo', 'estado', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'pendiente',
    })
  },
}
