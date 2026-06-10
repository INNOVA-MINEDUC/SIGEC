'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('roles', [
      {
        name: 'admin',
        description: 'Administrador del sistema',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'user',
        description: 'Usuario normal',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'moderator',
        description: 'Moderador',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('roles', null, {});
  },
};