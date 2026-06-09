'use strict'

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ninas', 'cui', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    })
  },

  async down(queryInterface, Sequelize) {
    // No se puede revertir a NOT NULL: el CUI es opcional por diseño.
    // El down deja la columna tal como está.
  },
}
