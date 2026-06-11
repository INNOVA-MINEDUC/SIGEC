'use strict'

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditorias', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      accion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entidad: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      entidad_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('auditorias')
  },
}
