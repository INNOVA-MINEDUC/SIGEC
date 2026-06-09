'use strict'

// Migra ninas: convierte pueblo_id y comunidad_linguistica_id (FKs)
// a pueblo y comunidad_linguistica (texto libre).
// Idempotente: verifica qué columnas existen antes de operar.
export default {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('ninas')

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

    if (cols.pueblo_id) {
      await queryInterface.removeColumn('ninas', 'pueblo_id')
    }
    if (cols.comunidad_linguistica_id) {
      await queryInterface.removeColumn('ninas', 'comunidad_linguistica_id')
    }
    if (!cols.pueblo) {
      await queryInterface.addColumn('ninas', 'pueblo', {
        type: Sequelize.STRING(100),
        allowNull: true,
        after: 'municipio_id',
      })
    }
    if (!cols.comunidad_linguistica) {
      await queryInterface.addColumn('ninas', 'comunidad_linguistica', {
        type: Sequelize.STRING(100),
        allowNull: true,
        after: 'pueblo',
      })
    }

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
  },

  async down(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('ninas')

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

    if (cols.comunidad_linguistica) {
      await queryInterface.removeColumn('ninas', 'comunidad_linguistica')
    }
    if (cols.pueblo) {
      await queryInterface.removeColumn('ninas', 'pueblo')
    }
    if (!cols.pueblo_id) {
      await queryInterface.addColumn('ninas', 'pueblo_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      })
    }
    if (!cols.comunidad_linguistica_id) {
      await queryInterface.addColumn('ninas', 'comunidad_linguistica_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      })
    }

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
  },
}
