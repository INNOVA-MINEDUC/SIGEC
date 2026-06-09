'use strict';

import bcrypt from 'bcrypt';

export default {
  async up(queryInterface, Sequelize) {

    const password = await bcrypt.hash('Guatemala2024!', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrador',
        email: 'admin@mineduc.edu.gt',
        password,
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
