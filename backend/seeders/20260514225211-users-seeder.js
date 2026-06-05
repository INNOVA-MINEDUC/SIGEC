'use strict';

import bcrypt from 'bcrypt';

export default {
  async up(queryInterface, Sequelize) {

    const password = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password,
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'Usuario',
        email: 'user@gmail.com',
        password,
        roleId: 2,
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